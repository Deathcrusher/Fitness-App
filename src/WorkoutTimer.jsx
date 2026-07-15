import React, { useEffect, useRef, useState } from 'react'
import { Clock3, Play, RotateCcw, Trophy } from 'lucide-react'
import { createPortal } from 'react-dom'

const TIMER_STORAGE_KEY = 'fitflow-workout-timer-v1'

function loadTimerState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TIMER_STORAGE_KEY) || '{}')
    return {
      startedAt: Number(parsed.startedAt) || null,
      elapsedMs: Math.max(0, Number(parsed.elapsedMs) || 0),
      running: Boolean(parsed.running && parsed.startedAt),
      completed: Boolean(parsed.completed),
      workoutId: typeof parsed.workoutId === 'string' ? parsed.workoutId : null,
    }
  } catch {
    return { startedAt: null, elapsedMs: 0, running: false, completed: false, workoutId: null }
  }
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function currentWorkoutId() {
  const program = document.querySelector('.hero h1')?.textContent?.trim() || ''
  const day = document.querySelector('.dayRail button.active')?.textContent?.trim() || ''
  return program && day ? `${program}::${day}` : null
}

function ensureSlot(parent, id, beforeNode = null) {
  let slot = document.getElementById(id)
  if (!slot) {
    slot = document.createElement('div')
    slot.id = id
  }
  if (slot.parentElement !== parent) parent.insertBefore(slot, beforeNode)
  return slot
}

