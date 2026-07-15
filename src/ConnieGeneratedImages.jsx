import { useEffect } from 'react'
import missingPart0 from './connieSpritePart0'
import missingPart1 from './connieSpritePart1'
import missingPart2 from './connieSpritePart2'

const PRIMARY_SPRITE = '/assets/exercises/connie/generated-sprite.webp'
const MISSING_SPRITE = `data:image/webp;base64,${missingPart0}${missingPart1}${missingPart2}`
const GENERATED_SOURCES = new Set([PRIMARY_SPRITE, MISSING_SPRITE])

const PRIMARY_POSITIONS = {
  'Knie heben – links': '0%',
  'Knie heben – rechts': '0%',
  'Rudern mit Hanteln': '11.111%',
  'Cardio Finish': '22.222%',
  Ausfahren: '22.222%',
  Kniebeugen: '33.333%',
  Schulterdrücken: '44.444%',
  'Glute Bridge': '55.556%',
  Plank: '66.667%',
  'Hula Hoop': '77.778%',
  'Hula Hoop Finish': '77.778%',
  'Russian Twists': '88.889%',
  Ausfallschritte: '100%',
}

const MISSING_POSITIONS = {
  Marschieren: '0%',
  'Arme kreisen': '14.286%',
  'Arme kreisen (andere Richtung)': '14.286%',
  'Ferse zum Po – links': '28.571%',
  'Ferse zum Po – rechts': '28.571%',
  'Leichte Kniebeugen': '42.857%',
  'Bicycle Crunches': '57.143%',
  Beinheben: '71.429%',
  'Brustdrücken am Boden': '85.714%',
  Seitheben: '100%',
}

function generatedImageFor(exerciseName) {
  if (PRIMARY_POSITIONS[exerciseName]) {
    return { src: PRIMARY_SPRITE, position: PRIMARY_POSITIONS[exerciseName] }
  }
  if (MISSING_POSITIONS[exerciseName]) {
    return { src: MISSING_SPRITE, position: MISSING_POSITIONS[exerciseName] }
  }
  return null
}

function exerciseNameFromImage(image) {
  const alt = image?.getAttribute('alt')?.trim() || ''
  return alt.endsWith(' Foto') ? alt.slice(0, -5) : alt
}

function isConnieSelected() {
  return document.querySelector('.hero h1')?.textContent?.trim() === 'Connie'
}

export default function ConnieGeneratedImages() {
  useEffect(() => {
    function syncExerciseImage() {
      const image = document.querySelector('.sessionImageWrap img')
      if (!image) return

      const currentSrc = image.getAttribute('src') || ''
      if (!GENERATED_SOURCES.has(currentSrc)) {
        image.dataset.fitflowOriginalSrc = currentSrc
        image.dataset.fitflowOriginalPosition = image.style.objectPosition || 'center center'
      }

      const exerciseName = exerciseNameFromImage(image)
      const generated = isConnieSelected() ? generatedImageFor(exerciseName) : null

      if (generated) {
        if (currentSrc !== generated.src) image.setAttribute('src', generated.src)
        const objectPosition = `center ${generated.position}`
        if (image.style.objectPosition !== objectPosition) image.style.objectPosition = objectPosition
        image.dataset.fitflowConnieGenerated = 'true'
        return
      }

      if (image.dataset.fitflowConnieGenerated === 'true') {
        if (image.dataset.fitflowOriginalSrc) image.setAttribute('src', image.dataset.fitflowOriginalSrc)
        image.style.objectPosition = image.dataset.fitflowOriginalPosition || 'center center'
        delete image.dataset.fitflowConnieGenerated
      }
    }

    const root = document.getElementById('root')
    if (!root) return undefined

    syncExerciseImage()
    const observer = new MutationObserver(syncExerciseImage)
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['src', 'alt', 'class', 'style'],
    })

    return () => observer.disconnect()
  }, [])

  return null
}
