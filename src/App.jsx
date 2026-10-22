import React, { useEffect, useRef, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  Hourglass,
  ListChecks,
  Monitor,
  Moon,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sun,
  Timer,
  Trash2,
  Trophy,
  Video,
} from 'lucide-react'
import {
  builtinPlans,
  TYPE_META,
  imageFor,
  imageFocusFor,
  movementGuideFor,
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
  parseSets,
} from './plans'
import VideoPlayer from './VideoPlayer'
import Builder from './Builder'
import Generator from './Generator'
import CustomTimer from './CustomTimer'
import ProgressCalendar, { dateKey } from './ProgressCalendar'
import { ensureAudio, tick, signal, vibrate } from './audio'

const PAUSE_PRESETS = [30, 60, 90]
const WORK_PRESETS = [20, 30, 45, 60, 90]
const APP_VERSION = 'V1.6.0'
const STORAGE_KEY = 'fitflow-state-v2'
const CUSTOM_KEY = 'fitflow-custom-plans-v1'
const VIDEOS_KEY = 'fitflow-videos-v1'
const HISTORY_KEY = 'fitflow-history-v1'
const SESSION_KEY = 'fitflow-session-v1'
const THEME_KEY = 'fitflow-theme-v1'
const THEME_ORDER = ['system', 'light', 'dark']
const THEME_META = {
  system: { icon: Monitor, label: 'Design: automatisch' },
  light: { icon: Sun, label: 'Design: hell' },
  dark: { icon: Moon, label: 'Design: dunkel' },
}

function loadTheme() {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return THEME_ORDER.includes(value) ? value : 'system'
  } catch {
    return 'system'
  }
}

function loadSession() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}')
    return {
      key: typeof parsed.key === 'string' ? parsed.key : null,
      startedAt: Number(parsed.startedAt) || null,
      elapsedMs: Math.max(0, Number(parsed.elapsedMs) || 0),
      running: Boolean(parsed.running && parsed.startedAt),
    }
  } catch {
    return { key: null, startedAt: null, elapsedMs: 0, running: false }
  }
}

function sessionElapsed(session, now = Date.now()) {
  return session.elapsedMs + (session.running && session.startedAt ? now - session.startedAt : 0)
}

