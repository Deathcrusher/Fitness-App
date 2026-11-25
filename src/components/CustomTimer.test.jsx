// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe,it,expect,vi,beforeEach,afterEach } from 'vitest'
import CustomTimer from './CustomTimer'
vi.mock('../lib/audio',()=>({ensureAudio:vi.fn(),tick:vi.fn(),signal:vi.fn()}))
describe('Free countdown',()=>{
 let el,root
 beforeEach(()=>{
  vi.useFakeTimers();localStorage.clear()
  globalThis.IS_REACT_ACT_ENVIRONMENT=true
  el=document.createElement('div');document.body.append(el);root=createRoot(el)
  act(()=>root.render(<CustomTimer/>))
 })
 afterEach(()=>{act(()=>root.unmount());el.remove();vi.useRealTimers();delete globalThis.IS_REACT_ACT_ENVIRONMENT})
 const button=label=>[...el.querySelectorAll('button')].find(b=>b.textContent.trim()===label)
 const click=label=>act(()=>button(label).click())
 const time=()=>el.querySelector('.timerDialFace strong').textContent
 it('pauses at the remaining time, resumes and stays at zero when finished',()=>{
  click('1 Min.');expect(time()).toMatch(/0?1:00/)
  click('Starten');act(()=>vi.advanceTimersByTime(12000))
  expect(time()).toMatch(/0?0:48/)
  click('Pause');act(()=>vi.advanceTimersByTime(10000))
  expect(time()).toMatch(/0?0:48/)
  click('Weiterlaufen');act(()=>vi.advanceTimersByTime(48000))
  expect(time()).toMatch(/0?0:00/)
  expect(button('Starten')).toBeTruthy()
 })
})
