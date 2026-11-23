import React from 'react'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ExerciseFigure, { FigureFrame } from './ExerciseFigure'

describe('Motion Studio', () => {
  it('zeigt in der großen Übungsanimation Bewegungsphase, Fokus und Zyklus-Fortschritt', () => {
    const html = renderToStaticMarkup(<FigureFrame moveKey="calfRaise" time={0.5} label="Wadenheben" />)
    expect(html).toContain('MOVEMENT / STUDIO')
    expect(html).toContain('WADEN')
    expect(html).toContain('BEWEGUNGSABLAUF')
    expect(html).toContain('Fortschritt des Animationszyklus')
    expect(html).toContain('ffMotionGhost')
    expect(html).toContain('ffFigJoints')
  })

  it('hat bei Miniaturen kein überladendes Display', () => {
    const html = renderToStaticMarkup(<FigureFrame moveKey="squat" time={0} showCue={false} />)
    expect(html).toContain('ffMotionThumb')
    expect(html).not.toContain('MOVEMENT / STUDIO')
    expect(html).not.toContain('ffMotionBottom')
    expect(html).not.toContain('ffMotionGhost')
  })

  it('bietet zugängliche Steuerung für Pause, Geschwindigkeit und Neustart', () => {
    const html = renderToStaticMarkup(<ExerciseFigure step={{ name: 'Wadenheben stehend' }} label="Wadenheben" />)
    expect(html).toContain('Animation pausieren')
    expect(html).toContain('Animationstempo ändern')
    expect(html).toContain('Animationszyklus zurücksetzen')
  })

  it('kennzeichnet andere Muskelregionen passend zur Übung', () => {
    expect(renderToStaticMarkup(<FigureFrame moveKey="romanianDeadlift" time={0.8} />)).toContain('BEINRÜCKSEITE')
    expect(renderToStaticMarkup(<FigureFrame moveKey="press" time={0.8} />)).toContain('SCHULTERN')
  })
})