function formatDuration(milliseconds) {
  const total = Math.max(0, Math.floor(milliseconds / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const sec = total % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}

function humanDuration(milliseconds) {
  const minutes = Math.round(milliseconds / 60000)
  if (minutes < 1) return '< 1 Min'
  if (minutes < 60) return `${minutes} Min`
  return `${Math.floor(minutes / 60)} h ${minutes % 60} Min`
}

function streakFor(history) {
  const completed = new Set(history.map((entry) => entry.date))
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  if (!completed.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (completed.has(dateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function TimerRing({ seconds, total, label, running }) {
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

function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function App() {
  const [customPlans, setCustomPlans] = useState(loadCustomPlans)
  const [videos, setVideos] = useState(loadVideos)
  const [history, setHistory] = useState(loadHistory)
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
  const [tab, setTab] = useState('training')
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
  const [showGuide, setShowGuide] = useState(true)
  const [linkTarget, setLinkTarget] = useState(null)
  const [confirmKey, setConfirmKey] = useState(null)
  const [generatorOpen, setGeneratorOpen] = useState(false)
  const [updateInfo, setUpdateInfo] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [setIndex, setSetIndex] = useState(0)
  const [doneSteps, setDoneSteps] = useState(() => {
    const s = loadState()
    return s.doneSteps || {}
  })
  const [setsOverrides, setSetsOverrides] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fitflow-sets-v1') || '{}') }
    catch { return {} }
  })
  const [setsDone, setSetsDone] = useState(() => Number(loadState().setsDone) || 0)
  const [theme, setTheme] = useState(loadTheme)
  const [session, setSession] = useState(loadSession)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [confirmRestart, setConfirmRestart] = useState(false)
  const expectingRefresh = useRef(false)
  const endsAtRef = useRef(null)

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

  const imagePerson = plan.builtin ? person : 'custom'
  const currentImage = imageFor(currentStep, imagePerson)
  const currentImageFocus = imageFocusFor(currentStep, imagePerson)
  const currentGuide = movementGuideFor(currentStep, imagePerson)
  const programId = person
  const stepVideo = currentStep.video || videos[videoKey(programId, dayIndex, currentStep)] || null
  const hasVideo = (item) => Boolean(item.video || videos[videoKey(programId, dayIndex, item)])

  const parsed = parseSets(currentStep.reps)
  const defaultSets = parsed.isSet ? parsed.sets : 1
  const effectiveSets = setsOverrides[`${programId}:${dayIndex}:${currentStep.name}`] || defaultSets

  const doneCount = phase === 'done' ? steps.length : Object.values(doneSteps).filter(Boolean).length
  const progress = Math.min(100, Math.round((doneCount / steps.length) * 100))
  const phaseLabel = phase === 'done' ? 'Fertig' : phase === 'rest' ? (setIndex < effectiveSets - 1 ? 'Satzpause' : 'Pause') : meta.label
  const showTimer = phase === 'rest' || (phase === 'work' && isTimed)
  const isSetRest = phase === 'rest' && setIndex < effectiveSets - 1
  const restEnded = phase === 'rest' && seconds === 0 && !running
  const sessionKey = `${person}:${dayIndex}`
  const elapsedMs = session.key === sessionKey ? sessionElapsed(session, nowMs) : 0
  const completedExercises = Object.values(doneSteps).filter((value) => value === true).length
  const nextUp = phase === 'done'
    ? null
    : setIndex < effectiveSets - 1 && currentStep.type !== 'warmup'
      ? { kind: 'set', label: `Satz ${setIndex + 2} von ${effectiveSets}`, step: currentStep }
      : steps[stepIndex + 1]
        ? { kind: 'step', label: steps[stepIndex + 1].name, step: steps[stepIndex + 1] }
        : { kind: 'finish', label: 'Training abschließen' }
  const lastWorkout = history[history.length - 1]
  const ThemeIcon = THEME_META[theme].icon

  useEffect(() => {
    function onUpdate(e) { setUpdateInfo(e.detail) }
    window.addEventListener('sw-update', onUpdate)
    const sw = navigator.serviceWorker
    function onCtrl() {
      if (!expectingRefresh.current) return
      expectingRefresh.current = false
      window.location.reload()
    }
    sw?.addEventListener('controllerchange', onCtrl)
    return () => {
      window.removeEventListener('sw-update', onUpdate)
      sw?.removeEventListener('controllerchange', onCtrl)
    }
  }, [])

  async function applyUpdate() {
    if (updating) return
    setUpdating(true)

    const registration = updateInfo?.registration
      || await navigator.serviceWorker?.getRegistration()
    const waiting = registration?.waiting

    if (!waiting) {
      window.location.reload()
      return
    }

    expectingRefresh.current = true
    waiting.postMessage('SKIP_WAITING')

    // Manche Browser liefern controllerchange verzögert oder gar nicht.
    // Der normale Reload greift dann trotzdem auf die neue index.html zu.
    window.setTimeout(() => {
      if (expectingRefresh.current) window.location.reload()
    }, 2500)
  }

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ person, dayIndex, stepIndex, pauseSeconds, doneSteps, setsDone }))
    } catch {
      /* noop */
    }
  }, [person, dayIndex, stepIndex, pauseSeconds, doneSteps, setsDone])

  useEffect(() => {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)) }
    catch { /* noop */ }
  }, [session])

  useEffect(() => {
    if (!session.running) return undefined
    const id = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [session.running])

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    function apply() {
      const resolved = theme === 'system' ? (media?.matches ? 'dark' : 'light') : theme
      document.documentElement.dataset.theme = resolved
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#0f1513' : '#2f7667')
    }
    apply()
    try { localStorage.setItem(THEME_KEY, theme) } catch { /* noop */ }
    if (theme !== 'system' || !media) return undefined
    media.addEventListener?.('change', apply)
    return () => media.removeEventListener?.('change', apply)
  }, [theme])

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

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    } catch {
      /* noop */
    }
  }, [history])

  useEffect(() => {
    try { localStorage.setItem('fitflow-sets-v1', JSON.stringify(setsOverrides)) }
    catch { /* noop */ }
  }, [setsOverrides])

  function setClock(value, run) {
    setSeconds(value)
    endsAtRef.current = run ? Date.now() + value * 1000 : null
  }

  function startSession() {
    const now = Date.now()
    setNowMs(now)
    setSession((prev) => {
      if (prev.key === sessionKey && prev.running) return prev
      const base = prev.key === sessionKey ? prev.elapsedMs : 0
      return { key: sessionKey, startedAt: now, elapsedMs: base, running: true }
    })
  }

  function stopSession() {
    const now = Date.now()
    const total = session.key === sessionKey ? sessionElapsed(session, now) : 0
    setNowMs(now)
    setSession({ key: sessionKey, startedAt: null, elapsedMs: total, running: false })
    return total
  }

  function resetSession() {
    setSession({ key: null, startedAt: null, elapsedMs: 0, running: false })
    setSetsDone(0)
  }

  function cycleTheme() {
    setTheme((value) => THEME_ORDER[(THEME_ORDER.indexOf(value) + 1) % THEME_ORDER.length])
  }

  function enterWork(nextStepIndex, nextSetIndex = 0) {
    const target = steps[nextStepIndex]
    const work = timedSeconds(target.reps)
    setStepIndex(nextStepIndex)
    setSetIndex(nextSetIndex)
    setPhase('work')
    setRunning(false)
    setClock(work != null ? work : 0, false)
    setWorkSeconds(work != null ? work : 0)
    setShowVideo(false)
    setShowGuide(true)
  }

  function completeExercise() {
    ensureAudio()
    startSession()
    vibrate(35)
    if (currentStep.type === 'warmup') {
      advanceAfterRest()
      return
    }
    setSetsDone((value) => value + 1)
    const isLastSetOfWorkout = stepIndex === steps.length - 1 && setIndex >= effectiveSets - 1
    if (isLastSetOfWorkout) {
      setDoneSteps((prev) => ({ ...prev, [stepIndex]: true }))
      finishWorkout(1)
      return
    }
    setPhase('rest')
    setClock(pauseSeconds, true)
    setRunning(true)
    setShowVideo(false)
  }

  function finishWorkout(extraSets = 0) {
    const durationMs = stopSession()
    const completedDate = dateKey()
    const completionKey = `${completedDate}:${person}:${dayIndex}`
    setHistory((previous) => {
      if (previous.some((entry) => entry.key === completionKey)) return previous
      return [...previous, {
        key: completionKey,
        date: completedDate,
        completedAt: new Date().toISOString(),
        programId: person,
        programName: plan.name,
        dayIndex,
        dayName: day.title,
        durationSec: Math.round(durationMs / 1000),
        sets: setsDone + extraSets,
      }]
    })
    setPhase('done')
    setRunning(false)
    setClock(0, false)
    signal('done')
  }

  function advanceAfterRest() {
    const curParsed = parseSets(currentStep.reps)
    const curDefault = curParsed.isSet ? curParsed.sets : 1
    const curEffective = setsOverrides[`${programId}:${dayIndex}:${currentStep.name}`] || curDefault
    if (setIndex < curEffective - 1) {
      enterWork(stepIndex, setIndex + 1)
    } else {
      setDoneSteps((prev) => ({ ...prev, [stepIndex]: true }))
      if (stepIndex < steps.length - 1) {
        enterWork(stepIndex + 1, 0)
      } else {
        finishWorkout()
      }
    }
  }

  function skipExercise() {
    startSession()
    setDoneSteps((prev) => ({ ...prev, [stepIndex]: 'skipped' }))
    if (stepIndex < steps.length - 1) {
      enterWork(stepIndex + 1, 0)
    } else {
      finishWorkout()
    }
  }

  function previousExercise() {
    if (stepIndex <= 0) return
    const previousIndex = stepIndex - 1
    setDoneSteps((prev) => {
      const next = { ...prev }
      delete next[previousIndex]
      return next
    })
    enterWork(previousIndex, 0)
  }

  function selectDay(index) {
    const firstStep = allPlans[person].days[index].steps[0]
    const work = timedSeconds(firstStep.reps)
    setDayIndex(index)
    setStepIndex(0)
    setSetIndex(0)
    setDoneSteps({})
    resetSession()
    setPhase('work')
    setRunning(false)
    setClock(work != null ? work : 0, false)
    setWorkSeconds(work != null ? work : 0)
    setShowVideo(false)
  }

  function pickStep(index) {
    enterWork(index)
    setTab('training')
  }

  function togglePlay() {
    ensureAudio()
    if (running) {
      setRunning(false)
      endsAtRef.current = null
      return
    }
    const start = seconds > 0 ? seconds : (phase === 'rest' ? pauseSeconds : workSeconds)
    startSession()
    setClock(start, true)
    setRunning(true)
  }

  function changePause(value) {
    setPauseSeconds(value)
    if (phase === 'rest') setClock(value, running)
  }

  function changeWork(value) {
    setWorkSeconds(value)
    setClock(value, running)
  }

  function resetPause() {
    setRunning(false)
    setClock(pauseSeconds, false)
  }

  function resetWorkout() {
    setDoneSteps({})
    resetSession()
    setConfirmRestart(false)
    enterWork(0)
  }

  function adjustSets(delta) {
    const key = `${programId}:${dayIndex}:${currentStep.name}`
    const updated = Math.max(1, Math.min(10, effectiveSets + delta))
    setSetsOverrides((prev) => {
      const next = { ...prev }
      if (updated === defaultSets) delete next[key]
      else next[key] = updated
      return next
    })
    if (updated <= setIndex) setSetIndex(updated - 1)
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
    setSetIndex(0)
    setDoneSteps({})
    resetSession()
    setPhase('work')
    setRunning(false)
    const firstStep = allPlans[fallback].days[0].steps[0]
    const work = timedSeconds(firstStep.reps)
    setClock(work != null ? work : 0, false)
    setWorkSeconds(work != null ? work : 0)
    setShowVideo(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person])

  useEffect(() => {
    if (!running || phase === 'done') return
    if (endsAtRef.current == null) endsAtRef.current = Date.now() + seconds * 1000
    const update = () => {
      const remaining = Math.max(0, Math.ceil((endsAtRef.current - Date.now()) / 1000))
      setSeconds(remaining)
    }
    update()
    const id = window.setInterval(update, 250)
    document.addEventListener('visibilitychange', update)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', update)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase])

  useEffect(() => {
    if (!running || phase === 'done') return
    if (phase !== 'rest' && !(phase === 'work' && isTimed)) return
    if (seconds > 0 && seconds <= 3) {
      tick()
      vibrate(25)
    }
  }, [seconds, running, phase, isTimed])

  useEffect(() => {
    if (seconds !== 0 || !running) return
    const id = window.setTimeout(() => {
      if (phase === 'work' && isTimed) {
        signal('work-done')
        setRunning(false)
        endsAtRef.current = null
      } else if (phase === 'rest') {
        signal('rest-end')
        setRunning(false)
        endsAtRef.current = null
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
    <main className={`app ${plan.accent} withTabbar`}>
      <nav className="topnav" aria-label="Hauptnavigation">
        <span className="brand"><img src="/icon-192.png" alt="" width="28" height="28" /> FitFlow</span>
        <div className="topActions">
          <small className="versionTag">{APP_VERSION}</small>
          <button className="themeToggle" onClick={cycleTheme} aria-label={THEME_META[theme].label} title={THEME_META[theme].label}>
            <ThemeIcon size={19} />
          </button>
        </div>
      </nav>

      {view === 'train' ? (
        <>
          <header className="pageHead">
            <h1>{plan.name}</h1>
            <p>{plan.title}</p>
          </header>

          <section className="personRail" aria-label="Programm wählen">
            {[...builtinEntries, ...customEntries].map(([key, item]) => (
              <button key={key} className={person === key ? 'active' : ''} onClick={() => setPerson(key)} aria-pressed={person === key}>
                <span className="avatar">{item.name.slice(0, 1)}</span>
                <span>{item.name}</span>
              </button>
            ))}
            <button className="addProgram" onClick={createProgram} aria-label="Neues Programm">
              <Plus size={18} />
            </button>
          </section>

          <nav className="dayTabsRail" aria-label="Trainingstag wählen">
            {plan.days.map((item, index) => (
              <button key={`${item.title}-${index}`} className={dayIndex === index ? 'active' : ''} onClick={() => selectDay(index)} aria-current={dayIndex === index ? 'page' : undefined}>
                <strong>{item.title}</strong>
                <span>{item.focus}</span>
              </button>
            ))}
          </nav>

          {tab === 'training' && (
          <section className="dashboard singleCol">
            <article className="sessionCard">
              {phase === 'done' ? (
                <div className="finishState">
                  <div className="finishBurst"><Trophy size={56} /></div>
                  <h2>Stark gemacht!</h2>
                  <p>{day.title} · {day.focus}</p>
                  <div className="summaryGrid">
                    <div><Clock3 size={18} /><strong>{humanDuration(lastWorkout?.durationSec ? lastWorkout.durationSec * 1000 : elapsedMs)}</strong><span>Dauer</span></div>
                    <div><ListChecks size={18} /><strong>{completedExercises}/{steps.length}</strong><span>Übungen</span></div>
                    <div><Dumbbell size={18} /><strong>{lastWorkout?.sets ?? setsDone}</strong><span>Sätze</span></div>
                    <div><Flame size={18} /><strong>{streakFor(history)}</strong><span>{streakFor(history) === 1 ? 'Tag Serie' : 'Tage Serie'}</span></div>
                  </div>
                  <span className="savedSuccess"><CheckCircle2 size={16} /> Im Kalender gespeichert</span>
                  <div className="finishActions">
                    <button className="primaryAction" onClick={() => setTab('fortschritt')}><CalendarDays size={20} /> Fortschritt</button>
                    <button className="ghostBtn" onClick={resetWorkout}><RotateCcw size={18} /> Nochmal</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="sessionTop">
                    <span className={`sessionClock${session.running && session.key === sessionKey ? ' live' : ''}`}>
                      <Hourglass size={15} /> {elapsedMs > 0 ? formatDuration(elapsedMs) : '00:00'}
                    </span>
                    <span className="sessionCount">{stepIndex + 1} von {steps.length}</span>
                  </div>
                  <div className="progressLine" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>

                  <div className={`sessionImageWrap${phase === 'rest' ? ' resting' : ''}`}>
                    <img
                      className={phase === 'work' && showGuide && currentGuide ? 'guideImage' : ''}
                      src={phase === 'work' && showGuide && currentGuide ? currentGuide : currentImage}
                      alt={phase === 'work' && showGuide && currentGuide ? `${currentStep.name}: Start- und Endposition` : `${currentStep.name} Foto`}
                      style={{ objectPosition: phase === 'work' && showGuide && currentGuide ? 'center center' : currentImageFocus }}
                      loading="lazy"
                      decoding="async"
                    />
                    {phase === 'work' && showGuide && currentGuide && (
                      <>
                        <span className="guidePosition start">Start</span>
                        <span className="guidePosition end">Ende</span>
                      </>
                    )}
                    <div className="phaseBadge"><TypeIcon size={16} /> {phaseLabel}</div>
                    {phase === 'work' && currentGuide && (
                      <div className="imageModeSwitch" aria-label="Übungsdarstellung">
                        <button className={!showGuide ? 'active' : ''} onClick={() => setShowGuide(false)}>Foto</button>
                        <button className={showGuide ? 'active' : ''} onClick={() => setShowGuide(true)}>Start &amp; Ende</button>
                      </div>
                    )}
                  </div>

                  <div className="sessionHeader">
                    <h2>{phase === 'rest' ? (isSetRest ? 'Satzpause' : 'Pause') : currentStep.name}</h2>
                    {phase === 'work' && <span className="repFigure">{currentStep.reps.replace(/(\d)\s*[x×]\s*(\d)/i, '$1 × $2')}</span>}
                  </div>

                  {phase === 'work' && effectiveSets > 1 && (
                    <div className="setBar">
                      <div className="setDots" aria-label={`Satz ${setIndex + 1} von ${effectiveSets}`}>
                        {Array.from({ length: effectiveSets }, (_, i) => (
                          <span key={i} className={i < setIndex ? 'done' : i === setIndex ? 'current' : ''} />
                        ))}
                      </div>
                      <span className="setIndicator">Satz {setIndex + 1}/{effectiveSets}</span>
                      <div className="setStepper">
                        <button onClick={() => adjustSets(-1)} disabled={effectiveSets <= 1} aria-label="Satz entfernen">−</button>
                        <button onClick={() => adjustSets(1)} disabled={effectiveSets >= 10} aria-label="Satz hinzufügen">+</button>
                      </div>
                    </div>
                  )}

                  <p className="exerciseText">
                    {phase === 'rest'
                      ? restEnded
                        ? 'Pause vorbei – tippe auf Weiter, wenn du startklar bist.'
                        : isSetRest
                          ? 'Kurz erholen, dann kommt der nächste Satz.'
                          : 'Atmen, kurz trinken und bereit machen.'
                      : currentStep.detail}
                  </p>

                  {phase === 'work' && (stepVideo || plan.builtin) && (
                    <div className="videoActions">
                      {stepVideo && (
                        <button className="ghostBtn" onClick={() => setShowVideo((v) => !v)}>
                          <Video size={16} /> {showVideo ? 'Video ausblenden' : 'Video anzeigen'}
                        </button>
                      )}
                      {plan.builtin && (
                        <button className="ghostBtn subtle" onClick={() => setLinkTarget({ key: videoKey(programId, dayIndex, currentStep), value: videos[videoKey(programId, dayIndex, currentStep)] || '', name: currentStep.name })}>
                          {stepVideo ? 'Video ändern' : <><Video size={16} /> Video verknüpfen</>}
                        </button>
                      )}
                    </div>
                  )}
                  {showVideo && stepVideo && phase === 'work' && (
                    <VideoPlayer url={stepVideo} onClose={() => setShowVideo(false)} />
                  )}

                  {showTimer && (
                    <TimerRing
                      seconds={seconds}
                      total={phase === 'rest' ? pauseSeconds : workSeconds}
                      label={phase === 'rest' ? (isSetRest ? 'Satzpause' : 'Pause') : 'Halten'}
                      running={running}
                    />
                  )}

                  {phase === 'rest' ? (
                    <>
                      <div className={`controls mainControls${restEnded ? ' single' : ''}`}>
                        {restEnded ? (
                          <button className="primaryAction big" onClick={advanceAfterRest}>
                            <SkipForward size={22} /> Weiter
                          </button>
                        ) : (
                          <>
                            <button className="primaryAction big" onClick={advanceAfterRest}>
                              <SkipForward size={22} /> Pause beenden
                            </button>
                            <button className="secondaryAction" onClick={togglePlay} aria-label={running ? 'Pause anhalten' : 'Pause fortsetzen'}>
                              {running ? <Pause size={20} /> : <Play size={20} />}
                            </button>
                            <button className="secondaryAction" onClick={resetPause} aria-label="Pause zurücksetzen"><RotateCcw size={20} /></button>
                          </>
                        )}
                      </div>
                      <div className="restPresets" aria-label="Pausenlänge">
                        <span>Pause</span>
                        {PAUSE_PRESETS.map((preset) => (
                          <button key={preset} className={pauseSeconds === preset ? 'active' : ''} onClick={() => changePause(preset)}>
                            {preset}s
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`controls mainControls${isTimed ? ' timed' : ' single'}`}>
                        {isTimed && (
                          <button className="primaryAction big" onClick={togglePlay}>
                            {running ? <Pause size={22} /> : <Play size={22} />}
                            {running ? 'Pause' : seconds < workSeconds && seconds > 0 ? 'Weiter' : 'Start'}
                          </button>
                        )}
                        <button className="doneAction big" onClick={completeExercise}>
                          <CheckCircle2 size={22} />
                          {currentStep.type === 'warmup' ? 'Weiter' : effectiveSets > 1 ? `Satz ${setIndex + 1} erledigt` : 'Erledigt'}
                        </button>
                      </div>
                      {isTimed && (
                        <div className="restPresets" aria-label="Übungs-Dauer">
                          <span>Dauer</span>
                          {WORK_PRESETS.map((preset) => (
                            <button key={preset} className={workSeconds === preset ? 'active' : ''} onClick={() => changeWork(preset)}>
                              {preset}s
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="subActions">
                        <button onClick={previousExercise} disabled={stepIndex === 0}><SkipBack size={17} /> Zurück</button>
                        <button onClick={skipExercise}><SkipForward size={17} /> Überspringen</button>
                        <button onClick={() => setConfirmRestart(true)}><RotateCcw size={17} /> Neustart</button>
                      </div>
                    </>
                  )}

                  {nextUp && (
                    <div className="upNext">
                      {nextUp.step ? (
                        <img src={imageFor(nextUp.step, imagePerson)} alt="" loading="lazy" decoding="async" />
                      ) : (
                        <span className="upNextIcon"><Trophy size={20} /></span>
                      )}
                      <div>
                        <span>Als Nächstes</span>
                        <strong>{nextUp.label}</strong>
                        {nextUp.kind === 'step' && <small>{nextUp.step.reps}</small>}
                      </div>
                    </div>
                  )}
                </>
              )}
            </article>
          </section>
          )}

          {tab === 'uebungen' && (
          <section className="dashboard singleCol">
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
                  const state = index === stepIndex && phase !== 'done' ? 'current' : doneSteps[index] ? 'done' : ''
                  const linked = hasVideo(item)
                  return (
                    <button key={`${item.name}-${index}`} className={state} onClick={() => pickStep(index)}>
                      <span className="stepIcon">{state === 'done' ? <CheckCircle2 size={18} /> : <ItemIcon size={18} />}</span>
                      <span className="stepCopy"><strong>{item.name}</strong><small>{item.reps}</small></span>
                      {linked ? <Video size={15} className="stepVideoIcon" /> : <ChevronRight size={18} />}
                    </button>
                  )
                })}
              </div>
            </aside>
          </section>
          )}

          {tab === 'timer' && (
          <section className="dashboard singleCol">
            <CustomTimer />
          </section>
          )}

          {tab === 'fortschritt' && <ProgressCalendar history={history} />}

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

      <nav className="bottomnav" aria-label="Bereiche">
        {[
          ['training', Dumbbell, 'Training'],
          ['uebungen', ListChecks, 'Übungen'],
          ['timer', Timer, 'Timer'],
          ['fortschritt', CalendarDays, 'Verlauf'],
        ].map(([key, Icon, label]) => (
          <button key={key} className={view === 'train' && tab === key ? 'active' : ''} onClick={() => { setView('train'); setTab(key) }}>
            <Icon size={21} strokeWidth={view === 'train' && tab === key ? 2.3 : 1.8} /> <span>{label}</span>
          </button>
        ))}
        <button className={view === 'build' ? 'active' : ''} onClick={() => { setBuilderOwner(currentOwner); setView('build') }}>
          <Plus size={21} strokeWidth={view === 'build' ? 2.3 : 1.8} /> <span>Programme</span>
        </button>
      </nav>

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

      {confirmRestart && (
        <div className="modalOverlay" onClick={() => setConfirmRestart(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Training neu starten">
            <h3>Training neu starten?</h3>
            <p className="muted">Dein Fortschritt und die Zeit für dieses Training werden zurückgesetzt.</p>
            <div className="modalActions">
              <button className="ghostBtn" onClick={() => setConfirmRestart(false)}>Abbrechen</button>
              <button className="primaryAction" onClick={resetWorkout}><RotateCcw size={16} /> Neu starten</button>
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
          <span>{updating ? 'Update wird installiert …' : 'Neue Version verfügbar.'}</span>
          <button className="primaryAction" onClick={applyUpdate} disabled={updating}>
            {updating ? 'Aktualisiere …' : 'Jetzt aktualisieren'}
          </button>
        </div>
      )}
    </main>
  )
}
