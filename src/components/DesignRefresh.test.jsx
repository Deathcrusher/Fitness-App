import React from 'react'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ProgramPicker from './ProgramPicker'
import ExerciseTechnique from './ExerciseTechnique'

describe('FitFlow Studio UI', () => {
  it('zeigt den Grundplan und das optionale Armtraining mit navigierbaren Trainingstagen', () => {
    const plan = { builtin: true, name: 'René', title: 'Kraft & Ausdauer', days: [
      { title: 'Montag', focus: 'Ganzkörper A' },
      { title: 'Mittwoch', focus: 'Ganzkörper B' },
      { title: 'Freitag', focus: 'Ganzkörper C' },
    ]}
    const html = renderToStaticMarkup(<ProgramPicker
      plan={plan} person="rene" owner="rene"
      builtinEntries={ [['rene', { name: 'René' }], ['connie', { name: 'Connie' }]] }
      customEntries={ [['chat-arm-special-20261122', { name: 'Arme Spezial', owner: 'rene' }]] }
      dayIndex={0} dueDay={0}
      onPerson={() => {}} onNewProgram={() => {}} onDay={() => {}}
    />)
    expect(html).toContain('Grundtraining')
    expect(html).toContain('Arme Spezial')
    expect(html).toContain('Montag')
    expect(html).toContain('Freitag')
    expect(html).toContain('aria-current="page"')
  })

  it('zeigt beim Wadenheben verständliche Start-, Hoch- und Runter-Anleitung', () => {
    const html = renderToStaticMarkup(<ExerciseTechnique step={{ name: 'Wadenheben stehend' }} />)
    expect(html).toContain('keine Hanteln')
    expect(html).toContain('Fußsohlen am Boden')
    expect(html).toContain('Fersen langsam heben')
    expect(html).toContain('Fersen kontrolliert wieder absetzen')
  })

  it('zeigt keine fremde Technik-Anleitung bei anderen Übungen', () => {
    const html = renderToStaticMarkup(<ExerciseTechnique step={{ name: 'Liegestütze' }} />)
    expect(html).toBe('')
  })
})
