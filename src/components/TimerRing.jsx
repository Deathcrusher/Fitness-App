import React from 'react'
import { fmt } from '../lib/plans'

export default function TimerRing({ seconds, total, label, running }) {
  const ratio = total > 0 ? Math.max(0, Math.min(1, seconds / total)) : 0
  return (
    <div
      className={`timerRing${running ? ' running' : ''}${seconds === 0 ? ' ended' : ''}`}
      style={{ '--ring': `${ratio * 360}deg` }}
      role="timer"
      aria-label={`${label}: ${fmt(seconds)}`}
    >
      <div className="timerRingFace">
        <strong>{fmt(seconds)}</strong>
        <span>{label}</span>
      </div>
    </div>
  )
}
