import {describe,it,expect} from 'vitest'
import {energyPlan} from './energyPlan'
import {exerciseVideoFor,videoEmbedUrl,videoWatchUrl} from './exerciseVideos'
describe('Yoga video guides',()=>{
 it('covers all seven new yoga and core movements, including both sides',()=>{
 const steps=energyPlan().days.flatMap(d=>d.steps).filter(s=>['recovery','core'].includes(s.type))
 expect(new Set(steps.map(s=>exerciseVideoFor(s)?.id)).size).toBe(7)
 for(const s of steps){const v=exerciseVideoFor(s);expect(v).not.toBeNull();expect(v.id).toMatch(/^[\w-]{11}$/);expect(videoEmbedUrl(v)).toContain('youtube-nocookie.com/embed/');expect(videoWatchUrl(v)).toContain(v.id)}
 })
 it('does not replace other animations or existing programs',()=>{
 expect(exerciseVideoFor({move:'catCow'})).toBeNull()
 expect(exerciseVideoFor({gentle:true,move:'hulaHoop'})).toBeNull()
 })
})
