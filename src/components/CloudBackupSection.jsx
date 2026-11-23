import React, { useState } from 'react'
import { CloudUpload, LogOut } from 'lucide-react'
import { cloudSignIn, cloudSignOut, cloudSignUp, currentCloudUser, initialCloudBackup } from '../lib/cloudBackup'

export default function CloudBackupSection() {
  const [user, setUser] = useState(currentCloudUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [failure, setFailure] = useState(false)

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
        setMessage('Angemeldet. Du kannst jetzt deine bisherigen Daten einmalig in der Cloud sichern.')
      } else {
        const result = await initialCloudBackup()
        setMessage(result.saved
          ? 'Cloud-Backup erfolgreich gespeichert und überprüft! Deine lokalen Daten bleiben unverändert.'
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
      <p className="setHint">Einmalige Sicherung aller FitFlow-Daten von diesem Browser (auch von anderen Profilen wie Connie). Nichts wird lokal gelöscht. Noch keine automatische Synchronisierung.</p>
      {user ? (
        <>
          <p className="setHint">Angemeldet: <strong>{user.email}</strong></p>
          <div className="setActions">
            <button className="primaryAction" disabled={busy} onClick={() => run('backup')}>
              <CloudUpload size={17} /> {busy ? 'Sichere …' : 'Erstmalig in Cloud sichern'}
            </button>
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
