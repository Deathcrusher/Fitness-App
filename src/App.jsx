import React, { useEffect, useRef, useState } from 'react'
import {
  ChartColumn,
  CheckCircle2,
  Dumbbell,
  History,
  Hourglass,
  ListChecks,
  Medal,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings,
  SkipBack,
  SkipForward,
  Timer,
  Trash2,
  Trophy,
  Video,
  Volume2,
  VolumeX,
} from 'lucide-react'
import {
  builtinPlans,
  TYPE_META,
  imageFor,
  imageFocusFor,
  movementGuideFor,
  timedSeconds,
  videoKey,
  emptyPlan,
  duplicatePlan,
  makeId,
  generatePlan,
  PROGRAM_TEMPLATES,
  youtubeSearchUrl,
  parseSets,
} from './lib/plans'
import VideoPlayer from './components/VideoPlayer'
import { animationFor } from './components/ExerciseFigure'
import SetLogger from './components/SetLogger'
import ExerciseSheet from './components/ExerciseSheet'
import WorkoutOverview from './components/WorkoutOverview'
import SettingsSheet from './components/SettingsSheet'
import {
  draftFor,
  entriesFor,
  fmtSet,
  isLoggable,
  isRecord,
  lastEntry,
  loadLog,
  saveLog,
  suggestion,
  targetRange,
  upsertEntry,
  usesWeight,
  volumeOf,
} from './lib/logStore'
import Builder from './components/Builder'
import Generator from './components/Generator'
import CustomTimer from './components/CustomTimer'
import ProgressCalendar, { dateKey } from './components/ProgressCalendar'
import { ensureAudio, tick, signal, vibrate } from './lib/audio'
import BrandMark from './components/BrandMark'
import TimerRing from './components/TimerRing'
import FinishSummary from './components/FinishSummary'
import SessionMedia from './components/SessionMedia'
import ExerciseList from './components/ExerciseList'
import ProgramPicker from './components/ProgramPicker'
import { nextDueDay } from './lib/schedule'
import { coachEnabled, introText, say, setCoachEnabled, setText, unlockCoach } from './lib/coach'
import { newlyUnlocked } from './lib/achievements'
import { prefetchMedia } from './lib/backup'
import {
  STORAGE_KEY,
  CUSTOM_KEY,
  VIDEOS_KEY,
  HISTORY_KEY,
  SESSION_KEY,
  THEME_KEY,
  GOAL_KEY,
  loadGoal,
  weekCountOf,
  loadTheme,
  loadSession,
  sessionElapsed,
  formatDuration,
  loadState,
  loadCustomPlans,
  loadVideos,
  loadHistory,
  persist,
  SETS_KEY,
} from './lib/storage'

