import React, { useMemo, useState } from 'react'
import { Activity } from 'lucide-react'
import { MUSCLES, heatLevel, muscleSetsFor } from '../lib/muscles'
import { dateKey } from './ProgressCalendar'
import { fmtNum } from '../lib/training'

const RANGES = {
  week: { label: '7 Tage', days: 7, weeks: 1 },
  month: { label: '4 Wochen', days: 28, weeks: 4 },
}

/* ---------- Silhouette ---------- */
const mirror = (d) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${120 - Number(x)} ${y}`)
const BASE = 'M38 44 Q60 38 82 44 L90 62 L86 120 Q60 134 34 120 L30 62 Z'

function Neutral({ children }) {
  return <g className="mmNeutral">{children}</g>
}

function Body({ side, levelOf, selected, onSelect }) {
  const part = (m, children) => (
    <g
      className={`mmPart hl${levelOf(m)}${selected === m ? ' sel' : ''}`}
      onClick={() => onSelect(m)}
      role="button"
      tabIndex={0}
      aria-label={MUSCLES[m]}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(m) }}
    >
      {children}
    </g>
  )
  const pair = (d) => <><path d={d} /><path d={mirror(d)} /></>
  const ell = (cx, cy, rx, ry, rot = 0) => (
    <>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} transform={rot ? `rotate(${rot} ${cx} ${cy})` : undefined} />
      <ellipse cx={120 - cx} cy={cy} rx={rx} ry={ry} transform={rot ? `rotate(${-rot} ${120 - cx} ${cy})` : undefined} />
    </>
  )

  return (
    <g>
      <Neutral>
        <circle cx="60" cy="18" r="12" />
        <rect x="54" y="28" width="12" height="12" rx="4" />
        <path d={BASE} />
        <path d="M36 118 Q60 132 84 118 L84 136 Q60 146 36 136 Z" />
        {ell(20, 129, 5, 6)}
        {side === 'front' ? ell(48, 218, 7, 24) : null}
        {ell(46, 245, 8, 4)}
      </Neutral>
      {part('shoulders', ell(33, 52, 10, 9))}
      {part('forearms', ell(22, 107, 6, 15, 8))}
      {side === 'front' ? (
        <>
          {part('chest', pair('M43 48 Q52 44 59 47 L59 72 Q50 76 41 70 Q39 58 43 48 Z'))}
          {part('biceps', ell(27, 78, 7, 14, 10))}
          {part('abs', <rect x="48" y="76" width="24" height="42" rx="7" />)}
          <g className="mmLines" aria-hidden="true">
            <line x1="60" y1="78" x2="60" y2="116" />
            <line x1="49" y1="90" x2="71" y2="90" />
            <line x1="49" y1="104" x2="71" y2="104" />
          </g>
          {part('obliques', pair('M39 76 L46 78 L46 116 L38 112 Q36 94 39 76 Z'))}
          {part('quads', ell(49, 165, 11, 30, 4))}
        </>
      ) : (
        <>
          {part('back', <path d="M42 46 Q60 40 78 46 L85 62 L77 98 Q60 104 43 98 L35 62 Z" />)}
          <g className="mmLines" aria-hidden="true"><line x1="60" y1="46" x2="60" y2="100" /></g>
          {part('lowerback', <path d="M45 101 Q60 107 75 101 L75 118 Q60 123 45 118 Z" />)}
          {part('triceps', ell(27, 78, 7, 14, 10))}
          {part('glutes', ell(50, 134, 11, 12))}
          {part('hamstrings', ell(49, 172, 10, 24, 4))}
          <Neutral>{ell(48, 220, 8, 22)}</Neutral>
        </>
      )}
    </g>
  )
}

export default function MuscleMap({ history, log, owner, ownerName, ownerOf }) {
  const [range, setRange] = useState('week')
  const [selected, setSelected] = useState(null)
  const r = RANGES[range]

  const sets = useMemo(() => {
    const to = new Date()
    to.setDate(to.getDate() + 1)
    const from = new Date()
    from.setDate(from.getDate() - r.days + 1)
    return muscleSetsFor({ history, log, owner, ownerOf, from: dateKey(from), to: dateKey(to) })
  }, [history, log, owner, ownerOf, r.days])

  const perWeek = (m) => (sets[m] || 0) / r.weeks
  const levelOf = (m) => heatLevel(perWeek(m))
  const rows = Object.keys(MUSCLES).map((m) => ({ m, v: perWeek(m) })).sort((a, b) => b.v - a.v)
  const any = rows.some((x) => x.v > 0)
  const missing = any ? rows.filter((x) => x.v < 3).map((x) => MUSCLES[x.m]) : []
  const max = Math.max(10, ...rows.map((x) => x.v))
  const sel = selected && { name: MUSCLES[selected], v: perWeek(selected) }

  return (
    <article className="muscleCard">
      <div className="chartHead">
        <div>
          <h3><Activity size={17} /> Muskel-Heatmap</h3>
          <p>{ownerName} · {range === 'week' ? 'Sätze der letzten 7 Tage' : 'Ø Sätze pro Woche (4 Wochen)'}</p>
        </div>
      </div>
      <div className="segmented small" role="tablist" aria-label="Zeitraum">
        {Object.entries(RANGES).map(([key, item]) => (
          <button key={key} role="tab" aria-selected={range === key} className={range === key ? 'active' : ''} onClick={() => setRange(key)}>{item.label}</button>
        ))}
      </div>

      <div className="muscleFigures">
        <figure>
          <svg viewBox="0 0 120 252" role="group" aria-label="Vorderseite"><Body side="front" levelOf={levelOf} selected={selected} onSelect={setSelected} /></svg>
          <figcaption>Vorne</figcaption>
        </figure>
        <figure>
          <svg viewBox="0 0 120 252" role="group" aria-label="Rückseite"><Body side="back" levelOf={levelOf} selected={selected} onSelect={setSelected} /></svg>
          <figcaption>Hinten</figcaption>
        </figure>
      </div>

      <p className="muscleSel" aria-live="polite">
        {sel ? <><strong>{sel.name}</strong> {fmtNum(sel.v)} {range === 'week' ? 'Sätze' : 'Sätze/Woche'}</> : 'Tippe auf einen Muskel für Details.'}
      </p>

      <div className="heatLegend" aria-hidden="true">
        <span>0</span>{[0, 1, 2, 3, 4].map((l) => <i key={l} className={`hl${l}`} />)}<span>10+ Sätze/Woche</span>
      </div>

      {any ? (
        <>
          <ul className="muscleList">
            {rows.map(({ m, v }) => (
              <li key={m} className={selected === m ? 'sel' : ''}>
                <button onClick={() => setSelected(m)}>
                  <span>{MUSCLES[m]}</span>
                  <i className="muscleBar"><b className={`hl${heatLevel(v)}`} style={{ width: `${Math.min(100, (v / max) * 100)}%` }} /></i>
                  <strong className="num">{fmtNum(v)}</strong>
                </button>
              </li>
            ))}
          </ul>
          {missing.length > 0 && (
            <p className="chartNote">Kommt zu kurz: {missing.join(', ')}. Ziel sind etwa 10 Sätze pro Muskel und Woche.</p>
          )}
        </>
      ) : (
        <p className="chartNote">Noch keine Trainings im Zeitraum. Nach dem nächsten Training siehst du hier, welche Muskeln du getroffen hast.</p>
      )}
    </article>
  )
}
