import React, { useState } from 'react'
import { Medal, X } from 'lucide-react'
import ExerciseFigure, { animationFor } from './ExerciseFigure'
import { bests, entriesFor, fmtKg, fmtSet, volumeOf } from '../lib/logStore'
import { FEELS, bestE1rm, fmtNum } from '../lib/training'

const fmtDate = (key, opts = { day: 'numeric', month: 'short' }) =>
  new Date(`${key}T12:00:00`).toLocaleDateString('de-DE', opts)

const tick = (v) => (v >= 1000 ? `${fmtNum(v / 1000)}k` : fmtNum(v))

const LINE_METRICS = {
  top: { label: 'Gewicht', unit: ' kg', aria: 'Höchstes Gewicht', value: (e) => Math.max(...e.sets.map((s) => s.w)) },
  e1rm: { label: '1RM geschätzt', unit: ' kg', aria: 'Geschätztes Maximalgewicht', value: (e) => Math.round(bestE1rm(e.sets) * 10) / 10 },
  volume: { label: 'Volumen', unit: ' kg', aria: 'Volumen', value: (e) => Math.round(volumeOf(e.sets)) },
  reps: { label: 'Wiederholungen', unit: ' Wdh.', aria: 'Meiste Wiederholungen', value: (e) => Math.max(...e.sets.map((s) => s.r)) },
  total: { label: 'Gesamt-Wdh.', unit: ' Wdh.', aria: 'Wiederholungen gesamt', value: (e) => e.sets.reduce((n, s) => n + s.r, 0) },
}

function ProgressLine({ entries, weighted }) {
  const keys = weighted ? ['e1rm', 'top', 'volume'] : ['reps', 'total']
  const [metric, setMetric] = useState(keys[0])
  const m = LINE_METRICS[keys.includes(metric) ? metric : keys[0]]
  const data = entries.slice(-12).map((e) => ({ date: e.date, value: m.value(e) }))
  const [sel, setSel] = useState(data.length - 1)
  if (data.length < 2) {
    return <p className="sheetNote">Ab der zweiten Einheit siehst du hier deine Entwicklung.</p>
  }
  const W = 320
  const H = 130
  const pad = { l: 30, r: 16, t: 22, b: 22 }
  const vals = data.map((d) => d.value)
  let lo = Math.min(...vals)
  let hi = Math.max(...vals)
  if (hi === lo) { hi += 1; lo = Math.max(0, lo - 1) }
  const x = (i) => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r)
  const y = (v) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b)
  const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`).join(' ')
  const area = `${path} L${x(data.length - 1).toFixed(1)} ${H - pad.b} L${x(0).toFixed(1)} ${H - pad.b} Z`
  const s = data[Math.min(sel, data.length - 1)]
  const first = data[0].value
  const change = first > 0 ? Math.round(((data[data.length - 1].value - first) / first) * 100) : 0
  return (
    <figure className="progressChart">
      <div className="segmented small" role="tablist" aria-label="Kennzahl">
        {keys.map((k) => (
          <button key={k} role="tab" aria-selected={m === LINE_METRICS[k]} className={m === LINE_METRICS[k] ? 'active' : ''} onClick={() => setMetric(k)}>
            {LINE_METRICS[k].label}
          </button>
        ))}
      </div>
      <figcaption>
        <strong className="num">{s.value.toLocaleString('de-DE')}</strong>{m.unit}
        <span> am {fmtDate(s.date)}</span>
        {change !== 0 && <em className={`trend ${change > 0 ? 'up' : 'down'}`}>{change > 0 ? '+' : ''}{change} % seit {fmtDate(data[0].date)}</em>}
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${m.aria} pro Einheit`}>
        <line x1={pad.l} x2={W - pad.r} y1={y(hi)} y2={y(hi)} className="pcGrid" />
        <line x1={pad.l} x2={W - pad.r} y1={y(lo)} y2={y(lo)} className="pcGrid" />
        <text x={pad.l - 6} y={y(hi) + 4} className="pcTick" textAnchor="end">{tick(hi)}</text>
        <text x={pad.l - 6} y={y(lo) + 4} className="pcTick" textAnchor="end">{tick(lo)}</text>
        <path d={area} className="pcArea" />
        <path d={path} className="pcLine" />
        {data.map((d, i) => (
          <g key={d.date} onClick={() => setSel(i)} onMouseEnter={() => setSel(i)} className="pcHit">
            <circle cx={x(i)} cy={y(d.value)} r={14} fill="transparent" />
            <circle cx={x(i)} cy={y(d.value)} r={i === sel ? 5.5 : 4} className={i === sel ? 'pcDot active' : 'pcDot'} />
          </g>
        ))}
        <text x={x(0)} y={H - 4} className="pcTick" textAnchor="start">{fmtDate(data[0].date)}</text>
        <text x={x(data.length - 1)} y={H - 4} className="pcTick" textAnchor="end">{fmtDate(data[data.length - 1].date)}</text>
      </svg>
    </figure>
  )
}

export default function ExerciseSheet({ step, owner, log, onClose, onStart }) {
  const entries = entriesFor(log, owner, step.name)
  const best = bests(entries)
  const weighted = best.maxW > 0
  const recent = [...entries].reverse().slice(0, 6)
  const max1rm = entries.reduce((n, e) => Math.max(n, bestE1rm(e.sets)), 0)
  return (
    <div className="modalOverlay sheetOverlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`${step.name}: Verlauf`}>
        <div className="sheetHead">
          <div>
            <h3>{step.name}</h3>
            <p>{step.reps}</p>
          </div>
          <button className="closeBtn" onClick={onClose} aria-label="Schließen"><X size={20} /></button>
        </div>

        {animationFor(step) && (
          <div className="sheetFigure"><ExerciseFigure step={step} label={`${step.name}: Bewegungsablauf`} /></div>
        )}
        <p className="sheetText">{step.detail}</p>

        <div className="sheetStats">
          <div>
            <strong className="num">{weighted ? fmtKg(best.maxW) : best.maxR || '–'}</strong>
            <span>{weighted ? `Bestes Gewicht${best.maxRAtMaxW ? ` (× ${best.maxRAtMaxW})` : ''}` : 'Meiste Wdh.'}</span>
          </div>
          {weighted && max1rm > 0 && (
            <div>
              <strong className="num">{fmtKg(Math.round(max1rm * 2) / 2)}</strong>
              <span>1RM geschätzt</span>
            </div>
          )}
          <div>
            <strong className="num">{best.sessions}</strong>
            <span>{best.sessions === 1 ? 'Einheit' : 'Einheiten'}</span>
          </div>
        </div>

        {entries.length > 0 ? (
          <>
            <ProgressLine entries={entries} weighted={weighted} />
            <h4 className="sheetSub">Letzte Einheiten</h4>
            <ul className="sheetEntries">
              {recent.map((e) => (
                <li key={e.date}>
                  <span>{fmtDate(e.date, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  <span>{e.sets.map(fmtSet).join(' · ')}{e.sets.some((x) => x.f === 3) && <small className="feelTag f3">{FEELS[2].short}</small>}</span>
                  {weighted && e.sets.some((s) => s.w === best.maxW && s.r === best.maxRAtMaxW) && <Medal size={15} aria-label="Rekord" />}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="sheetNote">Noch keine Einträge. Trag beim nächsten Training Gewicht und Wiederholungen ein – dann siehst du hier deinen Fortschritt.</p>
        )}

        {onStart && (
          <button className="primaryAction block" onClick={onStart}>Zu dieser Übung springen</button>
        )}
      </div>
    </div>
  )
}
