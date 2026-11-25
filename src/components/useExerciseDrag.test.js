import {describe,it,expect} from 'vitest'
import {destinationFor} from './useExerciseDrag'
describe('Long press drop destination',()=>{
 const blocks=[{start:0,locked:true},{start:1,locked:false},{start:2,locked:false},{start:4,locked:false},{start:5,locked:true},{start:6,locked:false}]
 const rects={0:{top:0,height:60},1:{top:60,height:60},2:{top:120,height:120},4:{top:240,height:60},5:{top:300,height:60},6:{top:360,height:60}}
 it('uses row centers and preserves locked barriers',()=>{
 expect(destinationFor(blocks,1,310,rects)).toBe(4)
 expect(destinationFor(blocks,4,65,rects)).toBe(1)
 expect(destinationFor(blocks,1,10,rects)).toBe(1)
 expect(destinationFor(blocks,6,10,rects)).toBe(6)
 expect(destinationFor(blocks,0,400,rects)).toBe(0)
 })
})
