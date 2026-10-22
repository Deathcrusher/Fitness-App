import React, { useState } from 'react'
import { Medal, X } from 'lucide-react'
import ExerciseFigure, { animationFor } from './ExerciseFigure'
import { bests, entriesFor, fmtKg, fmtSet } from './logStore'

const fmtDate = (key, opts = { day: 'numeric', month: 'short' }) =>
  new Date(`${key}T12:00:00`).toLocaleDateString('de-DE', opts)

function ProgressLine({ entries, weighted }) {
  const data = entries.slice(-12).map((e) => ({
    date: e.date,
    value: weighted ? Math.max(...e.sets.map((s) => s.w)) : Math.max(...e.sets.map((s) => s.r)),
  }))
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
  const unit = weighted ? ' kg' : ' Wdh.'
  const s = data[Math.min(sel, data.length - 1)]
  return (
    <figure className="progressChart">
      <figcaption>
        <strong className="num">{String(s.value).replace('.', ',')}</strong>{unit}
        <span> am {fmtDate(s.date)}</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${weighted ? 'Höchstes Gewicht' : 'Meiste Wiederholungen'} pro Einheit`}>
        <line x1={pad.l} x2={W - pad.r} y1={y(hi)} y2={y(hi)} className="pcGrid" />
        <line x1={pad.l} x2={W - pad.r} y1={y(lo)} y2={y(lo)} className="pcGrid" />
        <text x={pad.l - 6} y={y(hi) + 4} className="pcTick" textAnchor="end">{hi}</text>
        <text x={pad.l - 6} y={y(lo) + 4} className="pcTick" textAnchor="end">{lo}</text>
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
                  <span>{e.sets.map(fmtSet).join(' · ')}</span>
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
