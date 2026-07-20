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

// New URLs deliberately bypass stale browser/PWA cache entries from the old image builds.
const CONNIE_CRITICAL_IMAGE_URLS = {
  Marschieren: `${CONNIE_IMAGE_PREFIX}marschieren.webp?v=8`,
  'Ferse zum Po – links': `${CONNIE_IMAGE_PREFIX}ferse-zum-po.webp?v=8`,
  'Ferse zum Po – rechts': `${CONNIE_IMAGE_PREFIX}ferse-zum-po.webp?v=8`,
  'Glute Bridge': `${CONNIE_IMAGE_PREFIX}glute-bridge.webp?v=8`,
}

export const CONNIE_CRITICAL_PRELOAD_URLS = [...new Set(Object.values(CONNIE_CRITICAL_IMAGE_URLS))]

export function imageFor(step, person) {
  if (person === 'connie') {
    const criticalUrl = CONNIE_CRITICAL_IMAGE_URLS[step?.name]
    if (criticalUrl) return criticalUrl

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
