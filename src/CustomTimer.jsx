import React, { useEffect, useRef, useState } from 'react'
import { Minus, Pause, Play, Plus, RotateCcw, Timer as TimerIcon } from 'lucide-react'
import { fmt } from './plans'
import { ensureAudio, tick, signal } from './audio'

const PRESETS = [1, 3, 5, 10]
const MAX_MINUTES = 180
const STORAGE_KEY = 'fitflow-custom-timer-v1'

function loadMinutes() {
  const v = Number(localStorage.getItem(STORAGE_KEY))
  return v >= 1 && v <= MAX_MINUTES ? v : 5
}

export default function CustomTimer() {
  const [minutes, setMinutes] = useState(loadMinutes)
  const [secondsLeft, setSecondsLeft] = useState(loadMinutes() * 60)
  const [running, setRunning] = useState(false)
  const wakeLockRef = useRef(null)

  useEffect(() => {
    if (!running) setSecondsLeft(minutes * 60)
  }, [minutes, running])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(minutes)) } catch { /* noop */ }
  }, [minutes])

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setSecondsLeft((value) => (value > 0 ? value - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  useEffect(() => {
    if (!running) return
    if (secondsLeft > 0 && secondsLeft <= 3) tick()
  }, [secondsLeft, running])

  useEffect(() => {
    if (secondsLeft !== 0 || !running) return
    const id = window.setTimeout(() => {
      signal('done')
      setRunning(false)
    }, 200)
    return () => window.clearTimeout(id)
  }, [secondsLeft, running])

  useEffect(() => {
    async function acquire() {
      try {
        if ('wakeLock' in navigator) wakeLockRef.current = await navigator.wakeLock.request('screen')
      } catch { /* noop */ }
    }
    function release() {
      try {
        wakeLockRef.current?.release()
        wakeLockRef.current = null
      } catch { /* noop */ }
    }
    if (running) acquire()
    else release()
    return () => release()
  }, [running])

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible' && running) {
        try {
          if ('wakeLock' in navigator) navigator.wakeLock.request('screen').then((lock) => {
            wakeLockRef.current = lock
          }).catch(() => {})
        } catch { /* noop */ }
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [running])

  function changeMinutes(delta) {
    setRunning(false)
    setMinutes((m) => Math.max(1, Math.min(MAX_MINUTES, m + delta)))
  }
  function setPreset(value) {
    setRunning(false)
    setMinutes(value)
  }
  function toggle() {
    ensureAudio()
    setSecondsLeft((value) => (value === 0 ? minutes * 60 : value))
    setRunning((r) => !r)
  }
  function reset() {
    setRunning(false)
    setSecondsLeft(minutes * 60)
  }

  const done = secondsLeft === 0

  return (
    <article className="customTimer">
      <div className="panelHead">
        <div>
          <p className="muted">Eigener Timer</p>
          <h2>Freie Zeit</h2>
        </div>
        <span><TimerIcon size={20} /></span>
      </div>
      <p className="dayTone">Stell deine Minuten ein – für alles, was du außerhalb der Pläne trainieren willst.</p>

      <div className="timerStepper">
        <button className="timerStepperBtn" onClick={() => changeMinutes(-1)} disabled={running || minutes <= 1} aria-label="1 Minute weniger"><Minus size={28} /></button>
        <div className={`timerStepperValue${done ? ' done' : ''}`}>
          <strong>{fmt(secondsLeft)}</strong>
          <span>{running ? 'verbleibend' : `${minutes} Minute${minutes === 1 ? '' : 'n'}`}</span>
        </div>
        <button className="timerStepperBtn" onClick={() => changeMinutes(1)} disabled={running || minutes >= MAX_MINUTES} aria-label="1 Minute mehr"><Plus size={28} /></button>
      </div>

      <div className="restPresets" aria-label="Minuten-Presets">
        <span>Schnellwahl:</span>
        {PRESETS.map((preset) => (
          <button key={preset} className={minutes === preset ? 'active' : ''} disabled={running} onClick={() => setPreset(preset)}>
            {preset}
          </button>
        ))}
      </div>

      <div className="controls startResetControls">
        <button className="primaryAction" onClick={toggle}>
          {running ? <Pause size={20} /> : <Play size={20} />}
          {running ? 'Pause' : done ? 'Starten' : 'Weiterlaufen'}
        </button>
        <button className="iconAction" onClick={reset} aria-label="Zurücksetzen"><RotateCcw size={20} /></button>
      </div>
    </article>
  )
}
