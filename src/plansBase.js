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

const IMAGE_FOCUS = {
  '/assets/exercises/connie/bicycle-crunches.webp': '58% center',
  '/assets/exercises/connie/glute-bridge.webp': '64% center',
  '/assets/exercises/connie/hula-hoop.webp': '62% center',
  '/assets/exercises/connie/kniebeugen.webp': '66% center',
  '/assets/exercises/connie/plank.webp': '58% center',
  '/assets/exercises/connie/russian-twists.webp': '62% center',
  '/assets/exercises/rene/ausfallschritte.webp': '60% center',
  '/assets/exercises/rene/kniebeugen.webp': '66% center',
  '/assets/exercises/rene/plank.webp': '64% center',
  '/assets/exercises/rene/russian-twists.webp': '56% center',
  '/assets/exercises/rene/schulterdruecken.webp': '68% center',
  '/assets/exercises/rene/warmup.webp': '64% center',
  '/assets/lower.jpg': '62% center',
  '/assets/upper.jpg': '66% center',
}

export function imageFocusFor(step, person) {
  return IMAGE_FOCUS[imageFor(step, person)] || 'center center'
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

export function parseSets(reps) {
  const s = String(reps || '')
  const range = s.match(/(\d+)\s*[-–]\s*\d+\s*x/i)
  if (range) {
    return { sets: Number(range[1]), per: s.replace(/^.*?x\s*/i, '').trim(), isSet: true }
  }
  const x = s.match(/(\d+)\s*x\s*(.+)/i)
  if (x) return { sets: Number(x[1]), per: x[2].trim(), isSet: true }
  return { sets: 1, per: s, isSet: false }
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
    owner: 'connie',
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
    owner: base.owner || 'connie',
    days: JSON.parse(JSON.stringify(base.days)),
  }
}

export function parseVideo(url) {
  if (!url) return null
  const u = String(url).trim()
  if (!u) return null
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) return { kind: 'youtube', embed: `https://www.youtube.com/embed/${yt[1]}?mute=1&rel=0&playsinline=1` }
  if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(u) || u.startsWith('blob:')) {
    return { kind: 'file', src: u }
  }
  return { kind: 'iframe', src: u }
}

export function youtubeSearchUrl(name) {
  const q = encodeURIComponent(`${name} Übung Anleitung kurz`)
  return `https://www.youtube.com/results?search_query=${q}`
}

export function videoKey(programId, dayIndex, step) {
  return `${programId}:${dayIndex}:${step.name}`
}

