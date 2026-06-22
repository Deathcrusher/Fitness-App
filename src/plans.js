import {
  Activity,
  Bike,
  Dumbbell,
  Flame,
  Footprints,
  HeartPulse,
} from 'lucide-react'

export const VISUALS = {
  warmup: '/assets/warmup.jpg',
  lower: '/assets/lower.jpg',
  upper: '/assets/upper.jpg',
  core: '/assets/core.jpg',
  cardio: '/assets/cardio.jpg',
  recovery: '/assets/recovery.jpg',
}

const EXERCISE_IMG = {
  connie: {
    'Warm-up': 'warmup',
    'Mobilisieren': 'warmup',
    'Kniebeugen': 'kniebeugen',
    'Ausfallschritte': 'ausfallschritte',
    'Rudern mit Hanteln': 'rudern',
    'Schulterdrücken': 'schulterdruecken',
    'Glute Bridge': 'glute-bridge',
    'Plank': 'plank',
    'Cardio Finish': 'hometrainer',
    'Hula Hoop': 'hula-hoop',
    'Hula Hoop Finish': 'hula-hoop',
    'Russian Twists': 'russian-twists',
    'Bicycle Crunches': 'bicycle-crunches',
    'Beinheben': 'beinheben',
    'Ausfahren': 'hometrainer',
    'Brustdrücken am Boden': '/assets/exercises/brustdruecken.jpg',
    'Seitheben': 'seitheben',
  },
  rene: {
    'Aufwärmen': 'warmup',
    'Kniebeugen': 'kniebeugen',
    'Ausfallschritte': 'ausfallschritte',
    'Rudern': 'rudern',
    'Rudern mit Hanteln': 'rudern',
    'Einarmiges Rudern': 'rudern',
    'Brustdrücken am Boden': 'brustdruecken',
    'Schulterdrücken': 'schulterdruecken',
    'Bizeps-Curls': 'bizeps-curls',
    'Plank': 'plank',
    'Liegestütze': 'liegestuetze',
    'Seitheben': 'seitheben',
    'Hammer Curls': 'hammer-curls',
    'Russian Twists': 'russian-twists',
    'Trizepsdrücken': 'trizeps',
    'Laufband Gehen': 'laufband',
    'Cooldown': 'warmup',
  },
}

export function imageFor(step, person) {
  const slug = EXERCISE_IMG[person]?.[step.name]
  if (slug?.startsWith('/')) return slug
  return slug ? `/assets/exercises/${person}/${slug}.webp` : VISUALS[step.type]
}

export const TYPE_META = {
  warmup: { label: 'Warm-up', icon: Footprints },
  lower: { label: 'Beine & Po', icon: Flame },
  upper: { label: 'Kraft', icon: Dumbbell },
  core: { label: 'Core', icon: Activity },
  cardio: { label: 'Cardio', icon: Bike },
  recovery: { label: 'Cooldown', icon: HeartPulse },
}

export const TYPE_KEYS = Object.keys(TYPE_META)

export const ACCENTS = ['green', 'coral', 'violet', 'blue', 'amber']

export function step(type, name, detail, reps) {
  return { type, name, detail, reps }
}

export function warmupSteps() {
  return [
    step('warmup', 'Marschieren', 'Auf der Stelle marschieren, Arme locker mitnehmen.', '60 Sek'),
    step('warmup', 'Arme kreisen', 'Arme groß und weich kreisen, Schultern entspannt.', '30 Sek'),
    step('warmup', 'Arme kreisen (andere Richtung)', 'Richtung wechseln und gleichmäßig weiterkreisen.', '30 Sek'),
    step('warmup', 'Knie heben – links', 'Linkes Knie Richtung Brust heben, Rumpf stabil halten.', '60 Sek'),
    step('warmup', 'Knie heben – rechts', 'Rechtes Knie Richtung Brust heben.', '60 Sek'),
    step('warmup', 'Ferse zum Po – links', 'Linke Ferse zum Po führen, aufrecht bleiben.', '60 Sek'),
    step('warmup', 'Ferse zum Po – rechts', 'Rechte Ferse zum Po führen.', '60 Sek'),
    step('warmup', 'Leichte Kniebeugen', 'Kontrolliert in die Knie gehen, nicht zu tief.', '30 Sek'),
  ]
}

