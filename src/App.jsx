import React, { useEffect, useRef, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Dumbbell,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipForward,
  Sparkles,
  TimerReset,
  Trash2,
  Trophy,
  Video,
} from 'lucide-react'
import {
  builtinPlans,
  TYPE_META,
  imageFor,
  timedSeconds,
  fmt,
  videoKey,
  emptyPlan,
  duplicatePlan,
  examplePlans,
  makeId,
  generatePlan,
  PROGRAM_TEMPLATES,
  youtubeSearchUrl,
} from './plans'
import VideoPlayer from './VideoPlayer'
import Builder from './Builder'
import Generator from './Generator'

const PAUSE_PRESETS = [30, 60, 90]
const WORK_PRESETS = [20, 30, 45, 60, 90]
const APP_VERSION = 'V1.0'
const STORAGE_KEY = 'fitflow-state-v2'
const CUSTOM_KEY = 'fitflow-custom-plans-v1'
const VIDEOS_KEY = 'fitflow-videos-v1'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}
function loadCustomPlans() {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY)
    if (raw === null) {
      const seeded = {}
      for (const p of examplePlans()) seeded[p.id] = p
      return seeded
    }
    const parsed = JSON.parse(raw)
    const out = {}
    for (const [k, v] of Object.entries(parsed)) {
      out[k] = { ...v, owner: v.owner || 'connie' }
    }
    return out
  } catch {
    return {}
  }
}
function loadVideos() {
  try {
    const raw = localStorage.getItem(VIDEOS_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

let audioCtx = null
function ensureAudio() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    if (audioCtx.state === 'suspended') audioCtx.resume()
  } catch {
    /* noop */
  }
}
function tone(freq, dur, when = 0, type = 'sine', peak = 0.25) {
  ensureAudio()
  if (!audioCtx) return
  try {
    const start = audioCtx.currentTime + when
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = type
    osc.frequency.value = freq
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
    osc.start(start)
    osc.stop(start + dur)
  } catch {
    /* noop */
  }
}
function melody(notes, type = 'triangle', peak = 0.4) {
  notes.forEach(([freq, when, dur]) => tone(freq, dur, when, type, peak))
}
function tick() {
  tone(1100, 0.07, 0, 'sine', 0.22)
}
function vibrate(pattern) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* noop */
  }
}
function signal(kind) {
  ensureAudio()
  if (kind === 'work-done') {
    vibrate([180])
    melody([
      [659, 0.0, 0.3],
      [784, 0.16, 0.3],
      [1047, 0.32, 0.3],
      [1319, 0.5, 0.55],
    ])
  } else if (kind === 'rest-end') {
    vibrate([120, 60, 120])
    melody([
      [523, 0.0, 0.3],
      [659, 0.16, 0.3],
      [784, 0.32, 0.3],
      [1047, 0.5, 0.55],
    ])
  } else if (kind === 'done') {
    vibrate([140, 80, 140, 80, 220])
    melody([
      [784, 0.0, 0.36],
      [880, 0.2, 0.36],
      [1047, 0.4, 0.36],
      [1175, 0.62, 0.36],
      [1319, 0.82, 0.36],
      [1568, 1.04, 0.52],
      [1319, 1.42, 0.36],
      [1568, 1.62, 0.36],
      [1760, 1.84, 0.52],
      [1568, 2.2, 0.36],
      [2093, 2.42, 1.1],
    ], 'triangle', 0.45)
  }
}