export default function WorkoutTimer() {
  const initial = useRef(loadTimerState()).current
  const [startedAt, setStartedAt] = useState(initial.startedAt)
  const [elapsedMs, setElapsedMs] = useState(initial.elapsedMs)
  const [running, setRunning] = useState(initial.running)
  const [completed, setCompleted] = useState(initial.completed)
  const [workoutId, setWorkoutId] = useState(initial.workoutId)
  const [displayMs, setDisplayMs] = useState(() => (
    initial.elapsedMs + (initial.running && initial.startedAt ? Date.now() - initial.startedAt : 0)
  ))
  const [timerSlot, setTimerSlot] = useState(null)
  const [resultSlot, setResultSlot] = useState(null)

  const liveState = useRef({ startedAt, elapsedMs, running, completed, workoutId })
  liveState.current = { startedAt, elapsedMs, running, completed, workoutId }

  function currentElapsed() {
    const state = liveState.current
    return state.elapsedMs + (state.running && state.startedAt ? Date.now() - state.startedAt : 0)
  }

  function startWorkout() {
    const base = completed ? 0 : currentElapsed()
    const now = Date.now()
    setElapsedMs(base)
    setDisplayMs(base)
    setStartedAt(now)
    setRunning(true)
    setCompleted(false)
    setWorkoutId(currentWorkoutId())
  }

  function resetWorkoutTimer() {
    setStartedAt(null)
    setElapsedMs(0)
    setDisplayMs(0)
    setRunning(false)
    setCompleted(false)
    setWorkoutId(null)
  }

  function completeWorkout() {
    const state = liveState.current
    if (!state.running || state.completed) return
    const finalElapsed = currentElapsed()
    liveState.current = {
      startedAt: null,
      elapsedMs: finalElapsed,
      running: false,
      completed: true,
      workoutId: state.workoutId,
    }
    setStartedAt(null)
    setElapsedMs(finalElapsed)
    setDisplayMs(finalElapsed)
    setRunning(false)
    setCompleted(true)
  }

  useEffect(() => {
    try {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({ startedAt, elapsedMs, running, completed, workoutId }))
    } catch {
      /* noop */
    }
  }, [startedAt, elapsedMs, running, completed, workoutId])

  useEffect(() => {
    if (!running) {
      setDisplayMs(elapsedMs)
      return undefined
    }

    const update = () => setDisplayMs(currentElapsed())
    update()
    const id = window.setInterval(update, 250)
    return () => window.clearInterval(id)
  }, [running, startedAt, elapsedMs])

  useEffect(() => {
    function syncWithTrainingView() {
      const sessionCard = document.querySelector('.sessionCard')
      const finishState = document.querySelector('.finishState')
      const visibleWorkoutId = currentWorkoutId()
      const state = liveState.current

      if (state.running && state.workoutId && visibleWorkoutId && state.workoutId !== visibleWorkoutId) {
        resetWorkoutTimer()
      }

      if (sessionCard && !finishState) {
        const dashboard = sessionCard.parentElement
        const slot = ensureSlot(dashboard, 'fitflow-workout-timer-slot', sessionCard)
        setTimerSlot((current) => (current === slot ? current : slot))
      } else {
        document.getElementById('fitflow-workout-timer-slot')?.remove()
        setTimerSlot(null)
      }

      if (finishState) {
        const restartButton = finishState.querySelector('button')
        const slot = ensureSlot(finishState, 'fitflow-workout-result-slot', restartButton)
        setResultSlot((current) => (current === slot ? current : slot))
        completeWorkout()
      } else {
        document.getElementById('fitflow-workout-result-slot')?.remove()
        setResultSlot(null)
      }
    }

    function handleClick(event) {
      const button = event.target.closest('button')
      if (!button) return
      const label = button.textContent.trim().toLowerCase()
      const changesWorkout = button.closest('.dayRail, .switcher')
      const restartsWorkout = label.includes('neustart') || label.includes('neu starten')
      if (changesWorkout || restartsWorkout) window.setTimeout(resetWorkoutTimer, 0)
    }

    syncWithTrainingView()
    const observer = new MutationObserver(syncWithTrainingView)
    observer.observe(document.getElementById('root') || document.body, { childList: true, subtree: true })
    document.addEventListener('click', handleClick)

    return () => {
      observer.disconnect()
      document.removeEventListener('click', handleClick)
    }
  }, [])

  const timerCard = timerSlot && createPortal(
    <section className={`workoutTimerCard${running ? ' running' : ''}`} aria-label="Gesamter Trainings-Timer">
      <div className="workoutTimerIcon"><Clock3 size={24} /></div>
      <div className="workoutTimerCopy">
        <span>{running ? 'Training läuft' : 'Gesamtzeit'}</span>
        <strong aria-live="polite">{formatDuration(displayMs)}</strong>
        <small>{running ? 'Läuft auch während Übungen und Pausen weiter.' : 'Starte den Timer, sobald dein Training beginnt.'}</small>
      </div>
      <div className="workoutTimerActions">
        {!running && (
          <button className="workoutTimerStart" onClick={startWorkout}>
            <Play size={18} /> Training starten
          </button>
        )}
        {(running || displayMs > 0) && (
          <button className="workoutTimerReset" onClick={resetWorkoutTimer} aria-label="Gesamt-Timer zurücksetzen">
            <RotateCcw size={18} /> Zurücksetzen
          </button>
        )}
      </div>
    </section>,
    timerSlot,
  )

  const resultCard = resultSlot && createPortal(
    <div className="workoutDurationResult" aria-live="polite">
      <Trophy size={24} />
      <span>{completed || displayMs > 0 ? 'Deine Trainingszeit' : 'Gesamt-Timer nicht gestartet'}</span>
      <strong>{completed || displayMs > 0 ? formatDuration(displayMs) : '–'}</strong>
    </div>,
    resultSlot,
  )

  return (
    <>
      <style>{`
        #fitflow-workout-timer-slot { min-width: 0; }
        .workoutTimerCard {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 14px;
          border: 1px solid var(--line, #dce3dc);
          border-radius: 8px;
          background: var(--surface, #fff);
          box-shadow: 0 14px 34px rgba(24, 34, 31, 0.08);
        }
        .workoutTimerCard.running { border-color: var(--accent, #2f7667); }
        .workoutTimerIcon {
          display: grid;
          place-items: center;
          flex: 0 0 48px;
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: var(--accent-soft, #dff1e8);
          color: var(--accent-strong, #1f5f51);
        }
        .workoutTimerCard.running .workoutTimerIcon {
          background: var(--accent, #2f7667);
          color: #fff;
        }
        .workoutTimerCopy { min-width: 0; flex: 1; }
        .workoutTimerCopy span,
        .workoutTimerCopy small { display: block; }
        .workoutTimerCopy span {
          color: var(--muted, #68756f);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .04em;
          text-transform: uppercase;
        }
        .workoutTimerCopy strong {
          display: block;
          margin: 2px 0;
          color: var(--ink, #19221f);
          font-size: 30px;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }
        .workoutTimerCopy small {
          color: var(--muted, #68756f);
          font-size: 12px;
          line-height: 1.35;
        }
        .workoutTimerActions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
        .workoutTimerActions button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          gap: 7px;
          padding: 10px 13px;
          border-radius: 8px;
          font: inherit;
          font-weight: 900;
          cursor: pointer;
        }
        .workoutTimerStart { border: 0; background: var(--accent, #2f7667); color: #fff; }
        .workoutTimerReset {
          border: 1px solid var(--line, #dce3dc);
          background: #f5f7f3;
          color: var(--ink, #19221f);
        }
        #fitflow-workout-result-slot { width: min(100%, 360px); }
        .workoutDurationResult {
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: center;
          gap: 4px 10px;
          width: 100%;
          margin: 8px 0 20px;
          padding: 14px 16px;
          border: 1px solid var(--accent, #2f7667);
          border-radius: 8px;
          background: var(--accent-soft, #dff1e8);
          color: var(--accent-strong, #1f5f51);
          text-align: left;
        }
        .workoutDurationResult svg { grid-row: 1 / 3; }
        .workoutDurationResult span { font-size: 13px; font-weight: 900; }
        .workoutDurationResult strong {
          font-size: 32px;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }
        @media (max-width: 620px) {
          .workoutTimerCard { align-items: stretch; flex-wrap: wrap; }
          .workoutTimerCopy strong { font-size: 28px; }
          .workoutTimerActions { width: 100%; }
          .workoutTimerActions button { flex: 1; }
        }
      `}</style>
      {timerCard}
      {resultCard}
    </>
  )
}
