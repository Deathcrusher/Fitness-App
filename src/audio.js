let audioCtx = null

export function ensureAudio() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    if (audioCtx.state === 'suspended') audioCtx.resume()
  } catch {
    /* noop */
  }
}

export function tone(freq, dur, when = 0, type = 'sine', peak = 0.25) {
  ensureAudio()
  if (!audioCtx) return
  try {
    const start = audioCtx.currentTime + when
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = type
    osc.frequency.value = freq
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
    osc.start(start)
    osc.stop(start + dur)
  } catch {
    /* noop */
  }
}

export function melody(notes, type = 'triangle', peak = 0.4) {
  notes.forEach(([freq, when, dur]) => tone(freq, dur, when, type, peak))
}

export function tick() {
  tone(1100, 0.07, 0, 'sine', 0.22)
}

export function vibrate(pattern) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* noop */
  }
}

export function signal(kind) {
  ensureAudio()
  if (kind === 'work-done') {
    vibrate([180])
    melody([
      [659, 0.0, 0.3],
      [784, 0.16, 0.3],
      [1047, 0.32, 0.3],
      [1319, 0.5, 0.55],
    ])
  } else if (kind === 'rest-end') {
    vibrate([120, 60, 120])
    melody([
      [523, 0.0, 0.3],
      [659, 0.16, 0.3],
      [784, 0.32, 0.3],
      [1047, 0.5, 0.55],
    ])
  } else if (kind === 'done') {
    vibrate([140, 80, 140, 80, 220])
    melody([
      [784, 0.0, 0.36],
      [880, 0.2, 0.36],
      [1047, 0.4, 0.36],
      [1175, 0.62, 0.36],
      [1319, 0.82, 0.36],
      [1568, 1.04, 0.52],
      [1319, 1.42, 0.36],
      [1568, 1.62, 0.36],
      [1760, 1.84, 0.52],
      [1568, 2.2, 0.36],
      [2093, 2.42, 1.1],
    ], 'triangle', 0.45)
  }
}