export default function App() {
  const [customPlans, setCustomPlans] = useState(loadCustomPlans)
  const [videos, setVideos] = useState(loadVideos)
  const allPlans = { ...builtinPlans, ...customPlans }

  const saved = loadState()
  const savedPerson = allPlans[saved.person] ? saved.person : 'connie'
  const savedDayIndex = Math.min(
    Math.max(Number(saved.dayIndex) || 0, 0),
    allPlans[savedPerson].days.length - 1,
  )
  const savedSteps = allPlans[savedPerson].days[savedDayIndex].steps
  const savedStepIndex = Math.min(
    Math.max(Number(saved.stepIndex) || 0, 0),
    savedSteps.length - 1,
  )
  const initialStep = savedSteps[savedStepIndex]
  const initialWork = timedSeconds(initialStep.reps)

  const [view, setView] = useState('train')
  const initialOwner = builtinPlans[savedPerson] ? savedPerson : (allPlans[savedPerson]?.owner || 'connie')
  const [builderOwner, setBuilderOwner] = useState(initialOwner)
  const [person, setPerson] = useState(savedPerson)
  const [dayIndex, setDayIndex] = useState(savedDayIndex)
  const [stepIndex, setStepIndex] = useState(savedStepIndex)
  const [phase, setPhase] = useState('work')
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(initialWork != null ? initialWork : 0)
  const [workSeconds, setWorkSeconds] = useState(initialWork != null ? initialWork : 0)
  const [pauseSeconds, setPauseSeconds] = useState(saved.pauseSeconds || 60)
  const [showVideo, setShowVideo] = useState(false)
  const [linkTarget, setLinkTarget] = useState(null)
  const [confirmKey, setConfirmKey] = useState(null)
  const [generatorOpen, setGeneratorOpen] = useState(false)
  const [updateInfo, setUpdateInfo] = useState(null)
  const expectingRefresh = useRef(false)

  const wakeLockRef = useRef(null)
  const skipPersonReset = useRef(true)

  const plan = allPlans[person]
  const currentOwner = plan.builtin ? person : (plan.owner || 'connie')
  const day = plan.days[dayIndex]
  const steps = day.steps
  const currentStep = steps[stepIndex] || steps[steps.length - 1]
  const parsedWork = timedSeconds(currentStep.reps)
  const isTimed = parsedWork != null
  const meta = TYPE_META[currentStep.type]
  const TypeIcon = meta.icon

  const programId = person
  const stepVideo = currentStep.video || videos[videoKey(programId, dayIndex, currentStep)] || null
  const hasVideo = (item) => Boolean(item.video || videos[videoKey(programId, dayIndex, item)])

  const completedSteps = phase === 'done' ? steps.length : phase === 'rest' ? stepIndex + 1 : stepIndex
  const progress = Math.min(100, Math.round((completedSteps / steps.length) * 100))
  const phaseLabel = phase === 'done' ? 'Fertig' : phase === 'rest' ? 'Pause' : meta.label
  const showTimer = phase === 'rest' || (phase === 'work' && isTimed)
  const restEnded = phase === 'rest' && seconds === 0 && !running

  useEffect(() => {
    function onUpdate(e) { setUpdateInfo(e.detail) }
    window.addEventListener('sw-update', onUpdate)
    const sw = navigator.serviceWorker
    function onCtrl() { if (expectingRefresh.current) window.location.reload() }
    sw?.addEventListener('controllerchange', onCtrl)
    return () => {
      window.removeEventListener('sw-update', onUpdate)
      sw?.removeEventListener('controllerchange', onCtrl)
    }
  }, [])

  function applyUpdate() {
    expectingRefresh.current = true
    updateInfo?.registration?.waiting?.postMessage('SKIP_WAITING')
  }

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ person, dayIndex, stepIndex, pauseSeconds }))
    } catch {
      /* noop */
    }
  }, [person, dayIndex, stepIndex, pauseSeconds])

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(customPlans))
    } catch {
      /* noop */
    }
  }, [customPlans])

  useEffect(() => {
    try {
      localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos))
    } catch {
      /* noop */
    }
  }, [videos])

  function enterWork(nextStepIndex) {
    const target = steps[nextStepIndex]
    const work = timedSeconds(target.reps)
    setStepIndex(nextStepIndex)
    setPhase('work')
    setRunning(false)
    setSeconds(work != null ? work : 0)
    setWorkSeconds(work != null ? work : 0)
    setShowVideo(false)
  }

  function completeExercise() {
    if (currentStep.type === 'warmup') {
      advanceAfterRest()
      return
    }
    setPhase('rest')
    setSeconds(pauseSeconds)
    setRunning(true)
    setShowVideo(false)
  }

  function advanceAfterRest() {
    if (stepIndex < steps.length - 1) {
      enterWork(stepIndex + 1)
    } else {
      setPhase('done')
      setRunning(false)
      setSeconds(0)
      signal('done')
    }
  }

  function selectDay(index) {
    const firstStep = allPlans[person].days[index].steps[0]
    const work = timedSeconds(firstStep.reps)
    setDayIndex(index)
    setStepIndex(0)
    setPhase('work')
    setRunning(false)
    setSeconds(work != null ? work : 0)
    setWorkSeconds(work != null ? work : 0)
    setShowVideo(false)
  }

  function selectStep(index) {
    enterWork(index)
  }

  function togglePlay() {
    ensureAudio()
    setRunning((value) => !value)
  }

  function changePause(value) {
    setPauseSeconds(value)
    if (phase === 'rest') setSeconds(value)
  }

  function changeWork(value) {
    setWorkSeconds(value)
    setSeconds(value)
  }

  function resetPause() {
    setRunning(false)
    setSeconds(pauseSeconds)
  }

  function resetWorkout() {
    enterWork(0)
  }

  function createProgram() {
    const owner = view === 'build' ? builderOwner : currentOwner
    const p = { ...emptyPlan(), owner }
    setBuilderOwner(owner)
    setCustomPlans((cp) => ({ ...cp, [p.id]: p }))
    setPerson(p.id)
    setView('build')
  }

  function duplicateBuiltin(key) {
    const copy = { ...duplicatePlan(builtinPlans[key], key), owner: builderOwner }
    setCustomPlans((cp) => ({ ...cp, [copy.id]: copy }))
    setPerson(copy.id)
    setView('build')
  }

  function updateCurrentPlan(updated) {
    setCustomPlans((cp) => ({ ...cp, [updated.id]: updated }))
  }

  function deleteProgram(key) {
    setConfirmKey(key)
  }

  function confirmDelete() {
    const key = confirmKey
    setCustomPlans((cp) => {
      const next = { ...cp }
      delete next[key]
      return next
    })
    if (person === key) setPerson('connie')
    setConfirmKey(null)
  }

  function runProgram(key) {
    setPerson(key)
    setView('train')
  }

  function openGenerator() {
    setGeneratorOpen(true)
  }

  function generateProgram(options) {
    const p = generatePlan({ ...options, owner: builderOwner })
    setCustomPlans((cp) => ({ ...cp, [p.id]: p }))
    setPerson(p.id)
    setView('build')
    setGeneratorOpen(false)
  }

  function addTemplate(template) {
    const p = {
      ...template,
      id: makeId(),
      owner: builderOwner,
      days: JSON.parse(JSON.stringify(template.days)),
    }
    setCustomPlans((cp) => ({ ...cp, [p.id]: p }))
    setPerson(p.id)
    setView('build')
  }

  function saveVideoLink(key, url) {
    setVideos((v) => {
      const next = { ...v }
      const value = (url || '').trim()
      if (value) next[key] = value
      else delete next[key]
      return next
    })
    setLinkTarget(null)
  }

  useEffect(() => {
    if (skipPersonReset.current) {
      skipPersonReset.current = false
      return
    }
    const fallback = allPlans[person] ? person : 'connie'
    setDayIndex(0)
    setStepIndex(0)
    setPhase('work')
    setRunning(false)
    const firstStep = allPlans[fallback].days[0].steps[0]
    const work = timedSeconds(firstStep.reps)
    setSeconds(work != null ? work : 0)
    setWorkSeconds(work != null ? work : 0)
    setShowVideo(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person])

  useEffect(() => {
    if (!running || phase === 'done') return
    const id = window.setInterval(() => {
      setSeconds((value) => (value > 0 ? value - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [running, phase])

  useEffect(() => {
    if (!running || phase === 'done') return
    if (phase !== 'rest' && !(phase === 'work' && isTimed)) return
    if (seconds > 0 && seconds <= 3) tick()
  }, [seconds, running, phase, isTimed])

  useEffect(() => {
    if (seconds !== 0 || !running) return
    const id = window.setTimeout(() => {
      if (phase === 'work' && isTimed) {
        signal('work-done')
        setRunning(false)
      } else if (phase === 'rest') {
        signal('rest-end')
        setRunning(false)
      }
    }, 200)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, running])

  useEffect(() => {
    async function acquire() {
      try {
        if ('wakeLock' in navigator) wakeLockRef.current = await navigator.wakeLock.request('screen')
      } catch {
        /* noop */
      }
    }
    function release() {
      try {
        wakeLockRef.current?.release()
        wakeLockRef.current = null
      } catch {
        /* noop */
      }
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
        } catch {
          /* noop */
        }
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [running])

  const builtinEntries = Object.entries(builtinPlans)
  const customEntries = Object.entries(customPlans).filter(([, p]) => (p.owner || 'connie') === currentOwner)

  return (
    <main className={`app ${plan.accent}`}>
      <nav className="topnav" aria-label="Hauptnavigation">
        <span className="brand"><Sparkles size={16} /> FitFlow <small className="versionTag">{APP_VERSION}</small></span>
        <div className="navTabs">
          <button className={view === 'train' ? 'active' : ''} onClick={() => setView('train')}>Training</button>
          <button className={view === 'build' ? 'active' : ''} onClick={() => { setBuilderOwner(currentOwner); setView('build') }}>Programme</button>
        </div>
      </nav>

      {view === 'train' ? (
        <>
          <section className="hero" aria-label="Trainingsübersicht">
            <div className="heroCopy">
              <span className="eyebrow"><Dumbbell size={16} /> {plan.builtin ? 'Grundtraining' : 'Eigenes Programm'}</span>
              <h1>{plan.name}</h1>
              <p>{plan.title}</p>
              <div className="quickStats" aria-label="Trainingsdaten">
                <span><CalendarDays size={16} /> {plan.days.length} Tage</span>
                <span><Clock3 size={16} /> {pauseSeconds}s Pause</span>
                <span><Video size={16} /> {Object.keys(videos).length} Videos</span>
              </div>
            </div>
            <img className="heroImage" src="/assets/hero.jpg" alt="Helles Home-Workout mit Matte und Hanteln" fetchPriority="high" decoding="async" />
          </section>

          <section className="switcher grouped" aria-label="Programm wählen">
            <span className="groupLabel">Grundtraining</span>
            {builtinEntries.map(([key, item]) => (
              <button key={key} className={person === key ? 'active' : ''} onClick={() => setPerson(key)}>
                <span className="avatar">{item.name.slice(0, 1)}</span>
                <span className="switchCopy"><strong>{item.name}</strong><small>{item.title}</small></span>
              </button>
            ))}
            {customEntries.length > 0 && <span className="groupLabel">Eigene Programme</span>}
            {customEntries.map(([key, item]) => (
              <button key={key} className={person === key ? 'active' : ''} onClick={() => setPerson(key)}>
                <span className="avatar">{item.name.slice(0, 1)}</span>
                <span className="switchCopy"><strong>{item.name}</strong><small>{item.title}</small></span>
              </button>
            ))}
            <button className="addProgram" onClick={createProgram}>
              <Plus size={20} /> <span>Neues Programm</span>
            </button>
          </section>

          <section className="dayRail" aria-label="Trainingstag wählen">
            {plan.days.map((item, index) => (
              <button key={`${item.title}-${index}`} className={dayIndex === index ? 'active' : ''} onClick={() => selectDay(index)}>
                <strong>{item.title}</strong>
                <span>{item.focus}</span>
              </button>
            ))}
          </section>

          <section className="dashboard">
            <article className="sessionCard">
              {phase === 'done' ? (
                <div className="finishState">
                  <Trophy size={76} />
                  <h2>Training fertig</h2>
                  <p>{day.title}: {day.focus}</p>
                  <button className="primaryAction" onClick={resetWorkout}><RotateCcw size={20} /> Neu starten</button>
                </div>
              ) : (
                <>
                  <div className="sessionImageWrap">
                    <img src={imageFor(currentStep, plan.builtin ? person : 'custom')} alt={`${currentStep.name} Foto`} loading="lazy" decoding="async" />
                    <div className="phaseBadge"><TypeIcon size={16} /> {phaseLabel}</div>
                  </div>

                  <div className="sessionHeader">
                    <div>
                      <p className="muted">{day.title} · {day.focus}</p>
                      <h2>{phase === 'rest' ? 'Pause' : currentStep.name}</h2>
                    </div>
                    <span className="repBadge">{currentStep.reps}</span>
                  </div>

                  <p className="exerciseText">
                    {phase === 'rest'
                      ? restEnded
                        ? 'Pause vorbei – tippe auf Weiter, wenn du startklar bist.'
                        : 'Atmen, kurz trinken und bereit machen.'
                      : currentStep.detail}
                  </p>

                  {phase === 'work' && stepVideo && (
                    <div className="videoActions">
                      <button className="ghostBtn" onClick={() => setShowVideo((v) => !v)}>
                        <Video size={16} /> {showVideo ? 'Video ausblenden' : 'Video anzeigen'}
                      </button>
                      {plan.builtin && (
                        <button className="ghostBtn" onClick={() => setLinkTarget({ key: videoKey(programId, dayIndex, currentStep), value: videos[videoKey(programId, dayIndex, currentStep)] || '', name: currentStep.name })}>
                          Ändern
                        </button>
                      )}
                    </div>
                  )}
                  {phase === 'work' && !stepVideo && plan.builtin && (
                    <div className="videoActions">
                      <button className="ghostBtn" onClick={() => setLinkTarget({ key: videoKey(programId, dayIndex, currentStep), value: '', name: currentStep.name })}>
                        <Video size={16} /> Video verknüpfen
                      </button>
                    </div>
                  )}
                  {phase === 'work' && !stepVideo && !plan.builtin && (
                    <p className="videoHint"><Video size={14} /> Tipp: Unter „Programme“ kannst du jeder Übung ein Video geben.</p>
                  )}
                  {showVideo && stepVideo && phase === 'work' && (
                    <VideoPlayer url={stepVideo} onClose={() => setShowVideo(false)} />
                  )}

                  {showTimer && (
                    <div className="timerPanel" aria-label={phase === 'rest' ? 'Pausentimer' : 'Halte-Timer'}>
                      <TimerReset size={24} />
                      <strong>{fmt(seconds)}</strong>
                      <span>{phase === 'rest' ? 'Pause' : 'Halten'}</span>
                    </div>
                  )}

                  <div className="progressLine"><span style={{ width: `${progress}%` }} /></div>

                  {phase === 'rest' ? (
                    <>
                      <div className={`controls pauseControls${restEnded ? ' singleAction' : ''}`}>
                        {restEnded ? (
                          <button className="primaryAction" onClick={advanceAfterRest}>
                            <SkipForward size={20} /> Weiter
                          </button>
                        ) : (
                          <>
                            <button className="primaryAction" onClick={togglePlay}>
                              {running ? <Pause size={20} /> : <Play size={20} />}
                              {running ? 'Pause' : 'Weiterlaufen'}
                            </button>
                            <button onClick={advanceAfterRest}><SkipForward size={20} /> Überspringen</button>
                            <button className="iconAction" onClick={resetPause} aria-label="Pause zurücksetzen"><RotateCcw size={20} /></button>
                          </>
                        )}
                      </div>
                      <div className="restPresets" aria-label="Pausenlänge">
                        <span>Pause:</span>
                        {PAUSE_PRESETS.map((preset) => (
                          <button key={preset} className={pauseSeconds === preset ? 'active' : ''} onClick={() => changePause(preset)}>
                            {preset}s
                          </button>
                        ))}
                      </div>
                    </>
                  ) : isTimed ? (
                    <>
                      <div className="controls workControls">
                        <button className="primaryAction" onClick={togglePlay}>
                          {running ? <Pause size={20} /> : <Play size={20} />}
                          {running ? 'Pause' : 'Timer starten'}
                        </button>
                        <button className="doneAction" onClick={completeExercise}><CheckCircle2 size={20} /> Erledigt</button>
                        <button className="iconAction" onClick={resetWorkout} aria-label="Neustart"><RotateCcw size={20} /></button>
                      </div>
                      <div className="restPresets" aria-label="Übungs-Dauer">
                        <span>Dauer:</span>
                        {WORK_PRESETS.map((preset) => (
                          <button key={preset} className={workSeconds === preset ? 'active' : ''} onClick={() => changeWork(preset)}>
                            {preset}s
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="controls exerciseControls">
                      <button className="doneAction" onClick={completeExercise}><CheckCircle2 size={20} /> Erledigt</button>
                      <button onClick={resetWorkout}><RotateCcw size={20} /> Neustart</button>
                    </div>
                  )}
                </>
              )}
            </article>

            <aside className="planPanel">
              <div className="panelHead">
                <div>
                  <p className="muted">{plan.equipment}</p>
                  <h2>{day.focus}</h2>
                </div>
                <span>{progress}%</span>
              </div>
              <p className="dayTone">{day.tone}</p>
              <div className="stepList">
                {steps.map((item, index) => {
                  const ItemIcon = TYPE_META[item.type].icon
                  const state = index === stepIndex && phase !== 'done' ? 'current' : index < completedSteps ? 'done' : ''
                  const linked = hasVideo(item)
                  return (
                    <button key={`${item.name}-${index}`} className={state} onClick={() => selectStep(index)}>
                      <span className="stepIcon">{state === 'done' ? <CheckCircle2 size={18} /> : <ItemIcon size={18} />}</span>
                      <span className="stepCopy"><strong>{item.name}</strong><small>{item.reps}</small></span>
                      {linked ? <Video size={15} className="stepVideoIcon" /> : <ChevronRight size={18} />}
                    </button>
                  )
                })}
              </div>
            </aside>
          </section>
        </>
      ) : (
        <section className="dashboard editorMode">
          <Builder
            customPlans={customPlans}
            builtinPlans={builtinPlans}
            owner={builderOwner}
            onOwner={setBuilderOwner}
            selected={customPlans[person] ? person : null}
            templates={PROGRAM_TEMPLATES}
            onChange={updateCurrentPlan}
            onNew={createProgram}
            onGenerate={openGenerator}
            onAddTemplate={addTemplate}
            onDuplicateBuiltin={duplicateBuiltin}
            onDelete={deleteProgram}
            onBack={() => setView('train')}
            onRun={runProgram}
          />
        </section>
      )}

      {linkTarget && (
        <div className="modalOverlay" onClick={() => setLinkTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Video verknüpfen">
            <h3>Video verknüpfen</h3>
            <p className="muted">YouTube-Link oder direkte Video-URL (z. B. .mp4).</p>
            <input
              className="modalInput"
              type="url"
              value={linkTarget.value}
              onChange={(e) => setLinkTarget((t) => ({ ...t, value: e.target.value }))}
              placeholder="https://youtu.be/…"
              autoFocus
            />
            <a className="searchLink" href={youtubeSearchUrl(linkTarget.name || '')} target="_blank" rel="noreferrer">
              → Passendes Video auf YouTube suchen
            </a>
            <div className="modalActions">
              <button className="ghostBtn" onClick={() => setLinkTarget(null)}>Abbrechen</button>
              {videos[linkTarget.key] && (
                <button className="ghostBtn danger" onClick={() => saveVideoLink(linkTarget.key, '')}>Entfernen</button>
              )}
              <button className="primaryAction" onClick={() => saveVideoLink(linkTarget.key, linkTarget.value)}>Speichern</button>
            </div>
          </div>
        </div>
      )}

      {confirmKey && (
        <div className="modalOverlay" onClick={() => setConfirmKey(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Programm löschen">
            <h3>Programm löschen?</h3>
            <p className="muted">„{customPlans[confirmKey]?.name}" wird endgültig gelöscht.</p>
            <div className="modalActions">
              <button className="ghostBtn" onClick={() => setConfirmKey(null)}>Abbrechen</button>
              <button className="ghostBtn danger" onClick={confirmDelete}><Trash2 size={16} /> Löschen</button>
            </div>
          </div>
        </div>
      )}

      <Generator
        open={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
        onGenerate={generateProgram}
      />

      {updateInfo && (
        <div className="updateBanner" role="status">
          <span>Neue Version verfügbar.</span>
          <button className="primaryAction" onClick={applyUpdate}>Neu laden</button>
        </div>
      )}
    </main>
  )
}
