import {describe,it,expect} from 'vitest'
import {parseVideo} from './plansBase'
describe('Safe video links',()=>{
 it('accepts real HTTPS YouTube and direct media only',()=>{
 expect(parseVideo('https://youtu.be/a0wyBGg4aWw')?.kind).toBe('youtube')
 expect(parseVideo('https://example.org/video.mp4')?.kind).toBe('file')
 for(const u of ['javascript:alert(1)','data:text/html,hello','https://example.org/page','https://youtube.com.evil.test/watch?v=a0wyBGg4aWw','http://example.org/a.mp4'])expect(parseVideo(u)).toBeNull()
 })
})
