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


/**
 * One-time repair for René's Monday plank override accidentally saved as 1 set.
 * Repair only that exact override. Preserve all other custom set counts and
 * don't reset a deliberate change the user makes afterwards.
 *
 * Called AFTER cloud bootstrap because remote settings can contain the old value.
 * The local-only marker is deliberately not included in the FitFlow cloud export.
 */
const PLANK_FIX_MARKER = 'ffcloud-plank-3sets-fixed-20261123'
export function repairMondayPlankSets() {
  try {
    if (localStorage.getItem(PLANK_FIX_MARKER) === '1') return false
    const key = 'rene:0:Plank'
    const raw = localStorage.getItem(SET_OVERRIDES_KEY)
    const overrides = raw ? JSON.parse(raw) : {}
    if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) return false
    let changed = false
    if (Number(overrides[key]) === 1) {
      overrides[key] = 3 // Monday program default is 3 x 30–45 Sek.
      localStorage.setItem(SET_OVERRIDES_KEY, JSON.stringify(overrides))
      changed = true
    }
    localStorage.setItem(PLANK_FIX_MARKER, '1')
    return changed
  } catch {
    // Never block offline training if localStorage is unavailable.
    return false
  }
}
