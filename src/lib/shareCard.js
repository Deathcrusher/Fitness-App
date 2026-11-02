/*
 * Teilbares Bild nach dem Training (1080 × 1350, Instagram-Hochformat).
 * Wird im Browser per Canvas gezeichnet und über das Teilen-Menü verschickt.
 */
import { humanDuration, fmtVolume } from './storage'
import { MUSCLES } from './muscles'

const W = 1080
const H = 1350
const FONT = '"Archivo Variable", "Archivo", system-ui, sans-serif'

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function fitText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let t = text
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1)
  return `${t}…`
}

/** Zeichnet die Karte und gibt einen PNG-Blob zurück */
export async function renderShareCard({ name, dayTitle, dayFocus, durationMs, volume, sets, completed, total, prs = [], muscles = {}, weekCount, goal, accent = '#2f7667', date = new Date() }) {
  try { await document.fonts?.ready } catch { /* egal */ }
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Hintergrund
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, accent)
  bg.addColorStop(1, '#0f1513')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  ctx.globalAlpha = 0.08
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(W - 120, 160, 360, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(80, H - 80, 260, 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = 1

  const pad = 84
  ctx.fillStyle = '#fff'
  ctx.textBaseline = 'alphabetic'

  // Kopf
  ctx.font = `700 40px ${FONT}`
  ctx.fillText('FitFlow', pad, 128)
  ctx.font = `500 34px ${FONT}`
  ctx.globalAlpha = 0.75
  const dateText = date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
  ctx.textAlign = 'right'
  ctx.fillText(dateText, W - pad, 128)
  ctx.textAlign = 'left'
  ctx.globalAlpha = 1

  ctx.font = `800 104px ${FONT}`
  ctx.fillText('Training', pad, 300)
  ctx.fillText('geschafft!', pad, 410)
  ctx.font = `500 42px ${FONT}`
  ctx.globalAlpha = 0.85
  ctx.fillText(fitText(ctx, [name, dayTitle, dayFocus].filter(Boolean).join(' · '), W - pad * 2), pad, 480)
  ctx.globalAlpha = 1

  // Kennzahlen
  const stats = [
    ['Dauer', humanDuration(durationMs)],
    volume > 0 ? ['Volumen', fmtVolume(volume)] : ['Übungen', `${completed}/${total}`],
    ['Sätze', String(sets)],
    ['Woche', `${weekCount}/${goal}`],
  ]
  const cw = (W - pad * 2 - 30) / 2
  const ch = 170
  stats.forEach(([label, value], i) => {
    const x = pad + (i % 2) * (cw + 30)
    const y = 560 + Math.floor(i / 2) * (ch + 30)
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    roundRect(ctx, x, y, cw, ch, 36)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `800 70px ${FONT}`
    ctx.fillText(fitText(ctx, value, cw - 70), x + 36, y + 96)
    ctx.font = `500 32px ${FONT}`
    ctx.globalAlpha = 0.75
    ctx.fillText(label, x + 36, y + 142)
    ctx.globalAlpha = 1
  })

  // Rekorde oder Muskeln
  let y = 560 + 2 * (ch + 30) + 40
  if (prs.length) {
    ctx.font = `700 38px ${FONT}`
    ctx.fillText(prs.length === 1 ? 'Neuer Rekord' : `${prs.length} neue Rekorde`, pad, y + 20)
    y += 64
    ctx.font = `500 34px ${FONT}`
    for (const p of prs.slice(0, 3)) {
      ctx.globalAlpha = 0.9
      ctx.fillText(fitText(ctx, p.name, 560), pad, y + 20)
      ctx.globalAlpha = 1
      ctx.textAlign = 'right'
      ctx.font = `700 34px ${FONT}`
      ctx.fillText(p.text, W - pad, y + 20)
      ctx.textAlign = 'left'
      ctx.font = `500 34px ${FONT}`
      y += 56
    }
  } else {
    const top = Object.entries(muscles).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([m]) => MUSCLES[m]).filter(Boolean)
    if (top.length) {
      ctx.font = `700 38px ${FONT}`
      ctx.fillText('Heute trainiert', pad, y + 20)
      y += 52
      ctx.font = `600 32px ${FONT}`
      let x = pad
      for (const label of top) {
        const w = ctx.measureText(label).width + 48
        if (x + w > W - pad) { x = pad; y += 72 }
        ctx.fillStyle = 'rgba(255,255,255,0.16)'
        roundRect(ctx, x, y, w, 58, 29)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.fillText(label, x + 24, y + 40)
        x += w + 14
      }
    }
  }

  ctx.font = `500 28px ${FONT}`
  ctx.globalAlpha = 0.6
  ctx.textAlign = 'center'
  ctx.fillText('Mit FitFlow trainiert', W / 2, H - 56)

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

/** Teilen per Web Share API, sonst Download. Gibt 'shared' | 'downloaded' | 'cancelled' zurück. */
export async function shareImage(blob, filename, text) {
  const file = new File([blob], filename, { type: 'image/png' })
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text })
      return 'shared'
    }
  } catch (e) {
    if (e?.name === 'AbortError') return 'cancelled'
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
  return 'downloaded'
}
