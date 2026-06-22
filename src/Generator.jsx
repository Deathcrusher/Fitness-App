import React, { useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import {
  GENERATOR_FOCUSES,
  GENERATOR_EQUIP,
  GENERATOR_LENGTH,
  scanGoalText,
} from './plans'

const DEFAULTS = { focus: 'ganzkoerper', equipment: 'koerpergewicht', length: 'mittel', days: 1 }

export default function Generator({ open, onClose, onGenerate }) {
  const [text, setText] = useState('')
  const [options, setOptions] = useState(DEFAULTS)

  if (!open) return null

  function setOption(key, value) {
    setOptions((o) => ({ ...o, [key]: value }))
  }
  function onTextChange(value) {
    setText(value)
    const scanned = scanGoalText(value)
    if (Object.keys(scanned).length) setOptions((o) => ({ ...o, ...scanned }))
  }
  function generate() {
    onGenerate({ ...options })
    setText('')
    setOptions(DEFAULTS)
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modal generatorModal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Programm generieren">
        <div className="generatorHead">
          <h3><Sparkles size={18} /> Programm generieren</h3>
          <button className="iconAction" onClick={onClose} aria-label="Schließen"><X size={20} /></button>
        </div>
        <p className="muted">Beschreib dein Ziel – die App baut daraus ein fertiges Programm.</p>

        <label className="field">
          <span>Was willst du trainieren?</span>
          <textarea
            rows={2}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="z. B. kurzes Cardio ohne Equipment, oder Rücken & Haltung mit Hanteln"
          />
        </label>

        <div className="genGroup">
          <span className="genLabel">Fokus</span>
          <div className="blockFilter">
            {GENERATOR_FOCUSES.map((f) => (
              <button key={f.key} className={options.focus === f.key ? 'active' : ''} onClick={() => setOption('focus', f.key)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="genGroup">
          <span className="genLabel">Equipment</span>
          <div className="blockFilter">
            {GENERATOR_EQUIP.map((e) => (
              <button key={e.key} className={options.equipment === e.key ? 'active' : ''} onClick={() => setOption('equipment', e.key)}>
                {e.label}
              </button>
            ))}
          </div>
        </div>

        <div className="genRow">
          <div className="genGroup">
            <span className="genLabel">Länge</span>
            <div className="blockFilter">
              {GENERATOR_LENGTH.map((l) => (
                <button key={l.key} className={options.length === l.key ? 'active' : ''} onClick={() => setOption('length', l.key)}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div className="genGroup">
            <span className="genLabel">Tage</span>
            <div className="blockFilter">
              {[1, 2, 3].map((d) => (
                <button key={d} className={options.days === d ? 'active' : ''} onClick={() => setOption('days', d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modalActions">
          <button className="ghostBtn" onClick={onClose}>Abbrechen</button>
          <button className="primaryAction" onClick={generate}><Sparkles size={16} /> Erstellen</button>
        </div>
      </div>
    </div>
  )
}
