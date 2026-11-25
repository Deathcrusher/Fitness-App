import { mergeFitflowData, sameFitflowData } from './cloudMerge'

// Private, one-time cloud backup. The existing localStorage data is never deleted or overwritten.
const API_URL = 'https://ifvlhfhyeqgodvhbdxbv.supabase.co'
const PUBLIC_KEY = 'sb_publishable_RQvUolij_etM5fUV8_MnDg_x40yft-h'
const AUTH_KEY = 'ffcloud-auth-v1' // Outside fitflow-* so auth tokens never enter FitFlow JSON exports.

async function api(path, { method = 'GET', token, body, headers = {} } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const response = await fetch(API_URL + path, {
      method,
      signal: controller.signal,
      headers: {
        apikey: PUBLIC_KEY,
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      const error = new Error(payload?.msg || payload?.error_description || payload?.message || payload?.error || 'Cloud-Anfrage fehlgeschlagen.')
      error.status = response.status
      throw error
    }
    return payload
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Cloud nicht erreichbar. Deine lokalen Daten bleiben erhalten; wir versuchen es beim nächsten Mal erneut.')
    throw error
  } finally {
    clearTimeout(timer)
  }
}

function storeAuth(session) {
  if (session?.access_token && session?.refresh_token) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + Number(session.expires_in || 3600),
      user: { id: session.user?.id, email: session.user?.email },
    }))
  }
}

export function currentCloudUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null')?.user || null } catch { return null }
}

// Registration is deliberately unavailable in the application.
export async function cloudSignUp() { throw new Error('FitFlow ist privat. Neue Konten werden nur vom Administrator freigegeben.') }

export async function cloudSignIn(email, password) {
  const session = await api('/auth/v1/token?grant_type=password', {
    method: 'POST', body: { email, password },
  })
  if (!session?.access_token) throw new Error('Bitte bestätige zuerst deine E-Mail-Adresse.')
  await assertApproved(session.access_token, session.user)
  checkAccount({user:session.user})
  storeAuth(session)
  window.dispatchEvent(new Event('fitflow-cloud-auth'))
  return session.user
}

export async function cloudSignOut() {
  let token
  try {token=JSON.parse(localStorage.getItem(AUTH_KEY)||'null')?.access_token}catch{/* invalid session */}
  localStorage.removeItem(AUTH_KEY)
  window.dispatchEvent(new Event('fitflow-cloud-auth'))
  if(token)try{await api('/auth/v1/logout?scope=local',{method:'POST',token})}catch{/* local logout remains effective */}
}
async function assertApproved(token,user){
  if(!user?.id||!user?.email_confirmed_at){const e=new Error('Anmeldung nicht freigegeben.');e.status=403;throw e}
  const rows=await api('/rest/v1/fitflow_allowed_users?select=user_id&limit=1',{token})
  if(!Array.isArray(rows)||!rows.some(row=>row.user_id===user.id)){const e=new Error('Anmeldung nicht freigegeben.');e.status=403;throw e}
  return user
}
export async function verifyCloudAccess(){
  const auth=await validAuth()
  const user=await api('/auth/v1/user',{token:auth.access_token})
  await assertApproved(auth.access_token,user)
  checkAccount({user})
  return user
}

async function validAuth() {
  let auth
  try { auth = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null') } catch { /* ignored */ }
  if (!auth?.refresh_token) throw new Error('Bitte zuerst mit deinem Cloud-Konto anmelden.')
  if (auth.expires_at && auth.expires_at > Date.now() / 1000 + 90) return auth
  const session = await api('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST', body: { refresh_token: auth.refresh_token },
  })
  if(!currentCloudUser()||currentCloudUser().id!==auth.user?.id)throw new Error('Sitzung wurde beendet.')
  storeAuth(session)
  return JSON.parse(localStorage.getItem(AUTH_KEY))
}

// Download first, only insert when no backup exists. The DB grants no UPDATE/DELETE.
export async function initialCloudBackup() {
  const auth = await validAuth()
  const existing = await api('/rest/v1/fitflow_initial_backups?select=created_at&limit=1', {
    token: auth.access_token,
  })
  if (existing?.length) return { exists: true, createdAt: existing[0].created_at }
  const values = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('fitflow-')) values[key] = localStorage.getItem(key)
  }
  if (!Object.keys(values).length) throw new Error('Keine FitFlow-Daten zum Sichern gefunden.')
  const snapshot = {
    app: 'FitFlow',
    exportedAt: new Date().toISOString(),
    data: values,
  }
  try {
    await api('/rest/v1/fitflow_initial_backups', {
      method: 'POST',
      token: auth.access_token,
      headers: { Prefer: 'return=minimal' },
      body: { user_id: auth.user.id, data: snapshot, format_version: 1 },
    })
  } catch (error) {
    if (error.status === 409) return { exists: true }
    throw error
  }
  const verified = await api('/rest/v1/fitflow_initial_backups?select=created_at&limit=1', {
    token: auth.access_token,
  })
  if (!verified?.length) throw new Error('Upload wurde nicht bestätigt. Bitte vor weiteren Änderungen das lokale Backup behalten.')
  return { saved: true, createdAt: verified[0].created_at }
}

const CLOUD_STATUS_KEY = 'ffcloud-sync-status-v1'
const BOUND_ACCOUNT_KEY = 'ffcloud-bound-account-v1'

