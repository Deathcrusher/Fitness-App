import React, { useState } from 'react'
import { Plus, Ruler, Trash2, X } from 'lucide-react'
import { BODY_FIELDS, changeOver, seriesOf } from '../lib/bodyStore'
import { fmtNum } from '../lib/training'
import { dateKey } from './ProgressCalendar'
import LineChart from './LineChart'

const fmtDate = (key, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => new Date(`${key}T12:00:00`).toLocaleDateString('de-DE', opts)

function BodyForm({ entries, onSave, onClose }) {
  const today = dateKey()
  const last = entries[entries.length - 1] || {}
  const existing = entries.find((e) => e.date === today)
  const [date, setDate] = useState(today)
  const [values, setValues] = useState(() => Object.fromEntries(
    Object.keys(BODY_FIELDS).map((k) => [k, existing?.[k] != null ? String(existing[k]).replace('.', ',') : '']),
  ))
  const set = (k, v) => setValues((prev) => ({ ...prev, [k]: v }))
  const anyValue = Object.values(values).some((v) => String(v).trim())

  return (
    <div className="modalOverlay sheetOverlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Körperwerte eintragen">
        <div className="sheetHead">
          <div>
            <h3>Körperwerte eintragen</h3>
            <p>Nur ausfüllen, was du gemessen hast.</p>
          </div>
          <button className="closeBtn" onClick={onClose} aria-label="Schließen"><X size={20} /></button>
        </div>
        <label className="field">
          <span>Datum</span>
          <input type="date" value={date} max={today} onChange={(e) => {
            const d = e.target.value
            setDate(d)
            const found = entries.find((x) => x.date === d)
            setValues(Object.fromEntries(Object.keys(BODY_FIELDS).map((k) => [k, found?.[k] != null ? String(found[k]).replace('.', ',') : ''])))
          }} />
        </label>
        <div className="bodyFields">
          {Object.entries(BODY_FIELDS).map(([k, f]) => (
            <label key={k} className="field">
              <span>{f.label}</span>
              <div className="unitInput">
                <input
                  inputMode="decimal"
                  value={values[k]}
                  placeholder={last[k] ? fmtNum(last[k]) : '–'}
                  onChange={(e) => set(k, e.target.value)}
                  aria-label={`${f.label} in ${f.unit}`}
                />
                <small>{f.unit}</small>
              </div>
            </label>
          ))}
        </div>
        <p className="setHint">Tipp: Gewicht morgens nüchtern messen, Umfänge immer an der gleichen Stelle – dann sind die Werte vergleichbar.</p>
        <button className="primaryAction block" disabled={!anyValue} onClick={() => onSave(date, values)}>Speichern</button>
      </div>
    </div>
  )
}

export default function BodyCard({ entries = [], ownerName, onSave, onRemove }) {
  const [open, setOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const available = Object.keys(BODY_FIELDS).filter((k) => entries.some((e) => e[k] > 0))
  const [field, setField] = useState('weight')
  const active = available.includes(field) ? field : available[0]
  const f = BODY_FIELDS[active]
  const series = active ? seriesOf(entries, active) : []
  const today = dateKey()
  const change = changeOver(series, 30, today)
  const latest = series[series.length - 1]
  const list = [...entries].reverse().slice(0, showAll ? 30 : 4)

  return (
    <article className="bodyCard">
      <div className="chartHead bodyHead">
        <div>
          <h3><Ruler size={17} /> Körperwerte</h3>
          <p>{ownerName}{latest ? ` · zuletzt ${fmtDate(latest.date, { day: 'numeric', month: 'short' })}` : ''}</p>
        </div>
        <button className="ghostBtn" onClick={() => setOpen(true)}><Plus size={16} /> Eintragen</button>
      </div>

      {available.length > 0 ? (
        <>
          {available.length > 1 && (
            <div className="segmented small scrollable" role="tablist" aria-label="Messwert">
              {available.map((k) => (
                <button key={k} role="tab" aria-selected={active === k} className={active === k ? 'active' : ''} onClick={() => setField(k)}>{BODY_FIELDS[k].short}</button>
              ))}
            </div>
          )}
          <div className="bodyNow">
            <strong className="num">{fmtNum(latest.value)}<small> {f.unit}</small></strong>
            {change && (
              <span className="bodyDelta">
                {change.diff > 0 ? '+' : change.diff < 0 ? '−' : '±'}{fmtNum(Math.abs(change.diff))} {f.unit} seit {fmtDate(change.since, { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
          {series.length >= 2
            ? <LineChart key={active} data={series} unit={f.unit} label={`${f.label} im Verlauf`} captionOnSelect />
            : <p className="chartNote">Ab dem zweiten Eintrag siehst du hier den Verlauf.</p>}
          <ul className="bodyList">
            {list.map((e) => (
              <li key={e.date}>
                <span>{fmtDate(e.date, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                <span className="bodyVals">
                  {Object.entries(BODY_FIELDS).filter(([k]) => e[k]).map(([k, x]) => `${x.short} ${fmtNum(e[k])}`).join(' · ')}
                </span>
                <button className="iconAction sm" onClick={() => onRemove(e.date)} aria-label={`Eintrag vom ${fmtDate(e.date)} löschen`}><Trash2 size={15} /></button>
              </li>
            ))}
          </ul>
          {entries.length > 4 && (
            <button className="linkBtn" onClick={() => setShowAll((v) => !v)}>{showAll ? 'Weniger anzeigen' : `Alle ${entries.length} Einträge`}</button>
          )}
        </>
      ) : (
        <p className="chartNote">Trag Körpergewicht oder Umfänge ein – der Spiegel lügt manchmal, die Kurve nicht.</p>
      )}

      {open && (
        <BodyForm
          entries={entries}
          onClose={() => setOpen(false)}
          onSave={(date, values) => { onSave(date, values); setOpen(false) }}
        />
      )}
    </article>
  )
}
