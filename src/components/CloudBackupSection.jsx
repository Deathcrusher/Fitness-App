import React, { useEffect, useState } from 'react'
import { CloudUpload, LogOut } from 'lucide-react'
import { cloudSignIn, cloudSignOut, cloudSignUp, currentCloudUser, initialCloudBackup, cloudStatus, syncFitflowNow, bootstrapCloudSync } from '../lib/cloudBackup'

export default function CloudBackupSection() {
  const [user, setUser] = useState(currentCloudUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [failure, setFailure] = useState(false)
  const [syncState, setSyncState] = useState(cloudStatus)
  useEffect(() => {
    const onStatus = (event) => setSyncState(event.detail)
    window.addEventListener('fitflow-cloud-status', onStatus)
    return () => window.removeEventListener('fitflow-cloud-status', onStatus)
  }, [])

  async function run(action) {
    setBusy(true)
    setMessage('')
    setFailure(false)
    try {
      if (action === 'register') {
        await cloudSignUp(email.trim(), password)
        setMessage('Konto angelegt. Falls du eine Bestätigungs-E-Mail erhältst, bestätige sie und melde dich danach hier an.')
      } else if (action === 'login') {
        const loggedIn = await cloudSignIn(email.trim(), password)
        setUser(loggedIn)
        setPassword('')
        setMessage('Angemeldet. Deine Daten werden mit deinem Cloud-Backup abgeglichen.')
        await bootstrapCloudSync()
        window.location.reload()
      } else if (action === 'sync') {
        await syncFitflowNow()
        setMessage('Cloud-Sicherung überprüft. Neue Einträge werden automatisch gesichert.')
      } else {
        const result = await initialCloudBackup()
        setMessage(result.saved
          ? 'Cloud-Backup erfolgreich gespeichert und überprüft! Automatische Sicherung läuft nun im Hintergrund, solange du angemeldet bist.'
          : 'Für dieses Konto gibt es bereits ein Erst-Backup. Es wurde nichts überschrieben.')
      }
    } catch (error) {
      setFailure(true)
      setMessage(error.message || 'Etwas ist schiefgelaufen. Deine lokalen Daten wurden nicht geändert.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="setSection">
      <h4>FitFlow Cloud-Backup</h4>
      <p className="setHint">Automatische Cloud-Sicherung deiner FitFlow-Daten bei Änderungen, zusätzlich zu den Daten im Browser. Die erste Sicherung bleibt unverändert erhalten. Daten anderer Personen im selben Browser werden mitgesichert.</p>
      {user ? (
        <>
          <p className="setHint">Angemeldet: <strong>{user.email}</strong></p>
          {syncState && <p className={syncState.status === 'error' ? 'setError' : 'setHint'} role="status">Cloud: {syncState.message} ({new Date(syncState.at).toLocaleString('de-AT')})</p>}
          <div className="setActions">
            <button className="primaryAction" disabled={busy} onClick={() => run('backup')}>
              <CloudUpload size={17} /> {busy ? 'Sichere …' : 'Erst-Backup prüfen'}
            </button>
            <button className="ghostBtn" disabled={busy} onClick={() => run('sync')}>Jetzt synchronisieren</button>
            <button className="ghostBtn" disabled={busy} onClick={() => { cloudSignOut(); setUser(null); setMessage('Abgemeldet.') }}>
              <LogOut size={17} /> Abmelden
            </button>
          </div>
        </>
      ) : (
        <>
          <label className="field compactField">
            <span>E-Mail für dein privates FitFlow-Konto</span>
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-Mail-Adresse" />
          </label>
          <label className="field compactField">
            <span>Passwort (mindestens 8 Zeichen)</span>
            <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Passwort" />
          </label>
          <div className="setActions">
            <button className="primaryAction" disabled={busy || !email.includes('@') || password.length < 8} onClick={() => run('login')}>Anmelden</button>
            <button className="ghostBtn" disabled={busy || !email.includes('@') || password.length < 8} onClick={() => run('register')}>Konto erstellen</button>
          </div>
        </>
      )}
      {message && <p role="status" className={failure ? 'setError' : 'setHint'}>{message}</p>}
    </section>
  )
}
