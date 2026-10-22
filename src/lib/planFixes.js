import { builtinPlans } from './plans'

const SET_OVERRIDES_KEY = 'fitflow-sets-v1'

export function applyPlanFixes() {
  const renePlan = builtinPlans.rene
  const mondayIndex = renePlan?.days.findIndex((day) => day.title === 'Montag') ?? -1
  const monday = mondayIndex >= 0 ? renePlan.days[mondayIndex] : null
  if (!monday) return

  if (!renePlan.equipment.includes('Hometrainer')) {
    renePlan.equipment = `${renePlan.equipment}, Hometrainer`
  }

  const rowing = monday.steps.find((item) => item.name === 'Rudern')
  if (rowing) {
    rowing.reps = '3 x 10'
    rowing.sets = 3
  }

  const hasBikeFinish = monday.steps.some((item) => item.name === 'Hometrainer Finish')
  if (!hasBikeFinish) {
    monday.steps.push({
      type: 'cardio',
      name: 'Hometrainer Finish',
      detail: 'Nach dem Krafttraining 15–20 Minuten in moderatem Tempo fahren und gleichmäßig atmen.',
      reps: '15–20 Min',
    })
  }

  try {
    const overrides = JSON.parse(localStorage.getItem(SET_OVERRIDES_KEY) || '{}')
    const rowingKey = `rene:${mondayIndex}:Rudern`
    if (Object.prototype.hasOwnProperty.call(overrides, rowingKey)) {
      const savedSets = Number(overrides[rowingKey])
      if (!Number.isFinite(savedSets) || savedSets < 2) {
        delete overrides[rowingKey]
        localStorage.setItem(SET_OVERRIDES_KEY, JSON.stringify(overrides))
      }
    }
  } catch {
    /* Ungültige alte Einstellungen werden von der App später neu angelegt. */
  }
}