export const EXERCISE_LIBRARY = [
  { type: 'warmup', name: 'Marschieren', reps: '60 Sek', detail: 'Auf der Stelle marschieren, Arme locker mitnehmen.', equip: 'bw' },
  { type: 'warmup', name: 'Arme kreisen', reps: '30 Sek', detail: 'Arme groß und weich kreisen, Schultern entspannt.', equip: 'bw' },
  { type: 'warmup', name: 'Knie heben', reps: '45 Sek', detail: 'Knie abwechselnd Richtung Brust, Rumpf stabil.', equip: 'bw' },
  { type: 'warmup', name: 'Hampelmann', reps: '30 Sek', detail: 'Locker einhüpfen, Arme und Beine kreuzen.', equip: 'bw' },
  { type: 'warmup', name: 'Seilspringen (ohne Seil)', reps: '60 Sek', detail: 'Leicht auf den Ballen, Rhythmus gleichmäßig.', equip: 'bw' },

  { type: 'lower', name: 'Kniebeugen', reps: '3 x 15', detail: 'Brust aufrecht, Knie leicht nach außen, kontrolliert tief.', equip: 'both' },
  { type: 'lower', name: 'Ausfallschritte', reps: '3 x 12 je Bein', detail: 'Pro Bein sauber arbeiten, Oberkörper ruhig.', equip: 'both' },
  { type: 'lower', name: 'Glute Bridge', reps: '3 x 15', detail: 'Po oben kurz anspannen, langsam absenken.', equip: 'bw' },
  { type: 'lower', name: 'Wandsitz', reps: '30 Sek', detail: 'Rücken flach an die Wand, Oberschenkel waagerecht.', equip: 'bw' },
  { type: 'lower', name: 'Beinheben liegend', reps: '3 x 15 je Bein', detail: 'Seitlich liegen, Bein kontrolliert heben und senken.', equip: 'bw' },

  { type: 'upper', name: 'Liegestütze', reps: '3 x 10', detail: 'Rumpf fest, auf Knien möglich.', equip: 'bw' },
  { type: 'upper', name: 'Rudern', reps: '3 x 12', detail: 'Rücken gerade, Schulterblätter zusammenführen.', equip: 'db' },
  { type: 'upper', name: 'Schulterdrücken', reps: '3 x 12', detail: 'Bauch fest, kontrolliert nach oben drücken.', equip: 'db' },
  { type: 'upper', name: 'Bizeps-Curls', reps: '2 x 12', detail: 'Ellbogen ruhig, langsam senken.', equip: 'db' },
  { type: 'upper', name: 'Trizepsdrücken', reps: '2 x 12', detail: 'Ellbogen nah am Körper, langsam führen.', equip: 'both' },
  { type: 'upper', name: 'Seitheben', reps: '3 x 15', detail: 'Leichtes Gewicht, ohne Schwung.', equip: 'db' },
  { type: 'upper', name: 'Brustdrücken am Boden', reps: '3 x 12', detail: 'Hanteln kontrolliert nach oben drücken.', equip: 'db' },

  { type: 'core', name: 'Plank', reps: '45 Sek', detail: 'Rücken lang, Bauch fest, ruhig atmen.', equip: 'bw' },
  { type: 'core', name: 'Russian Twists', reps: '3 x 20', detail: 'Oberkörper drehen, Core aktiv.', equip: 'bw' },
  { type: 'core', name: 'Bicycle Crunches', reps: '3 x 20', detail: 'Langsam und sauber, nicht am Nacken ziehen.', equip: 'bw' },
  { type: 'core', name: 'Beinheben', reps: '3 x 15', detail: 'Rücken am Boden, Bewegung kontrollieren.', equip: 'bw' },
  { type: 'core', name: 'Unterarmstütz seitlich', reps: '30 Sek je Seite', detail: 'Hüfte hoch, Körper in einer Linie.', equip: 'bw' },

  { type: 'cardio', name: 'Hampelmann', reps: '60 Sek', detail: 'Schnell und leicht, gleichmäßig atmen.', equip: 'bw' },
  { type: 'cardio', name: 'Bergsteiger', reps: '40 Sek', detail: 'Knie abwechselnd zum Bauch, Rumpf stabil.', equip: 'bw' },
  { type: 'cardio', name: 'Seilspringen', reps: '60 Sek', detail: 'Leicht auf den Ballen, im Rhythmus bleiben.', equip: 'bw' },
  { type: 'cardio', name: 'Hometrainer', reps: '15 Min', detail: 'Moderates Tempo, gleichmäßig treten.', equip: 'db' },

  { type: 'recovery', name: 'Dehnen', reps: '5 Min', detail: 'Große Muskelgruppen ruhig dehnen, nicht wippen.', equip: 'bw' },
  { type: 'recovery', name: 'Koordiniertes Atmen', reps: '2 Min', detail: 'Tief in den Bauch atmen, Puls senken.', equip: 'bw' },
]

