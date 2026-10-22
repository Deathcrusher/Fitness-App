import React from 'react'
import { CalendarDays, CheckCircle2, Clock3, Dumbbell, Flame, ListChecks, Medal, RotateCcw, Trophy } from 'lucide-react'
import { fmtVolume, humanDuration } from '../lib/storage'
import BadgeIcon from './BadgeIcon'

export default function FinishSummary({ day, durationMs, volume, completed, total, sets, weekCount, goal, prs, badges = [], onStats, onRestart }) {
  return (
      <div className="finishState">
        <div className="finishBurst"><Trophy size={56} /></div>
        <h2>Stark gemacht!</h2>
        <p>{day.title} · {day.focus}</p>
        <div className="summaryGrid">
          <div><Clock3 size={18} /><strong>{humanDuration(durationMs)}</strong><span>Dauer</span></div>
          {volume > 0
            ? <div><Dumbbell size={18} /><strong>{fmtVolume(volume)}</strong><span>Volumen</span></div>
            : <div><ListChecks size={18} /><strong>{completed}/{total}</strong><span>Übungen</span></div>}
          <div><CheckCircle2 size={18} /><strong>{sets}</strong><span>Sätze</span></div>
          <div><Flame size={18} /><strong>{weekCount}/{goal}</strong><span>Wochenziel</span></div>
        </div>
        {prs.length > 0 && (
          <div className="recordList">
            <h3><Medal size={18} /> {prs.length === 1 ? 'Neuer Rekord' : `${prs.length} neue Rekorde`}</h3>
            <ul>
              {prs.map((p) => <li key={p.name}><span>{p.name}</span><strong className="num">{p.text}</strong></li>)}
            </ul>
          </div>
        )}
        {badges.length > 0 && (
        <div className="badgeUnlock">
          {badges.map((b) => (
            <div key={b.id}>
              <BadgeIcon id={b.id} />
              <span><strong>{b.title}</strong><small>{b.text}</small></span>
            </div>
          ))}
        </div>
      )}
      <span className="savedSuccess"><CheckCircle2 size={16} /> Im Kalender gespeichert</span>
        <div className="finishActions">
          <button className="primaryAction" onClick={onStats}><CalendarDays size={20} /> Fortschritt</button>
          <button className="ghostBtn" onClick={onRestart}><RotateCcw size={18} /> Nochmal</button>
        </div>
      </div>
  )
}
