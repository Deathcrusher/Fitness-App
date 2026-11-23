import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { repairMondayPlankSets } from './planFixes'

describe('repairMondayPlankSets', () => {
  let values
  beforeEach(() => {
    values = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, String(value)),
    })
  })
  afterEach(() => vi.unstubAllGlobals())

  it('setzt nur den fälschlichen Montag-Plank auf 3 Sätze zurück', () => {
    values.set('fitflow-sets-v1', JSON.stringify({
      'rene:0:Plank': 1,
      'rene:1:Liegestütze': 3,
      'rene:2:Ausfallschritte': 2,
    }))
    expect(repairMondayPlankSets()).toBe(true)
    expect(JSON.parse(values.get('fitflow-sets-v1'))).toMatchObject({
      'rene:0:Plank': 3,
      'rene:1:Liegestütze': 3,
      'rene:2:Ausfallschritte': 2,
    })
  })

  it('verändert spätere absichtliche Einstellungen nicht', () => {
    values.set('fitflow-sets-v1', JSON.stringify({ 'rene:0:Plank': 1 }))
    expect(repairMondayPlankSets()).toBe(true)
    values.set('fitflow-sets-v1', JSON.stringify({ 'rene:0:Plank': 1 }))
    expect(repairMondayPlankSets()).toBe(false)
    expect(JSON.parse(values.get('fitflow-sets-v1'))['rene:0:Plank']).toBe(1)
  })

  it('ändert korrekte und fehlende Overrides nicht', () => {
    values.set('fitflow-sets-v1', JSON.stringify({ 'rene:0:Plank': 3 }))
    expect(repairMondayPlankSets()).toBe(false)
    expect(values.get('ffcloud-plank-3sets-fixed-20261123')).toBe('1')
  })
})