export const PROGRAM_TEMPLATES = [
  {
    name: 'Rücken & Haltung',
    title: 'Aufgerichtet durch den Tag',
    accent: 'violet',
    equipment: 'Hanteln, Matte',
    days: [{
      title: 'Haltungstag', focus: 'Oberrücken & Core', tone: 'Gegen langes Sitzen: Rumpf fest, Schultern zurück.',
      steps: [
        step('warmup', 'Marschieren', 'Auf der Stelle marschieren, Arme locker mitnehmen.', '60 Sek'),
        step('warmup', 'Arme kreisen', 'Arme groß und weich kreisen.', '30 Sek'),
        step('upper', 'Rudern', 'Rücken gerade, Schulterblätter zusammenführen.', '3 x 12'),
        step('upper', 'Liegestütze', 'Auf Knien möglich, Rumpf bleibt fest.', '3 x 10'),
        step('core', 'Plank', 'Rücken lang, Bauch fest.', '45 Sek'),
        step('core', 'Unterarmstütz seitlich', 'Hüfte hoch, Körper in einer Linie.', '30 Sek je Seite'),
        step('recovery', 'Dehnen', 'Brust und Nacken locker dehnen.', '5 Min'),
      ],
    }],
  },
  {
    name: 'Cardio-Mix',
    title: 'Kurz, knackig, Puls hoch',
    accent: 'blue',
    equipment: 'Kein Equipment',
    days: [{
      title: 'Intervalltag', focus: 'Cardio-Intervalle', tone: 'Kurz und intensiv – jede Minute bewegen.',
      steps: [
        step('warmup', 'Hampelmann', 'Locker einhüpfen.', '30 Sek'),
        step('warmup', 'Knie heben', 'Knie abwechselnd hoch.', '45 Sek'),
        step('cardio', 'Bergsteiger', 'Knie zügig zum Bauch.', '40 Sek'),
        step('cardio', 'Hampelmann', 'Tempo raus, dranbleiben.', '60 Sek'),
        step('cardio', 'Seilspringen', 'Ohne Seil, im Rhythmus.', '60 Sek'),
        step('core', 'Bicycle Crunches', 'Langsam und sauber.', '3 x 20'),
        step('recovery', 'Koordiniertes Atmen', 'Tief in den Bauch atmen.', '2 Min'),
      ],
    }],
  },
  {
    name: 'Urlaubsprogramm',
    title: 'Überall, ohne Equipment',
    accent: 'amber',
    equipment: 'Ohne Equipment',
    days: [
      {
        title: 'Ganzkörper', focus: 'Kraft mit Körpergewicht', tone: 'Kompakt für unterwegs – nur dein Gewicht.',
        steps: [
          step('warmup', 'Marschieren', 'Auf der Stelle marschieren.', '60 Sek'),
          step('lower', 'Kniebeugen', 'Kontrolliert tief.', '3 x 15'),
          step('upper', 'Liegestütze', 'Auf Knien möglich.', '3 x 10'),
          step('core', 'Plank', 'Bauch fest, ruhig atmen.', '45 Sek'),
          step('cardio', 'Bergsteiger', 'Zügig, Rumpf stabil.', '40 Sek'),
          step('recovery', 'Dehnen', 'Große Muskelgruppen dehnen.', '5 Min'),
        ],
      },
      {
        title: 'Kurz & knackig', focus: 'Schnelle Runde', tone: '15 Minuten für Zwischendurch.',
        steps: [
          step('warmup', 'Arme kreisen', 'Schultern wachmachen.', '30 Sek'),
          step('lower', 'Ausfallschritte', 'Pro Bein sauber arbeiten.', '3 x 12 je Bein'),
          step('lower', 'Wandsitz', 'Oberschenkel waagerecht.', '30 Sek'),
          step('core', 'Russian Twists', 'Oberkörper drehen.', '3 x 20'),
          step('cardio', 'Hampelmann', 'Dranbleiben.', '60 Sek'),
          step('recovery', 'Dehnen', 'Locker auslaufen.', '5 Min'),
        ],
      },
    ],
  },
  {
    name: 'Oberkörper-Kraft',
    title: 'Drücken & Ziehen',
    accent: 'green',
    equipment: 'Hanteln, Matte',
    days: [{
      title: 'Push & Pull', focus: 'Brust, Rücken, Arme', tone: 'Sauber arbeiten, Spannung halten.',
      steps: [
        step('warmup', 'Arme kreisen', 'Arme groß kreisen.', '30 Sek'),
        step('upper', 'Liegestütze', 'Rumpf fest.', '3 x 10'),
        step('upper', 'Rudern', 'Schulterblätter zusammen.', '3 x 12'),
        step('upper', 'Schulterdrücken', 'Bauch fest.', '3 x 12'),
        step('upper', 'Bizeps-Curls', 'Ellbogen ruhig.', '2 x 12'),
        step('upper', 'Trizepsdrücken', 'Langsam führen.', '2 x 12'),
        step('core', 'Plank', 'Spannung halten.', '45 Sek'),
      ],
    }],
  },
  {
    name: 'Beine & Po',
    title: 'Fester Unterkörper',
    accent: 'coral',
    equipment: 'Hanteln (optional), Matte',
    days: [{
      title: 'Leg Day', focus: 'Oberschenkel & Po', tone: 'Kontrolliert, mit fester Mitte.',
      steps: [
        step('warmup', 'Marschieren', 'Auf der Stelle marschieren.', '60 Sek'),
        step('lower', 'Kniebeugen', 'Tief und kontrolliert.', '3 x 15'),
        step('lower', 'Ausfallschritte', 'Pro Bein sauber.', '3 x 12 je Bein'),
        step('lower', 'Glute Bridge', 'Po anspannen.', '3 x 15'),
        step('lower', 'Wandsitz', 'Bleiben halten.', '30 Sek'),
        step('core', 'Beinheben', 'Rücken am Boden.', '3 x 15'),
        step('recovery', 'Dehnen', 'Oberschenkel und Po dehnen.', '5 Min'),
      ],
    }],
  },
  {
    name: 'Core-Express',
    title: '10 Minuten Bauch',
    accent: 'violet',
    equipment: 'Matte',
    days: [{
      title: 'Bauch-Tag', focus: 'Core durchziehen', tone: 'Kurz und fokussiert – feste Mitte.',
      steps: [
        step('warmup', 'Knie heben', 'Knie abwechselnd hoch.', '45 Sek'),
        step('core', 'Plank', 'Rücken lang.', '45 Sek'),
        step('core', 'Russian Twists', 'Oberkörper drehen.', '3 x 20'),
        step('core', 'Bicycle Crunches', 'Langsam und sauber.', '3 x 20'),
        step('core', 'Beinheben', 'Kontrolliert.', '3 x 15'),
        step('core', 'Unterarmstütz seitlich', 'Hüfte hoch.', '30 Sek je Seite'),
        step('recovery', 'Koordiniertes Atmen', 'Puls senken.', '2 Min'),
      ],
    }],
  },
  {
    name: 'Anfänger-Ganzkörper',
    title: 'Sanft reinschnuppern',
    accent: 'green',
    equipment: 'Ohne Equipment',
    days: [{
      title: 'Einstieg', focus: 'Ganzkörper leicht', tone: 'Locker lernen, Technik vor Tempo.',
      steps: [
        step('warmup', 'Marschieren', 'Locker marschieren.', '60 Sek'),
        step('warmup', 'Arme kreisen', 'Schultern wachmachen.', '30 Sek'),
        step('lower', 'Kniebeugen', 'Sauber, nicht zu tief.', '3 x 10'),
        step('upper', 'Liegestütze', 'Auf Knien möglich.', '3 x 8'),
        step('lower', 'Glute Bridge', 'Po fest anspannen.', '3 x 12'),
        step('core', 'Plank', 'Ruhig halten.', '30 Sek'),
        step('recovery', 'Dehnen', 'Rundum locker dehnen.', '5 Min'),
      ],
    }],
  },
]

