// Private, one-time cloud backup. The existing localStorage data is never deleted or overwritten.
const API_URL = 'https://ifvlhfhyeqgodvhbdxbv.supabase.co'
const PUBLIC_KEY = 'sb_publishable_RQvUolij_etM5fUV8_MnDg_x40yft-h'
const AUTH_KEY = 'ffcloud-auth-v1' // Outside fitflow-* so auth tokens never enter FitFlow JSON exports.

async function api(path, { method = 'GET', token, body, headers = {} } = {}) {
  const response = await fetch(API_URL + path, {
    method,
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

export async function cloudSignUp(email, password) {
  return api('/auth/v1/signup', { method: 'POST', body: { email, password } })
}

export async function cloudSignIn(email, password) {
  const session = await api('/auth/v1/token?grant_type=password', {
    method: 'POST', body: { email, password },
  })
  if (!session?.access_token) throw new Error('Bitte bestätige zuerst deine E-Mail-Adresse.')
  storeAuth(session)
  return session.user
}

export function cloudSignOut() {
  localStorage.removeItem(AUTH_KEY)
}

async function validAuth() {
  let auth
  try { auth = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null') } catch { /* ignored */ }
  if (!auth?.refresh_token) throw new Error('Bitte zuerst mit deinem Cloud-Konto anmelden.')
  if (auth.expires_at && auth.expires_at > Date.now() / 1000 + 90) return auth
  const session = await api('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST', body: { refresh_token: auth.refresh_token },
  })
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
