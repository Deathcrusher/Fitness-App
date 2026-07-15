import { useEffect } from 'react'

const IMAGE_PREFIX = '/assets/exercises/connie/'

const EXERCISE_IMAGES = {
  Marschieren: `${IMAGE_PREFIX}marschieren.webp`,
  'Arme kreisen': `${IMAGE_PREFIX}arme-kreisen.webp`,
  'Arme kreisen (andere Richtung)': `${IMAGE_PREFIX}arme-kreisen.webp`,
  'Knie heben – links': `${IMAGE_PREFIX}knie-heben.webp`,
  'Knie heben – rechts': `${IMAGE_PREFIX}knie-heben.webp`,
  'Ferse zum Po – links': `${IMAGE_PREFIX}ferse-zum-po.webp`,
  'Ferse zum Po – rechts': `${IMAGE_PREFIX}ferse-zum-po.webp`,
  'Leichte Kniebeugen': `${IMAGE_PREFIX}leichte-kniebeugen.webp`,
  Kniebeugen: `${IMAGE_PREFIX}kniebeugen.webp`,
  Ausfallschritte: `${IMAGE_PREFIX}ausfallschritte.webp`,
  'Rudern mit Hanteln': `${IMAGE_PREFIX}rudern-mit-hanteln.webp`,
  Schulterdrücken: `${IMAGE_PREFIX}schulterdruecken.webp`,
  'Glute Bridge': `${IMAGE_PREFIX}glute-bridge.webp`,
  Plank: `${IMAGE_PREFIX}plank.webp`,
  'Cardio Finish': `${IMAGE_PREFIX}cardio-hometrainer.webp`,
  Ausfahren: `${IMAGE_PREFIX}cardio-hometrainer.webp`,
  'Hula Hoop': `${IMAGE_PREFIX}hula-hoop.webp`,
  'Hula Hoop Finish': `${IMAGE_PREFIX}hula-hoop.webp`,
  'Russian Twists': `${IMAGE_PREFIX}russian-twists.webp`,
  'Bicycle Crunches': `${IMAGE_PREFIX}bicycle-crunches.webp`,
  Beinheben: `${IMAGE_PREFIX}beinheben.webp`,
  'Brustdrücken am Boden': `${IMAGE_PREFIX}brustdruecken-am-boden.webp`,
  Seitheben: `${IMAGE_PREFIX}seitheben.webp`,
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
      if (!currentSrc.startsWith(IMAGE_PREFIX)) {
        image.dataset.fitflowOriginalSrc = currentSrc
        image.dataset.fitflowOriginalPosition = image.style.objectPosition || 'center center'
      }

      const exerciseName = exerciseNameFromImage(image)
      const generatedSrc = isConnieSelected() ? EXERCISE_IMAGES[exerciseName] : null

      if (generatedSrc) {
        if (currentSrc !== generatedSrc) image.setAttribute('src', generatedSrc)
        image.style.objectPosition = 'center center'
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