export function cloudStatus() {
  try { return JSON.parse(localStorage.getItem(CLOUD_STATUS_KEY) || 'null') } catch { return null }
}
function publishStatus(status, message) {
  const entry = { status, message, at: new Date().toISOString() }
  localStorage.setItem(CLOUD_STATUS_KEY, JSON.stringify(entry))
  window.dispatchEvent(new CustomEvent('fitflow-cloud-status', { detail: entry }))
}
function checkAccount(auth) {
  const bound = localStorage.getItem(BOUND_ACCOUNT_KEY)
  if (bound && bound !== auth.user?.id) {
    throw new Error('Dieser Browser wurde bereits mit einem anderen Cloud-Konto synchronisiert. Bitte verwende dein ursprüngliches FitFlow-Konto, um eine Vermischung von Trainingsdaten zu vermeiden.')
  }
  if (auth.user?.id && !bound) localStorage.setItem(BOUND_ACCOUNT_KEY, auth.user.id)
}
export function collectFitflowData() {
  const out = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('fitflow-')) out[key] = localStorage.getItem(key)
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)))
}

async function cloudSnapshots(auth) {
  const rows = await api('/rest/v1/fitflow_sync_snapshots?select=id,data&order=id.desc&limit=1', { token: auth.access_token })
  if (rows?.length) {
    // Each snapshot is complete. Never re-add intentionally corrected/removed entries
    // from older revisions, which remain available as immutable backups.
    const latest = rows[0]
    if (latest.data?.app !== 'FitFlow' || !latest.data?.data || typeof latest.data.data !== 'object') {
      throw new Error('Ungültiger Cloud-Datenstand; automatischer Upload wurde gestoppt.')
    }
    return { id: latest.id, data: latest.data.data }
  }
  // Support the existing one-time backup until the first automatic revision exists.
  const initial = await api('/rest/v1/fitflow_initial_backups?select=data&limit=1', { token: auth.access_token })
  return { id: null, data: initial?.[0]?.data?.data || {} }
}

/** On page startup, merge the cloud's history into local storage BEFORE React loads it. */
export async function bootstrapCloudSync() {
  if (!currentCloudUser()) return
  try {
    const auth = await validAuth()
    checkAccount(auth)
    const remote = await cloudSnapshots(auth)
    const local = collectFitflowData()
    // Never replace existing data wholesale. Historical lists and exercise logs are unioned.
    const merged = mergeFitflowData(local, remote.data)
    if (!sameFitflowData(merged, local)) {
      // Keep the pre-import state for diagnostic recovery.
      localStorage.setItem('ffcloud-before-import-v1', JSON.stringify({ exportedAt: new Date().toISOString(), data: local }))
      for (const [key, value] of Object.entries(merged)) {
        if (local[key] !== value) localStorage.setItem(key, value)
      }
      publishStatus('merged', 'Cloud-Daten mit lokalen Daten zusammengeführt.')
    }
  } catch (error) {
    publishStatus('error', 'Cloud-Abgleich beim Start fehlgeschlagen: ' + error.message)
  }
}

let inFlight = null
/** Append-only cloud backup, safe to retry; never modifies the initial backup. */
export function syncFitflowNow() {
  if (inFlight) return inFlight
  inFlight = (async () => {
    if (!currentCloudUser()) return { skipped: true }
    try {
      const auth = await validAuth()
      checkAccount(auth)
      const remote = await cloudSnapshots(auth)
      const data = mergeFitflowData(collectFitflowData(), remote.data)
      if (sameFitflowData(data, remote.data)) {
        publishStatus('saved', 'Alle vorhandenen FitFlow-Daten sind in der Cloud gesichert.')
        return { saved: true, unchanged: true }
      }
      if(currentCloudUser()?.id!==auth.user.id)throw new Error('Sitzung wurde beendet.')
      const payload = { app: 'FitFlow', version: 2, exportedAt: new Date().toISOString(), data }
      const saved = await api('/rest/v1/fitflow_sync_snapshots?select=id', {
        token: auth.access_token,
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: { user_id: auth.user.id, data: payload },
      })
      if (!saved?.[0]?.id) throw new Error('Cloud-Upload konnte nicht bestätigt werden.')
      publishStatus('saved', 'Automatisch in Supabase gespeichert.')
      return { saved: true, revision: saved[0].id }
    } catch (error) {
      publishStatus('error', 'Noch nicht synchronisiert: ' + error.message)
      throw error
    }
  })().finally(() => { inFlight = null })
  return inFlight
}

/** Registers a debounced auto-upload and retries after connectivity returns. */
export function startAutomaticCloudSync() {
  let timeout
  function schedule() {
    if (!currentCloudUser()) return
    clearTimeout(timeout)
    timeout = setTimeout(() => { syncFitflowNow().catch(() => {}) }, 3500)
  }
  const onStorage = (event) => {
    if (event.key?.startsWith('fitflow-')) schedule()
  }
  const onVisibility = () => { if (document.visibilityState === 'visible') schedule() }
  window.addEventListener('fitflow-local-change', schedule)
  window.addEventListener('fitflow-cloud-auth', schedule)
  window.addEventListener('storage', onStorage)
  window.addEventListener('online', schedule)
  document.addEventListener('visibilitychange', onVisibility)
  const interval = setInterval(schedule, 30000)
  schedule()
  return () => {
    clearTimeout(timeout)
    clearInterval(interval)
    window.removeEventListener('fitflow-local-change', schedule)
    window.removeEventListener('fitflow-cloud-auth', schedule)
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('online', schedule)
    document.removeEventListener('visibilitychange', onVisibility)
  }
}
