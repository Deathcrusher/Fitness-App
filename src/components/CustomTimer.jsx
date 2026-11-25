import React, { useEffect, useRef, useState } from 'react'
import { Minus, Pause, Play, Plus, RotateCcw, Timer as TimerIcon } from 'lucide-react'
import { fmt } from '../lib/plans'
import { ensureAudio, tick, signal } from '../lib/audio'
import { secondsUntil,timerMinutes } from '../lib/controlValues'

const PRESETS = [1, 3, 5, 10]
const MAX_MINUTES = 180
const STORAGE_KEY = 'fitflow-custom-timer-v1'
const DIAL_START = -135
const DIAL_SWEEP = 270

function loadMinutes() {
  try{return timerMinutes(localStorage.getItem(STORAGE_KEY))}catch{return 5}
}

export default function CustomTimer() {
  const [minutes, setMinutes] = useState(loadMinutes)
  const [secondsLeft, setSecondsLeft] = useState(loadMinutes() * 60)
  const [running, setRunning] = useState(false)
  const wakeLockRef = useRef(null)
  const draggingRef = useRef(false)
  const deadlineRef = useRef(null)
  const lastTickRef = useRef(null)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(minutes)) } catch { /* noop */ }
  }, [minutes])

  useEffect(() => {
    if (!running) return
    function update(){
      if(deadlineRef.current===null)return
      const left=secondsUntil(deadlineRef.current)
      setSecondsLeft(left)
      if(left===0){
        deadlineRef.current=null
        setRunning(false)
        signal('done')
      }else if(left<=3&&lastTickRef.current!==left){
        lastTickRef.current=left
        tick()
      }
    }
    update()
    const id=window.setInterval(update,200)
    document.addEventListener('visibilitychange',update)
    return ()=>{window.clearInterval(id);document.removeEventListener('visibilitychange',update)}
  }, [running])

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

  function chooseMinutes(value){
    if(running)return
    const n=Math.max(1,Math.min(MAX_MINUTES,value))
    deadlineRef.current=null
    lastTickRef.current=null
    setMinutes(n)
    setSecondsLeft(n*60)
  }
  function changeMinutes(delta) {
    chooseMinutes(minutes+delta)
  }
  function minutesFromPointer(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - (rect.left + rect.width / 2)
    const y = event.clientY - (rect.top + rect.height / 2)
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90
    if (angle < 0) angle += 360

    let position = (angle - 225 + 360) % 360
    if (position > DIAL_SWEEP) position = angle < 180 ? DIAL_SWEEP : 0
    return 1 + Math.round((position / DIAL_SWEEP) * (MAX_MINUTES - 1))
  }
  function updateFromPointer(event) {
    if (running) return
    chooseMinutes(minutesFromPointer(event))
  }
  function beginDial(event) {
    if (running) return
    draggingRef.current = true
    event.currentTarget.setPointerCapture?.(event.pointerId)
    updateFromPointer(event)
  }
  function moveDial(event) {
    if (draggingRef.current) updateFromPointer(event)
  }
  function endDial(event) {
    draggingRef.current = false
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }
  function handleDialKey(event) {
    const steps = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -5, PageUp: 5 }
    if (steps[event.key] && !running) {
      event.preventDefault()
      changeMinutes(steps[event.key])
    } else if (event.key === 'Home' && !running) {
      event.preventDefault()
      chooseMinutes(1)
    } else if (event.key === 'End' && !running) {
      event.preventDefault()
      chooseMinutes(MAX_MINUTES)
    }
  }
  function setPreset(value) {
    chooseMinutes(value)
  }
  function toggle() {
    ensureAudio()
    if(running){
      const left=deadlineRef.current===null?secondsLeft:secondsUntil(deadlineRef.current)
      deadlineRef.current=null
      setSecondsLeft(left)
      setRunning(false)
      return
    }
    const left=secondsLeft===0?minutes*60:secondsLeft
    lastTickRef.current=null
    deadlineRef.current=Date.now()+left*1000
    setSecondsLeft(left)
    setRunning(true)
  }
  function reset() {
    deadlineRef.current=null
    lastTickRef.current=null
    setRunning(false)
    setSecondsLeft(minutes * 60)
  }

  const done = secondsLeft === 0
  const settingProgress = (minutes - 1) / (MAX_MINUTES - 1)
  const countdownProgress = secondsLeft / (minutes * 60)
  const dialProgress = running || done || secondsLeft !== minutes * 60 ? countdownProgress : settingProgress
  const dialAngle = DIAL_START + settingProgress * DIAL_SWEEP
  const fresh = !done && secondsLeft === minutes * 60

  return (
    <article className="customTimer ffPolishedTimer">
      <div className="panelHead">
        <div>
          <p className="muted">Eigener Timer</p>
          <h2>Freie Zeit</h2>
        </div>
        <span><TimerIcon size={20} /></span>
      </div>
      <p className="dayTone">Stell deine Minuten ein – für alles, was du außerhalb der Pläne trainieren willst.</p>

      <div className="timerDialWrap">
        <button className="timerStepperBtn" onClick={() => changeMinutes(-1)} disabled={running || minutes <= 1} aria-label="1 Minute weniger"><Minus size={24} /></button>
        <div
          className={`timerDial${running ? ' running' : ''}${done ? ' done' : ''}`}
          style={{ '--dial-progress': `${dialProgress * 270}deg`, '--dial-angle': `${dialAngle}deg` }}
          role="slider"
          tabIndex={running ? -1 : 0}
          aria-label="Timerdauer in Minuten"
          aria-valuemin="1"
          aria-valuemax={MAX_MINUTES}
          aria-valuenow={minutes}
          aria-valuetext={`${minutes} Minute${minutes === 1 ? '' : 'n'}`}
          aria-disabled={running}
          onPointerDown={beginDial}
          onPointerMove={moveDial}
          onPointerUp={endDial}
          onPointerCancel={endDial}
          onKeyDown={handleDialKey}
        >
          <div className="timerDialTicks" aria-hidden="true" />
          <div className="timerDialTrack" aria-hidden="true" />
          {!running && <div className="timerDialHandle" aria-hidden="true"><span /></div>}
          <div className="timerDialFace">
            <span className="timerDialEyebrow">{running ? 'Noch' : done ? 'Fertig' : fresh ? 'Drehen' : 'Pausiert'}</span>
            <strong>{fmt(secondsLeft)}</strong>
            <span className="timerDialCaption">{running||!fresh&&!done ? 'verbleibend' : `${minutes} Minute${minutes === 1 ? '' : 'n'}`}</span>
          </div>
          <span className="timerDialMin" aria-hidden="true">1</span>
          <span className="timerDialMax" aria-hidden="true">180</span>
        </div>
        <button className="timerStepperBtn" onClick={() => changeMinutes(1)} disabled={running || minutes >= MAX_MINUTES} aria-label="1 Minute mehr"><Plus size={24} /></button>
      </div>

      <div className="restPresets" aria-label="Minuten-Presets">
        <span>Schnellwahl</span>
        {PRESETS.map((preset) => (
          <button key={preset} className={minutes === preset ? 'active' : ''} disabled={running} onClick={() => setPreset(preset)}>
            {preset} Min.
          </button>
        ))}
      </div>

      <div className="controls startResetControls">
        <button className="primaryAction" onClick={toggle}>
          {running ? <Pause size={20} /> : <Play size={20} />}
          {running ? 'Pause' : fresh || done ? 'Starten' : 'Weiterlaufen'}
        </button>
        <button className="iconAction" onClick={reset} aria-label="Zurücksetzen"><RotateCcw size={20} /></button>
      </div>
    </article>
  )
}
