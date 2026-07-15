import { useEffect } from 'react'

const SPRITE_SRC = '/assets/exercises/connie/generated-sprite.webp'

const EXERCISE_POSITIONS = {
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
      if (currentSrc !== SPRITE_SRC) {
        image.dataset.fitflowOriginalSrc = currentSrc
        image.dataset.fitflowOriginalPosition = image.style.objectPosition || 'center center'
      }

      const exerciseName = exerciseNameFromImage(image)
      const position = isConnieSelected() ? EXERCISE_POSITIONS[exerciseName] : null

      if (position) {
        if (image.getAttribute('src') !== SPRITE_SRC) image.setAttribute('src', SPRITE_SRC)
        const objectPosition = `center ${position}`
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
