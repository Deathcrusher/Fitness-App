/*
 * Sprach-Coach über die Sprachausgabe des Browsers (Web Speech API).
 * Läuft offline mit den Stimmen des Geräts, kostet nichts.
 */
const VOICE_KEY = 'fitflow-voice-v1'
const PREFERRED = /anna|helena|petra|markus|yannick|google deutsch|katja|conrad/i

let enabled = (() => {
  try {
    return localStorage.getItem(VOICE_KEY) !== 'off'
  } catch {
    return true
  }
})()

export const coachSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export function coachEnabled() {
  return enabled && coachSupported()
}

export function setCoachEnabled(value) {
  enabled = Boolean(value)
  try {
    localStorage.setItem(VOICE_KEY, enabled ? 'on' : 'off')
  } catch {
    /* noop */
  }
  if (!enabled && coachSupported()) window.speechSynthesis.cancel()
}

function pickVoice() {
  const voices = window.speechSynthesis.getVoices().filter((v) => /^de(-|_|$)/i.test(v.lang))
  return voices.find((v) => PREFERRED.test(v.name) && v.localService)
    || voices.find((v) => PREFERRED.test(v.name))
    || voices.find((v) => v.localService)
    || voices[0]
    || null
}

/** Einmal bei einer Nutzeraktion aufrufen – iOS gibt die Sprachausgabe erst danach frei */
export function unlockCoach() {
  if (!coachSupported()) return
  try {
    const u = new SpeechSynthesisUtterance(' ')
    u.volume = 0
    window.speechSynthesis.speak(u)
  } catch {
    /* noop */
  }
}

export function say(text, { interrupt = false } = {}) {
  if (!coachEnabled() || !text) return
  try {
    const synth = window.speechSynthesis
    if (interrupt) synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'de-DE'
    u.rate = 1.03
    const voice = pickVoice()
    if (voice) u.voice = voice
    synth.speak(u)
  } catch {
    /* Sprachausgabe nicht verfügbar */
  }
}

/* ---------- Ansagetexte ---------- */
const kg = (w) => `${String(Math.round(w * 10) / 10).replace('.', ',')} Kilo`

export function introText(step, { sets, draft, weighted, first }) {
  const lead = first ? `Los geht's mit ${step.name}.` : `Weiter mit ${step.name}.`
  const reps = String(step.reps)
  const sec = reps.match(/(\d+)\s*Sek/i)
  const min = reps.match(/(\d+)\s*(?:[-–]\s*\d+\s*)?Min/i)
  if (sec && sets <= 1) return `${lead} ${sec[1]} Sekunden.`
  if (min) return `${lead} ${min[1]} Minuten.`
  const target = draft ? (draft.w > 0 && weighted !== false ? `${draft.r} Wiederholungen mit ${kg(draft.w)}.` : `${draft.r} Wiederholungen.`) : ''
  return sets > 1 ? `${lead} ${sets} Sätze. ${target}`.trim() : `${lead} ${target}`.trim()
}

export function setText(setIndex, sets, draft) {
  const target = draft ? (draft.w > 0 ? ` ${draft.r} mal ${kg(draft.w)}.` : ` ${draft.r} Wiederholungen.`) : ''
  return setIndex === sets - 1 ? `Letzter Satz.${target}` : `Satz ${setIndex + 1} von ${sets}.${target}`
}
