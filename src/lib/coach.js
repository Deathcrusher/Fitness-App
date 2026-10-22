/*
 * Countdown-Ansage über die Sprachausgabe des Browsers (Web Speech API):
 * zählt die letzten Sekunden von Pausen und Zeitübungen laut mit.
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

/* ---------- Countdown ---------- */
export const COUNTDOWN_FROM = 5
const WORDS = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn']

/** Zahl als Wort – Sprachausgaben betonen Wörter natürlicher als Ziffern */
export function countWord(n) {
  return WORDS[n] ?? String(n)
}