export const builtinPlans = {
  connie: {
    name: 'Connie',
    title: 'Straffen & wohlfühlen',
    accent: 'coral',
    equipment: 'Hanteln, Matte, Hula Hoop, Hometrainer',
    builtin: true,
    days: [
      {
        title: 'Montag',
        focus: 'Ganzkörper + Cardio',
        tone: 'Kalorien verbrennen und Körperspannung aufbauen.',
        steps: [
          ...warmupSteps(),
          step('lower', 'Kniebeugen', 'Brust aufrecht, Knie leicht nach außen, kontrolliert tief gehen.', '3 x 15'),
          step('lower', 'Ausfallschritte', 'Pro Bein sauber arbeiten, Oberkörper bleibt ruhig.', '3 x 12 je Bein'),
          step('upper', 'Rudern mit Hanteln', 'Rücken gerade, Ellbogen eng am Körper ziehen.', '3 x 12'),
          step('upper', 'Schulterdrücken', 'Bauch fest, Hanteln kontrolliert nach oben drücken.', '3 x 12'),
          step('lower', 'Glute Bridge', 'Po oben kurz anspannen und langsam absenken.', '3 x 15'),
          step('core', 'Plank', 'Rücken lang, Bauch fest, Nacken entspannt.', '3 x 30-45 Sek'),
          step('cardio', 'Cardio Finish', 'Hometrainer moderat fahren, gleichmäßig atmen.', '20 Min'),
        ],
      },
      {
        title: 'Mittwoch',
        focus: 'Cardio & Core',
        tone: 'Ausdauer, Bauchspannung und lockerer Rhythmus.',
        steps: [
          ...warmupSteps(),
          step('cardio', 'Hula Hoop', 'Gleichmäßiges Tempo, locker bleiben und dranbleiben.', '30 Min'),
          step('core', 'Plank', 'Ruhig halten und gleichmäßig atmen.', '3 x 30-45 Sek'),
          step('core', 'Russian Twists', 'Oberkörper drehen, Core bleibt aktiv.', '3 x 20'),
          step('core', 'Bicycle Crunches', 'Langsam und sauber, nicht am Nacken ziehen.', '3 x 20'),
          step('core', 'Beinheben', 'Rücken bleibt am Boden, Bewegung kontrollieren.', '3 x 15'),
          step('cardio', 'Ausfahren', 'Hometrainer locker ausfahren und Puls senken.', '15 Min'),
        ],
      },
      {
        title: 'Freitag',
        focus: 'Ganzkörper + Hula Hoop',
        tone: 'Po, Beine, Oberkörper und ein leichter Abschluss.',
        steps: [
          ...warmupSteps(),
          step('lower', 'Kniebeugen', 'Sauber, ruhig und kontrolliert arbeiten.', '3 x 15'),
          step('lower', 'Ausfallschritte', 'Pro Bein sauber arbeiten, Oberkörper bleibt ruhig.', '3 x 12 je Bein'),
          step('upper', 'Brustdrücken am Boden', 'Hanteln kontrolliert nach oben drücken.', '3 x 12'),
          step('upper', 'Rudern mit Hanteln', 'Schulterblätter bewusst zusammenziehen.', '3 x 12'),
          step('upper', 'Seitheben', 'Leichtes Gewicht, ohne Schwung.', '3 x 15'),
          step('lower', 'Glute Bridge', 'Po oben aktiv anspannen.', '3 x 15'),
          step('cardio', 'Hula Hoop Finish', 'Locker, gleichmäßig und mit Spaß abschließen.', '20 Min'),
        ],
      },
    ],
  },
  rene: {
    name: 'René',
    title: 'Kraft & Ausdauer',
    accent: 'green',
    equipment: 'Hanteln, Matte, Laufband',
    builtin: true,
    days: [
      {
        title: 'Montag',
        focus: 'Ganzkörper A',
        tone: 'Basis-Kraft sauber aufbauen.',
        steps: [
          ...warmupSteps(),
          step('lower', 'Kniebeugen', 'Optional mit Hanteln, kontrolliert tief gehen.', '3 x 10'),
          step('upper', 'Rudern', 'Rücken gerade, Hanteln zum Körper ziehen.', '3 x 10'),
          step('upper', 'Brustdrücken am Boden', 'Saubere Wiederholungen, Schulterblätter stabil.', '3 x 10'),
          step('upper', 'Schulterdrücken', 'Bauch fest, nicht ins Hohlkreuz fallen.', '3 x 8-10'),
          step('upper', 'Bizeps-Curls', 'Ellbogen ruhig halten, langsam senken.', '2 x 12'),
          step('core', 'Plank', 'Spannung halten und ruhig atmen.', '3 x 30-45 Sek'),
        ],
      },
      {
        title: 'Mittwoch',
        focus: 'Ganzkörper B',
        tone: 'Variation, Technik und stabiler Rumpf.',
        steps: [
          ...warmupSteps(),
          step('lower', 'Ausfallschritte', 'Pro Bein kontrolliert arbeiten.', '2-3 x 8 je Bein'),
          step('upper', 'Einarmiges Rudern', 'Abstützen, Rücken gerade, sauber ziehen.', '2-3 x 10 je Seite'),
          step('upper', 'Liegestütze', 'Auf Knien möglich, Rumpf bleibt fest.', '2-3 x 8-12'),
          step('upper', 'Seitheben', 'Langsam und ohne Schwung.', '2 x 10-12'),
          step('upper', 'Hammer Curls', 'Kontrolliert curlen und langsam senken.', '2 x 10'),
          step('core', 'Russian Twists', 'Bauch fest, 10 Drehungen pro Seite.', '2 x 20'),
        ],
      },
      {
        title: 'Freitag',
        focus: 'Ganzkörper + Laufband',
        tone: 'Kraft wiederholen, leicht steigern und locker auslaufen.',
        steps: [
          ...warmupSteps(),
          step('lower', 'Kniebeugen', 'Kontrolliert tief gehen, saubere Technik vor Gewicht.', '3 x 10-12'),
          step('lower', 'Ausfallschritte', 'Pro Bein sauber arbeiten, Oberkörper aufrecht.', '3 x 8 je Bein'),
          step('upper', 'Rudern mit Hanteln', 'Rücken gerade, Schulterblätter zusammenführen.', '3 x 10-12'),
          step('upper', 'Brustdrücken am Boden', 'Saubere Wiederholungen, stabil in den Schultern.', '3 x 10-12'),
          step('upper', 'Schulterdrücken', 'Bauch fest, kontrolliert nach oben drücken.', '3 x 8-10'),
          step('upper', 'Trizepsdrücken', 'Ellbogen nah am Körper, langsam führen.', '2 x 12'),
          step('core', 'Plank', 'Spannung halten, ruhig atmen.', '3 x 30-45 Sek'),
          step('cardio', 'Laufband Gehen', '5 Min langsam, danach zügig gehen. Nicht rennen.', '10-15 Min'),
          step('recovery', 'Cooldown', 'Kurz dehnen, Wasser trinken und Puls senken.', '5 Min'),
        ],
      },
    ],
  },
}