export function examplePlans() {
  const owners = ['connie', 'rene', 'connie']
  return PROGRAM_TEMPLATES.slice(0, 3).map((tpl, i) => ({
    ...tpl,
    id: makeId(),
    owner: owners[i],
    days: JSON.parse(JSON.stringify(tpl.days)),
  }))
}

export const GENERATOR_FOCUSES = [
  { key: 'ganzkoerper', label: 'Ganzkörper', types: ['lower', 'upper'] },
  { key: 'oberkoerper', label: 'Oberkörper', types: ['upper'] },
  { key: 'unterkoerper', label: 'Beine & Po', types: ['lower'] },
  { key: 'core', label: 'Core / Bauch', types: ['core'] },
  { key: 'cardio', label: 'Cardio', types: ['cardio'] },
  { key: 'ruecken', label: 'Rücken & Haltung', types: ['upper', 'core'] },
]
export const GENERATOR_EQUIP = [
  { key: 'hanteln', label: 'Mit Hanteln' },
  { key: 'koerpergewicht', label: 'Körpergewicht' },
  { key: 'keins', label: 'Ohne Equipment' },
]
export const GENERATOR_LENGTH = [
  { key: 'kurz', label: 'Kurz', count: 3 },
  { key: 'mittel', label: 'Mittel', count: 5 },
  { key: 'lang', label: 'Lang', count: 7 },
]

