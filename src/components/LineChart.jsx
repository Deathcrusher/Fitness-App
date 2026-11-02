import React, { useState } from 'react'
import { fmtNum } from '../lib/training'

const fmtDate = (key) => new Date(`${key}T12:00:00`).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })

/** Schlichtes Liniendiagramm für [{ date, value }] mit antippbaren Punkten */
export default function LineChart({ data, unit, label, captionOnSelect = false }) {
  const [sel, setSel] = useState(null)
  if (data.length < 2) return null
  const W = 320
  const H = 140
  const pad = { l: 34, r: 16, t: 16, b: 22 }
  const vals = data.map((d) => d.value)
  let lo = Math.min(...vals)
  let hi = Math.max(...vals)
  const span = Math.max(hi - lo, 1)
  lo = Math.floor((lo - span * 0.15) * 2) / 2
  hi = Math.ceil((hi + span * 0.15) * 2) / 2
  const t0 = new Date(`${data[0].date}T12:00:00`).getTime()
  const t1 = new Date(`${data[data.length - 1].date}T12:00:00`).getTime()
  const x = (d) => pad.l + ((new Date(`${d.date}T12:00:00`).getTime() - t0) / Math.max(1, t1 - t0)) * (W - pad.l - pad.r)
  const y = (v) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b)
  const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(d).toFixed(1)} ${y(d.value).toFixed(1)}`).join(' ')
  const area = `${path} L${x(data[data.length - 1]).toFixed(1)} ${H - pad.b} L${x(data[0]).toFixed(1)} ${H - pad.b} Z`
  const index = sel == null ? data.length - 1 : Math.min(sel, data.length - 1)
  const s = data[index]
  const mid = (hi + lo) / 2
  return (
    <figure className="progressChart">
      {(!captionOnSelect || sel != null) && (
        <figcaption>
          <strong className="num">{fmtNum(s.value)}</strong> {unit}
          <span> am {fmtDate(s.date)}</span>
        </figcaption>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        {[hi, mid, lo].map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className="pcGrid" />
            <text x={pad.l - 6} y={y(v) + 4} className="pcTick" textAnchor="end">{fmtNum(v)}</text>
          </g>
        ))}
        <path d={area} className="pcArea" />
        <path d={path} className="pcLine" />
        {data.map((d, i) => (
          <g key={d.date} onClick={() => setSel(i)} onMouseEnter={() => setSel(i)} className="pcHit">
            <circle cx={x(d)} cy={y(d.value)} r={14} fill="transparent" />
            <circle cx={x(d)} cy={y(d.value)} r={i === index ? 5.5 : data.length > 20 ? 2.5 : 4} className={i === index ? 'pcDot active' : 'pcDot'} />
          </g>
        ))}
        <text x={pad.l} y={H - 4} className="pcTick" textAnchor="start">{fmtDate(data[0].date)}</text>
        <text x={W - pad.r} y={H - 4} className="pcTick" textAnchor="end">{fmtDate(data[data.length - 1].date)}</text>
      </svg>
    </figure>
  )
}
