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

const CONNIE_MOVEMENT_GUIDES = {
  Kniebeugen: 'kniebeugen',
  Ausfallschritte: 'ausfallschritte',
  'Rudern mit Hanteln': 'rudern-mit-hanteln',
  Schulterdrücken: 'schulterdruecken',
  'Glute Bridge': 'glute-bridge',
  'Russian Twists': 'russian-twists',
  'Bicycle Crunches': 'bicycle-crunches',
  Beinheben: 'beinheben',
  'Brustdrücken am Boden': 'brustdruecken-am-boden',
  Seitheben: 'seitheben',
}

const RENE_MOVEMENT_GUIDES = {
  Kniebeugen: 'kniebeugen',
  Ausfallschritte: 'ausfallschritte',
  Rudern: 'rudern',
  'Rudern mit Hanteln': 'rudern',
  'Einarmiges Rudern': 'einarmiges-rudern',
  'Brustdrücken am Boden': 'brustdruecken',
  'Trizeps-Brustdrücken am Boden (liegend)': 'brustdruecken',
  Schulterdrücken: 'schulterdruecken',
  'Bizeps-Curls': 'bizeps-curls',
  Liegestütze: 'liegestuetze',
  Seitheben: 'seitheben',
  'Hammer Curls': 'hammer-curls',
  'Russian Twists': 'russian-twists',
}

export function imageFor(step, person) {
  if (person === 'connie') {
    const slug = CONNIE_EXERCISE_IMAGES[step?.name]
    if (slug) return `${CONNIE_IMAGE_PREFIX}${slug}-v3.webp?v=3`
  }
  return baseImageFor(step, person)
}

export function imageFocusFor(step, person) {
  if (person === 'connie' && CONNIE_EXERCISE_IMAGES[step?.name]) {
    return 'center center'
  }
  return baseImageFocusFor(step, person)
}

export function movementGuideFor(step, person) {
  const guides = person === 'connie' ? CONNIE_MOVEMENT_GUIDES : person === 'rene' ? RENE_MOVEMENT_GUIDES : null
  const slug = guides?.[step?.name]
  return slug ? `/assets/exercises/${person}/${slug}-guide-v1.webp?v=1` : null
}