function equipmentAllows(block, equipment) {
  if (equipment === 'hanteln') return true
  return block.equip === 'bw' || block.equip === 'both'
}

function pickBlocks(list, count) {
  if (!list.length) return []
  const out = []
  let i = 0
  while (out.length < count) {
    const next = list[i % list.length]
    out.push({ ...next })
    i += 1
    if (i > count * 3) break
  }
  return out
}

export function generatePlan({ focus = 'ganzkoerper', equipment = 'koerpergewicht', length = 'mittel', days = 1, owner = 'connie' }) {
  const focusDef = GENERATOR_FOCUSES.find((f) => f.key === focus) || GENERATOR_FOCUSES[0]
  const lenDef = GENERATOR_LENGTH.find((l) => l.key === length) || GENERATOR_LENGTH[1]
  const equipLabel = (GENERATOR_EQUIP.find((e) => e.key === equipment) || GENERATOR_EQUIP[1]).label
  const mainCount = lenDef.count
  const dayCount = Math.min(Math.max(Number(days) || 1, 1), 3)

  const warmups = EXERCISE_LIBRARY.filter((b) => b.type === 'warmup' && equipmentAllows(b, equipment))
  const recoveries = EXERCISE_LIBRARY.filter((b) => b.type === 'recovery' && equipmentAllows(b, equipment))
  const corePool = EXERCISE_LIBRARY.filter((b) => b.type === 'core' && equipmentAllows(b, equipment))
  const mains = EXERCISE_LIBRARY.filter((b) => focusDef.types.includes(b.type) && equipmentAllows(b, equipment))

  const builtDays = []
  for (let d = 0; d < dayCount; d += 1) {
    const steps = []
    steps.push(...pickBlocks(warmups, length === 'lang' ? 3 : 2))
    steps.push(...pickBlocks(mains, mainCount))
    if (focus !== 'core' && corePool.length) steps.push(...pickBlocks(corePool, 1))
    if (recoveries.length) steps.push(...pickBlocks(recoveries, 1))

    const suffix = dayCount > 1 ? ` ${d + 1}` : ''
    builtDays.push({
      title: `${focusDef.label}${suffix}`.trim(),
      focus: focusDef.label,
      tone: `Automatisch erstellt – Fokus ${focusDef.label}, ${lenDef.label.toLowerCase()}.`,
      steps,
    })
  }

  return {
    id: makeId(),
    name: `${focusDef.label}-Programm`,
    title: `${equipLabel} · ${lenDef.label}`,
    accent: ['violet', 'blue', 'green', 'coral', 'amber'][Math.floor(Math.random() * 5)],
    equipment: equipLabel,
    owner,
    generated: true,
    days: builtDays,
  }
}

export function scanGoalText(text) {
  const t = String(text || '').toLowerCase()
  const out = {}
  if (/ganz|voll|full|total/.test(t)) out.focus = 'ganzkoerper'
  else if (/rücken|ruecken|haltung|oberrück/.test(t)) out.focus = 'ruecken'
  else if (/ober|arm|brust|schulter|bizeps|trizeps/.test(t)) out.focus = 'oberkoerper'
  else if (/bein|po|gesäß|gesaess|unte|oberschenkel/.test(t)) out.focus = 'unterkoerper'
  else if (/bauch|core|mittel/.test(t)) out.focus = 'core'
  else if (/cardio|kondi|ausdauer|puls|lauf|renn|ausdau/.test(t)) out.focus = 'cardio'

  if (/hantel|gewicht|dumbbell/.test(t)) out.equipment = 'hanteln'
  else if (/ohne|nix|nichts|körpergewicht|koerpergewicht|körper/.test(t)) out.equipment = 'keins'

  if (/kurz|schnell|15|min|quick/.test(t)) out.length = 'kurz'
  else if (/lang|intensiv|60|härt|hart/.test(t)) out.length = 'lang'

  const dayMatch = t.match(/(\d)\s*(tage|tag|days|mal)/)
  if (dayMatch) out.days = Math.min(Math.max(Number(dayMatch[1]) || 1, 1), 3)
  return out
}
