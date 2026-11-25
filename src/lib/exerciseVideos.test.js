import {describe,it,expect} from 'vitest'
import {energyPlan} from './energyPlan'
import {exerciseVideoFor,videoEmbedUrl,videoWatchUrl,prefersVideo,defaultMediaMode} from './exerciseVideos'
describe('Yoga video guides',()=>{
 it('covers all seven new yoga and core movements, including both sides',()=>{
 const steps=energyPlan().days.flatMap(d=>d.steps).filter(s=>['recovery','core'].includes(s.type))
 expect(new Set(steps.map(s=>exerciseVideoFor(s)?.id)).size).toBe(7)
 for(const s of steps){const v=exerciseVideoFor(s);expect(v).not.toBeNull();expect(v.id).toMatch(/^[\w-]{11}$/);expect(videoEmbedUrl(v)).toContain('youtube-nocookie.com/embed/');expect(videoWatchUrl(v)).toContain(v.id)}
 })
 it('keeps yoga scoped and uses animation as default for other exercises',()=>{
 expect(exerciseVideoFor({move:'catCow'})).toBeNull()
 expect(exerciseVideoFor({gentle:true,move:'hulaHoop'})).not.toBeNull()
 expect(defaultMediaMode({gentle:true,move:'hulaHoop'})).toBe('anim')
 })
})

describe('Optional technique videos',()=>{
 it('provides videos for both people but keeps animation default',()=>{
 for(const name of ['Rumänisches Kreuzheben mit Kurzhanteln','Einarmiges Rudern','Rudern','Wrist Curls','Reverse Curls','Wadenheben stehend','Bizeps-Curls','Hammer Curls','Brustdrücken am Boden','Schulterdrücken','Seitheben','Kniebeugen','Glute Bridge','Wandliegestütze','Hula Hoop']){
 const s={name};expect(exerciseVideoFor(s)?.id).toMatch(/^[\w-]{11}$/);expect(defaultMediaMode(s)).toBe('anim');expect(prefersVideo(s)).toBe(false)
 }
 expect(defaultMediaMode({gentle:true,move:'catCow'})).toBe('video')
 expect(exerciseVideoFor({name:'Trizeps-Brustdrücken am Boden (liegend)'})).toBeNull()
 expect(exerciseVideoFor({name:'Unbekannte Übung'})).toBeNull()
 })
})
