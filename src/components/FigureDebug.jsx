import React from 'react'
import { FigureFrame, MOVES, cycleLength } from './ExerciseFigure'

/* Prüfansicht: /?figures – jede Bewegung in 6 Phasen */
export default function FigureDebug() {
  const only = new URLSearchParams(window.location.search).get('figures')
  const keys = Object.keys(MOVES).filter((k) => !only || only === '1' || only.split(',').includes(k))
  return (
    <main className={`figDebug app ${new URLSearchParams(window.location.search).get('accent') || ''}`}>
      {keys.map((key) => {
        const total = cycleLength(MOVES[key])
        return (
          <section key={key} id={key}>
            <h2>{key}</h2>
            <div>
              {Array.from({ length: 6 }, (_, i) => (
                <FigureFrame key={i} moveKey={key} time={(total * i) / 6} showCue={false} label={key} />
              ))}
            </div>
          </section>
        )
      })}
    </main>
  )
}