const PAUSE_PRESETS = [30, 60, 90]
const WORK_PRESETS = [20, 30, 45, 60, 90]
const APP_VERSION = __APP_VERSION__
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
  const [tab, setTab] = useState(() => {
    try {
      const t = new URLSearchParams(window.location.search).get('tab')
      return ['training', 'uebungen', 'timer', 'fortschritt'].includes(t) ? t : 'training'
    } catch {
      return 'training'
    }
  })
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
  const [imageMode, setImageMode] = useState('anim')
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
    try { return JSON.parse(localStorage.getItem(SETS_KEY) || '{}') }
    catch { return {} }
  })
  const [setsDone, setSetsDone] = useState(() => Number(loadState().setsDone) || 0)
  const [theme, setTheme] = useState(loadTheme)
  const [session, setSession] = useState(loadSession)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [confirmRestart, setConfirmRestart] = useState(false)
  const [log, setLog] = useState(loadLog)
  const [sessionLog, setSessionLog] = useState(() => loadState().sessionLog || {})
  const [prs, setPrs] = useState(() => loadState().prs || [])
  const [draft, setDraft] = useState(null)
  const [overview, setOverview] = useState(() => {
    const st = loadState()
    return !(Number(st.stepIndex) > 0 || Object.keys(st.doneSteps || {}).length > 0 || st.overview === false)
  })
  const [sheetStep, setSheetStep] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [goal, setGoal] = useState(loadGoal)
  const [voiceOn, setVoiceOn] = useState(coachEnabled)
  const [newBadges, setNewBadges] = useState([])
  const announcedRef = useRef('')
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
  const hasAnim = Boolean(animationFor(currentStep))
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
  const today = dateKey()
  const loggable = phase === 'work' && isLoggable(currentStep)
  const weighted = usesWeight(currentStep)
  const lastLog = loggable ? lastEntry(log, currentOwner, currentStep.name, today) : null
  const sug = loggable ? suggestion(lastLog, targetRange(currentStep.reps), currentStep) : null
  const draftKey = `${sessionKey}:${stepIndex}:${setIndex}`
  const currentDraft = draft?.key === draftKey
    ? draft
    : { key: draftKey, ...draftFor({ log, owner: currentOwner, step: currentStep, setIndex, today, sessionSets: sessionLog[stepIndex] }) }
  const sessionVolume = Object.values(sessionLog).reduce((n, sets) => n + volumeOf(sets || []), 0)
  const weekCount = weekCountOf(history)
  const dueDay = nextDueDay(history, person, plan.days.length)

  // Kurzbefehle vom Homescreen: Parameter nach dem Start wieder aus der Adresse entfernen
  useEffect(() => {
    if (window.location.search) window.history.replaceState(null, '', window.location.pathname)
  }, [])

  // Bilder des aktuellen Tages vorab laden, damit das Training auch offline klappt
  useEffect(() => {
    prefetchMedia(steps.flatMap((step) => [imageFor(step, imagePerson), movementGuideFor(step, imagePerson)]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person, dayIndex])

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
    persist(STORAGE_KEY, { person, dayIndex, stepIndex, pauseSeconds, doneSteps, setsDone, sessionLog, prs, overview })
  }, [person, dayIndex, stepIndex, pauseSeconds, doneSteps, setsDone, sessionLog, prs, overview])
  useEffect(() => { saveLog(log) }, [log])
  useEffect(() => { persist(GOAL_KEY, String(goal)) }, [goal])
  useEffect(() => { persist(SESSION_KEY, session) }, [session])
  useEffect(() => { persist(CUSTOM_KEY, customPlans) }, [customPlans])
  useEffect(() => { persist(VIDEOS_KEY, videos) }, [videos])
  useEffect(() => { persist(HISTORY_KEY, history) }, [history])
  useEffect(() => { persist(SETS_KEY, setsOverrides) }, [setsOverrides])

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
    persist(THEME_KEY, theme)
    if (theme !== 'system' || !media) return undefined
    media.addEventListener?.('change', apply)
    return () => media.removeEventListener?.('change', apply)
  }, [theme])


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
    setSessionLog({})
    setPrs([])
    setDraft(null)
    setOverview(true)
    setNewBadges([])
    announcedRef.current = ''
  }

  function toggleVoice(value = !voiceOn) {
    setCoachEnabled(value)
    setVoiceOn(value)
    if (value) {
      unlockCoach()
      say('Sprach-Coach ist an.', { interrupt: true })
    }
  }

  function startWorkout() {
    ensureAudio()
    unlockCoach()
    setOverview(false)
    startSession()
    enterWork(0)
  }

  function recordSet() {
    const set = { w: currentDraft.w, r: currentDraft.r }
    const sets = [...(sessionLog[stepIndex] || [])]
    sets[setIndex] = set
    const nextSessionLog = { ...sessionLog, [stepIndex]: sets }
    setSessionLog(nextSessionLog)
    const previous = entriesFor(log, currentOwner, currentStep.name).filter((e) => e.date !== today)
    const earlierToday = sets.slice(0, setIndex).filter(Boolean)
    const beatsToday = earlierToday.every((s) => (set.w > 0 ? set.w > s.w || (set.w === s.w && set.r > s.r) : set.r > s.r))
    if (isRecord(previous, set) && beatsToday) {
      setPrs((list) => [...list.filter((p) => p.name !== currentStep.name), { name: currentStep.name, text: fmtSet(set) }])
      signal('record')
      say('Stark – neuer Rekord!', { interrupt: true })
    }
    setLog((prev) => upsertEntry(prev, currentOwner, currentStep.name, today, sets, plan.name))
    return nextSessionLog
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
    setImageMode('anim')
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
    const nextSessionLog = loggable ? recordSet() : sessionLog
    const isLastSetOfWorkout = stepIndex === steps.length - 1 && setIndex >= effectiveSets - 1
    if (isLastSetOfWorkout) {
      setDoneSteps((prev) => ({ ...prev, [stepIndex]: true }))
      finishWorkout(1, nextSessionLog)
      return
    }
    setPhase('rest')
    setClock(pauseSeconds, true)
    setRunning(true)
    setShowVideo(false)
    say(`Gut gemacht. ${pauseSeconds} Sekunden Pause.`)
  }

  function finishWorkout(extraSets = 0, finalLog = sessionLog) {
    const durationMs = stopSession()
    const volume = Object.values(finalLog).reduce((n, sets) => n + volumeOf(sets || []), 0)
    const completedDate = dateKey()
    const completionKey = `${completedDate}:${person}:${dayIndex}`
    const entry = {
      key: completionKey,
      date: completedDate,
      completedAt: new Date().toISOString(),
      programId: person,
      programName: plan.name,
      dayIndex,
      dayName: day.title,
      durationSec: Math.round(durationMs / 1000),
      sets: setsDone + extraSets,
      volume: Math.round(volume),
      records: prs.length,
    }
    if (!history.some((e) => e.key === completionKey)) setNewBadges(newlyUnlocked(history, [...history, entry], goal))
    setHistory((previous) => {
      if (previous.some((e) => e.key === completionKey)) return previous
      return [...previous, entry]
    })
    say('Training geschafft. Stark gemacht!', { interrupt: true })
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
    unlockCoach()
    setOverview(false)
    startSession()
    enterWork(index)
    setTab('training')
    setSheetStep(null)
  }

  function togglePlay() {
    ensureAudio()
    if (running) {
      setRunning(false)
      endsAtRef.current = null
      return
    }
    const start = seconds > 0 ? seconds : (phase === 'rest' ? pauseSeconds : workSeconds)
    unlockCoach()
    startSession()
    setClock(start, true)
    setRunning(true)
    if (phase === 'work') say('Los!', { interrupt: true })
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
      // Beim Öffnen ohne laufendes Training direkt den fälligen Tag zeigen
      if (overview && phase === 'work' && stepIndex === 0 && dueDay !== dayIndex) selectDay(dueDay)
      return
    }
    const fallback = allPlans[person] ? person : 'connie'
    const due = nextDueDay(history, fallback, allPlans[fallback].days.length)
    setDayIndex(due)
    setStepIndex(0)
    setSetIndex(0)
    setDoneSteps({})
    resetSession()
    setPhase('work')
    setRunning(false)
    const firstStep = allPlans[fallback].days[due].steps[0]
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

  // Sprach-Coach: neue Übung oder neuer Satz
  useEffect(() => {
    if (overview || phase !== 'work' || !session.running || session.key !== sessionKey) return
    const key = `${sessionKey}:${stepIndex}:${setIndex}`
    if (announcedRef.current === key) return
    announcedRef.current = key
    const target = loggable ? currentDraft : null
    if (setIndex === 0) {
      say(introText(currentStep, { sets: effectiveSets, draft: target, weighted, first: stepIndex === 0 }), { interrupt: true })
    } else {
      say(setText(setIndex, effectiveSets, target), { interrupt: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overview, phase, stepIndex, setIndex, session.running, sessionKey])

  useEffect(() => {
    if (!running || phase === 'done') return
    if (phase !== 'rest' && !(phase === 'work' && isTimed)) return
    if (seconds > 0 && seconds <= 3) {
      tick()
      vibrate(25)
    }
    if (seconds === 10 && (phase === 'rest' ? pauseSeconds : workSeconds) > 20) say('Noch zehn Sekunden.')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, running, phase, isTimed])

  useEffect(() => {
    if (seconds !== 0 || !running) return
    const id = window.setTimeout(() => {
      if (phase === 'work' && isTimed) {
        say('Geschafft.', { interrupt: true })
        signal('work-done')
        setRunning(false)
        endsAtRef.current = null
      } else if (phase === 'rest') {
        say('Pause vorbei.', { interrupt: true })
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
        <span className="brand"><BrandMark /> FitFlow</span>
        <div className="topActions">
          <button className="themeToggle" onClick={() => setSettingsOpen(true)} aria-label="Einstellungen" title="Einstellungen">
            <Settings size={19} />
          </button>
        </div>
      </nav>

      {view === 'train' ? (
        <>
          <ProgramPicker
            plan={plan}
            person={person}
            owner={currentOwner}
            builtinEntries={builtinEntries}
            customEntries={customEntries}
            dayIndex={dayIndex}
            dueDay={dueDay}
            onPerson={setPerson}
            onNewProgram={createProgram}
            onDay={selectDay}
          />

          {tab === 'training' && (
          <section className="dashboard singleCol">
            {overview && phase !== 'done' ? (
              <article className="sessionCard overviewCard">
                <WorkoutOverview
                  programKey={person}
                  plan={plan}
                  day={day}
                  dayIndex={dayIndex}
                  steps={steps}
                  imagePerson={imagePerson}
                  owner={currentOwner}
                  log={log}
                  history={history}
                  pauseSeconds={pauseSeconds}
                  goal={goal}
                  weekCount={weekCount}
                  onStart={startWorkout}
                  onOpenExercise={(i) => setSheetStep(i)}
                />
              </article>
            ) : (
            <article className="sessionCard">
              {phase === 'done' ? (
                <FinishSummary
                  day={day}
                  durationMs={lastWorkout?.durationSec ? lastWorkout.durationSec * 1000 : elapsedMs}
                  volume={sessionVolume}
                  completed={completedExercises}
                  total={steps.length}
                  sets={lastWorkout?.sets ?? setsDone}
                  weekCount={weekCount}
                  goal={goal}
                  prs={prs}
                  badges={newBadges}
                  onStats={() => setTab('fortschritt')}
                  onRestart={resetWorkout}
                />
              ) : (
                <>
                  <div className="sessionTop">
                    <span className={`sessionClock${session.running && session.key === sessionKey ? ' live' : ''}`}>
                      <Hourglass size={15} /> {elapsedMs > 0 ? formatDuration(elapsedMs) : '00:00'}
                    </span>
                    <span className="sessionCount">
                      {stepIndex + 1} von {steps.length}
                      <button className="voiceBtn" onClick={() => toggleVoice()} aria-pressed={voiceOn} aria-label={voiceOn ? 'Sprach-Coach ausschalten' : 'Sprach-Coach einschalten'}>
                        {voiceOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
                      </button>
                    </span>
                  </div>
                  <div className="progressLine" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>

                  <SessionMedia
                    phase={phase}
                    step={currentStep}
                    stepKey={`${programId}-${dayIndex}-${stepIndex}`}
                    imageMode={imageMode}
                    onImageMode={setImageMode}
                    image={currentImage}
                    imageFocus={currentImageFocus}
                    guide={currentGuide}
                    hasAnim={hasAnim}
                    badge={<><TypeIcon size={16} /> {phaseLabel}</>}
                  />

                  <div className="sessionBody">
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

                  {loggable && (
                    <SetLogger
                      key={draftKey}
                      draft={currentDraft}
                      onDraft={(d) => setDraft({ ...d, key: draftKey })}
                      weighted={weighted}
                      last={lastLog}
                      sug={setIndex === 0 && !(sessionLog[stepIndex] || []).some(Boolean) ? sug : null}
                      doneSets={sessionLog[stepIndex] || []}
                      setIndex={setIndex}
                    />
                  )}

                  {phase === 'rest' && prs.some((p) => p.name === currentStep.name) && (sessionLog[stepIndex] || []).length > 0 && (
                    <p className="recordToast"><Medal size={18} /> Neuer Rekord: {prs.find((p) => p.name === currentStep.name).text}</p>
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

                  {phase === 'work' && (stepVideo || plan.builtin || loggable) && (
                    <div className="videoActions">
                      {loggable && (
                        <button className="ghostBtn" onClick={() => setSheetStep(stepIndex)}>
                          <History size={16} /> Verlauf
                        </button>
                      )}
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

                  </div>

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
            )}
          </section>
          )}

          {tab === 'uebungen' && (
          <section className="dashboard singleCol">
            <ExerciseList
              plan={plan}
              day={day}
              steps={steps}
              progress={progress}
              stepIndex={stepIndex}
              phase={phase}
              doneSteps={doneSteps}
              hasVideo={hasVideo}
              onPick={pickStep}
              onInfo={setSheetStep}
            />
          </section>
          )}

          {tab === 'timer' && (
          <section className="dashboard singleCol">
            <CustomTimer />
          </section>
          )}

          {tab === 'fortschritt' && <ProgressCalendar history={history} goal={goal} />}

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
          ['fortschritt', ChartColumn, 'Statistik'],
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

      {sheetStep != null && steps[sheetStep] && (
        <ExerciseSheet
          step={steps[sheetStep]}
          owner={currentOwner}
          log={log}
          onClose={() => setSheetStep(null)}
          onStart={sheetStep !== stepIndex || overview ? () => pickStep(sheetStep) : null}
        />
      )}

      {settingsOpen && (
        <SettingsSheet
          theme={theme}
          onTheme={setTheme}
          goal={goal}
          onGoal={setGoal}
          version={APP_VERSION}
          voiceOn={voiceOn}
          onVoice={toggleVoice}
          onClose={() => setSettingsOpen(false)}
        />
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
