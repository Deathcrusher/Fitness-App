import { describe, expect, it } from 'vitest'
import { mergeFitflowData, sameFitflowData } from './cloudMerge'

describe('FitFlow Cloud-Merge', () => {
  it('behält alte Einheiten und ergänzt spätere ohne doppelte Einträge', () => {
    const a = { 'fitflow-history-v1': JSON.stringify([{ key: '2026-11-20:rene:2', date: '2026-11-20', owner: 'rene' }]) }
    const b = { 'fitflow-history-v1': JSON.stringify([{ key: '2026-11-22:chat-arm-special-20261122:0', date: '2026-11-22', owner: 'rene' }]) }
    const merged = mergeFitflowData(a,b)
    const entries = JSON.parse(merged['fitflow-history-v1'])
    expect(entries).toHaveLength(2)
    expect(JSON.parse(mergeFitflowData(merged, b)['fitflow-history-v1'])).toHaveLength(2)
  })
  it('bewahrt separate Satzdaten aus beiden Geräten', () => {
    const a = {'fitflow-log-v1': JSON.stringify({ 'rene::Bizeps-Curls': [{date:'2026-11-20', at:'2026-11-20T12:00:00Z', sets:[{w:10,r:8}]}] })}
    const b = {'fitflow-log-v1': JSON.stringify({ 'rene::Bizeps-Curls': [{date:'2026-11-22', at:'2026-11-22T12:00:00Z', sets:[{w:0,r:8}]}] })}
    expect(JSON.parse(mergeFitflowData(a,b)['fitflow-log-v1'])['rene::Bizeps-Curls']).toHaveLength(2)
  })
  it('überschreibt keine bestehenden lokalen Einstellungen und übernimmt zusätzliche Pläne', () => {
    const a = {'fitflow-theme-v1':'dark','fitflow-custom-plans-v1':JSON.stringify({foo:{name:'meins'}})}
    const b = {'fitflow-theme-v1':'light','fitflow-custom-plans-v1':JSON.stringify({bar:{name:'Arme'}})}
    const x = mergeFitflowData(a,b)
    expect(x['fitflow-theme-v1']).toBe('dark')
    expect(JSON.parse(x['fitflow-custom-plans-v1'])).toMatchObject({foo:{name:'meins'},bar:{name:'Arme'}})
    expect(sameFitflowData(x,x)).toBe(true)
  })
  it('behält Körperwerte verschiedener Tage, ohne Daten zu löschen',()=>{
    const a={'fitflow-body-v1':JSON.stringify({rene:[{date:'2026-11-22',weight:77.8}]})}
    const b={'fitflow-body-v1':JSON.stringify({rene:[{date:'2026-11-11',weight:75}]})}
    expect(JSON.parse(mergeFitflowData(a,b)['fitflow-body-v1']).rene).toHaveLength(2)
  })
})
