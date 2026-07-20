export * from './plansBase.js'

import {
  imageFor as baseImageFor,
  imageFocusFor as baseImageFocusFor,
} from './plansBase.js'

const CONNIE_IMAGE_PREFIX = '/assets/exercises/connie/'

const CONNIE_EXERCISE_IMAGES = {
  Marschieren: 'marschieren',
  'Arme kreisen': 'arme-kreisen',
  'Arme kreisen (andere Richtung)': 'arme-kreisen',
  'Knie heben – links': 'knie-heben',
  'Knie heben – rechts': 'knie-heben',
  'Ferse zum Po – links': 'ferse-zum-po',
  'Ferse zum Po – rechts': 'ferse-zum-po',
  'Leichte Kniebeugen': 'leichte-kniebeugen',
  Kniebeugen: 'kniebeugen',
  Ausfallschritte: 'ausfallschritte',
  'Rudern mit Hanteln': 'rudern-mit-hanteln',
  Schulterdrücken: 'schulterdruecken',
  'Glute Bridge': 'glute-bridge',
  Plank: 'plank',
  'Cardio Finish': 'cardio-hometrainer',
  Ausfahren: 'cardio-hometrainer',
  'Hula Hoop': 'hula-hoop',
  'Hula Hoop Finish': 'hula-hoop',
  'Russian Twists': 'russian-twists',
  'Bicycle Crunches': 'bicycle-crunches',
  Beinheben: 'beinheben',
  'Brustdrücken am Boden': 'brustdruecken-am-boden',
  Seitheben: 'seitheben',
}

// Neue, feste Dateinamen umgehen alle früheren Browser- und PWA-Cache-Einträge.
const CONNIE_DIRECT_IMAGES = {
  Marschieren: 'marschieren-photo.webp',
  'Ferse zum Po – links': 'ferse-zum-po-photo.webp',
  'Ferse zum Po – rechts': 'ferse-zum-po-photo.webp',
  'Glute Bridge': 'glute-bridge-photo.webp',
}

export function imageFor(step, person) {
  if (person === 'connie') {
    const directFile = CONNIE_DIRECT_IMAGES[step?.name]
    if (directFile) return `${CONNIE_IMAGE_PREFIX}${directFile}`

    const slug = CONNIE_EXERCISE_IMAGES[step?.name]
    if (slug) return `${CONNIE_IMAGE_PREFIX}${slug}.webp`
  }
  return baseImageFor(step, person)
}

export function imageFocusFor(step, person) {
  if (person === 'connie' && CONNIE_EXERCISE_IMAGES[step?.name]) {
    return 'center center'
  }
  return baseImageFocusFor(step, person)
}
