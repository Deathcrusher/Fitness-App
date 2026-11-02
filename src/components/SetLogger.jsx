import React, { useState } from 'react'
import { History, Minus, Plus, TrendingUp } from 'lucide-react'
import { fmtKg, fmtSet } from '../lib/logStore'
import { FEELS, fmtNum, platesFor } from '../lib/training'

function Stepper({ label, value, unit, step, min = 0, max = 500, onChange, decimals }) {
  const [text, setText] = useState(null)
  const shown = text ?? (decimals ? String(value).replace('.', ',') : String(value))
  const commit = (raw) => {
    const n = Number(String(raw).replace(',', '.'))
    if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, Math.round(n * 2) / 2)))
    setText(null)
  }
  return (
    <div className="stepperField">
      <span className="stepperLabel">{label}</span>
      <div className="stepperRow">
        <button type="button" onClick={() => onChange(Math.max(min, value - step))} disabled={value <= min} aria-label={`${label} verringern`}>
          <Minus size={18} />
        </button>
        <label className="stepperValue">
          <input
            inputMode={decimals ? 'decimal' : 'numeric'}
            value={shown}
            onChange={(e) => setText(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
            onFocus={(e) => e.currentTarget.select()}
            aria-label={label}
            className="num"
          />
          {unit && <small>{unit}</small>}
        </label>
        <button type="button" onClick={() => onChange(Math.min(max, value + step))} aria-label={`${label} erhöhen`}>
          <Plus size={18} />
        </button>
      </div>
    </div>
  )
}

function PlateHint({ weight, gear }) {
  if (!gear?.show || !gear.plates.length || weight <= gear.bar) return null
  const { perSide, rest } = platesFor(weight, gear.bar, gear.plates)
  if (!perSide.length) return null
  return (
    <p className="plateHint" aria-label="Scheiben pro Seite">
      <span className="plateStack" aria-hidden="true">
        {perSide.map((p, i) => <i key={i} style={{ '--ph': `${Math.min(30, 12 + p * 1.6)}px` }} />)}
      </span>
      <span>
        Pro Seite: <strong className="num">{perSide.map(fmtNum).join(' + ')}</strong> kg
        {rest > 0 && <em> · {fmtNum(rest)} kg fehlen</em>}
      </span>
    </p>
  )
}

export default function SetLogger({ draft, onDraft, weighted, last, sug, doneSets, setIndex, gear }) {
  const [showWeight, setShowWeight] = useState(false)
  const withWeight = weighted || showWeight || draft.w > 0
  return (
    <div className="setLogger">
      <div className={`stepperGrid${withWeight ? '' : ' single'}`}>
        {withWeight && (
          <Stepper label="Gewicht" value={draft.w} unit="kg" step={1} decimals onChange={(w) => onDraft({ ...draft, w })} />
        )}
        <Stepper label="Wiederholungen" value={draft.r} step={1} max={200} onChange={(r) => onDraft({ ...draft, r })} />
      </div>

      {withWeight && <PlateHint weight={draft.w} gear={gear} />}

      <div className="feelRow" role="radiogroup" aria-label="Wie hat sich der Satz angefühlt?">
        <span>Gefühl</span>
        {FEELS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="radio"
            aria-checked={draft.f === f.value}
            className={`feel f${f.value}${draft.f === f.value ? ' active' : ''}`}
            onClick={() => onDraft({ ...draft, f: draft.f === f.value ? undefined : f.value })}
          >
            {f.label}
          </button>
        ))}
      </div>

      {doneSets.some(Boolean) && (
        <ol className="doneSets" aria-label="Erledigte Sätze">
          {doneSets.map((s, i) => s && i < setIndex && <li key={i}><span>Satz {i + 1}</span> {fmtSet(s)}{s.f ? <small className={`feelTag f${s.f}`}>{FEELS[s.f - 1].short}</small> : null}</li>)}
        </ol>
      )}

      <div className="lastTime">
        {last ? (
          <span>Letztes Mal: {last.sets.map((s) => (s.w > 0 ? `${String(s.w).replace('.', ',')}×${s.r}` : s.r)).join(' · ')}{last.sets[0]?.w > 0 ? ' kg' : ' Wdh.'}</span>
        ) : (
          <span>Erstes Mal – trag ein, was du schaffst.</span>
        )}
        {sug && (
          <button
            type="button"
            className={`sugChip ${sug.kind}`}
            onClick={() => onDraft({ ...draft, w: sug.w, r: sug.r })}
            title="Vorschlag übernehmen"
          >
            {sug.kind === 'up' && <TrendingUp size={14} />}
            {sug.kind === 'comeback' && <History size={14} />} {sug.text}
          </button>
        )}
      </div>
      {sug?.note && <p className={`sugNote ${sug.kind}`}>{sug.note}</p>}

      {!weighted && !withWeight && (
        <button type="button" className="addWeight" onClick={() => setShowWeight(true)}>
          <Plus size={14} /> Gewicht eintragen
        </button>
      )}
      <span className="srOnly" aria-live="polite">{draft.w > 0 ? fmtKg(draft.w) : ''}</span>
    </div>
  )
}
