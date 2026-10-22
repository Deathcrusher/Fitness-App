import React, { useRef, useState } from 'react'
import { Download, Minus, Plus, Upload, X } from 'lucide-react'
import { exportData } from '../lib/backup'
import { coachSupported, say } from '../lib/coach'

const THEMES = [['system', 'Automatisch'], ['light', 'Hell'], ['dark', 'Dunkel']]

export default function SettingsSheet({ theme, onTheme, goal, onGoal, voiceOn, onVoice, version, onClose }) {
  const fileRef = useRef(null)
  const [status, setStatus] = useState(null)
  const [pending, setPending] = useState(null)

  function readFile(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (parsed?.app !== 'FitFlow' || typeof parsed.data !== 'object') throw new Error('format')
        setPending(parsed)
        setStatus(null)
      } catch {
        setStatus('Diese Datei ist kein FitFlow-Backup.')
      }
    }
    reader.readAsText(file)
  }

  function restore() {
    try {
      for (const [key, value] of Object.entries(pending.data)) {
        if (key.startsWith('fitflow-') && typeof value === 'string') localStorage.setItem(key, value)
      }
      window.location.reload()
    } catch {
      setStatus('Wiederherstellen fehlgeschlagen – der Speicher des Browsers ist gesperrt.')
    }
  }

  const backupDate = pending ? new Date(pending.exportedAt).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

  return (
    <div className="modalOverlay sheetOverlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Einstellungen">
        <div className="sheetHead">
          <h3>Einstellungen</h3>
          <button className="closeBtn" onClick={onClose} aria-label="Schließen"><X size={20} /></button>
        </div>

        <section className="setSection">
          <h4>Design</h4>
          <div className="segmented" role="radiogroup" aria-label="Design">
            {THEMES.map(([key, label]) => (
              <button key={key} role="radio" aria-checked={theme === key} className={theme === key ? 'active' : ''} onClick={() => onTheme(key)}>{label}</button>
            ))}
          </div>
        </section>

        <section className="setSection">
          <h4>Countdown-Ansage</h4>
          {coachSupported() ? (
            <div className="switchRow">
              <p>Zählt die letzten 5 Sekunden von Pausen und Zeitübungen laut mit.</p>
              <button role="switch" aria-checked={voiceOn} className={`switch${voiceOn ? ' on' : ''}`} onClick={() => onVoice(!voiceOn)} aria-label="Countdown-Ansage"><span /></button>
            </div>
          ) : (
            <p className="setHint">Dein Browser unterstützt keine Sprachausgabe.</p>
          )}
          {voiceOn && coachSupported() && (
            <button className="ghostBtn testVoice" onClick={() => say('Fünf. Vier. Drei. Zwei. Eins.', { interrupt: true })}>Probehören</button>
          )}
        </section>

        <section className="setSection">
          <h4>Wochenziel</h4>
          <div className="goalRow">
            <button className="roundBtn" onClick={() => onGoal(Math.max(1, goal - 1))} disabled={goal <= 1} aria-label="Weniger Trainings"><Minus size={18} /></button>
            <p><strong className="num">{goal}</strong> {goal === 1 ? 'Training' : 'Trainings'} pro Woche</p>
            <button className="roundBtn" onClick={() => onGoal(Math.min(7, goal + 1))} disabled={goal >= 7} aria-label="Mehr Trainings"><Plus size={18} /></button>
          </div>
        </section>

        <section className="setSection">
          <h4>Daten sichern</h4>
          <p className="setHint">Alles liegt nur auf diesem Gerät. Sichere ein Backup, um auf ein neues Handy umzuziehen oder nichts zu verlieren.</p>
          <div className="setActions">
            <button className="ghostBtn" onClick={() => exportData(version)}><Download size={17} /> Backup speichern</button>
            <button className="ghostBtn" onClick={() => fileRef.current?.click()}><Upload size={17} /> Backup laden</button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => readFile(e.target.files?.[0])} />
          </div>
          {pending && (
            <div className="restoreBox">
              <p>Backup vom {backupDate} laden? Die aktuellen Daten auf diesem Gerät werden ersetzt.</p>
              <div className="setActions">
                <button className="ghostBtn" onClick={() => setPending(null)}>Abbrechen</button>
                <button className="primaryAction" onClick={restore}>Wiederherstellen</button>
              </div>
            </div>
          )}
          {status && <p className="setError" role="alert">{status}</p>}
        </section>

        <p className="setVersion">FitFlow {version}</p>
      </div>
    </div>
  )
}