export function timedSeconds(reps) {
  const match = reps.match(/(\d+)\s*Sek/i)
  return match ? Number(match[1]) : null
}

export function fmt(seconds) {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

export function makeId() {
  try {
    if (crypto.randomUUID) return crypto.randomUUID()
  } catch {
    /* noop */
  }
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function emptyStep() {
  return { type: 'lower', name: 'Neue Übung', detail: '', reps: '3 x 12' }
}

export function emptyDay() {
  return { title: 'Trainingstag', focus: 'Fokus', tone: '', steps: [emptyStep()] }
}

export function emptyPlan() {
  return {
    id: makeId(),
    name: 'Mein Programm',
    title: 'Eigenes Training',
    accent: 'violet',
    equipment: '',
    days: [emptyDay()],
  }
}

export function duplicatePlan(source, personKey) {
  const base = source || builtinPlans[personKey] || Object.values(builtinPlans)[0]
  return {
    id: makeId(),
    name: `${base.name} (Kopie)`,
    title: base.title,
    accent: base.accent,
    equipment: base.equipment,
    days: JSON.parse(JSON.stringify(base.days)),
  }
}

export function parseVideo(url) {
  if (!url) return null
  const u = String(url).trim()
  if (!u) return null
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) return { kind: 'youtube', embed: `https://www.youtube.com/embed/${yt[1]}` }
  if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(u) || u.startsWith('blob:')) {
    return { kind: 'file', src: u }
  }
  return { kind: 'iframe', src: u }
}

export function videoKey(programId, dayIndex, step) {
  return `${programId}:${dayIndex}:${step.name}`
}
