import {describe,it,expect} from 'vitest'
import {identityOrder,orderSignature,orderedIndices,orderBlocks,moveSessionBlock} from './sessionOrder'
const steps=[{name:'Warmup',type:'warmup'},{name:'A'},{name:'B',superset:true},{name:'C'},{name:'D'},{name:'E'}]
describe('Session-specific exercise ordering',()=>{
 it('moves only unvisited exercises without shifting current or existing logs',()=>{
 const ids=identityOrder(steps),done={0:true},log={1:[{w:5,r:8}]}
 expect(moveSessionBlock(steps,ids,1,done,log,4,'next')).toEqual([0,1,4,2,3,5])
 expect(moveSessionBlock(steps,ids,1,done,log,1,1)).toBeNull()
 expect(moveSessionBlock(steps,ids,1,done,log,2,-1)).toBeNull()
 expect(moveSessionBlock(steps,ids,1,done,log,5,-1)).toEqual([0,1,2,3,5,4])
 })
 it('moves complete supersets and freezes active groups and already recorded positions',()=>{
 const ids=identityOrder(steps)
 expect(moveSessionBlock(steps,ids,1,{}, {},3,1)).toEqual([0,1,4,2,3,5])
 expect(moveSessionBlock(steps,ids,2,{}, {},3,1)).toBeNull()
 expect(moveSessionBlock(steps,ids,1,{4:true},{},2,1)).toBeNull()
 expect(orderBlocks(steps,2).find(b=>b.start===2)).toMatchObject({end:3,locked:true})
 })
 it('restores only compatible valid permutations, never mutates the original plan',()=>{
 const signature=orderSignature(steps),indices=[0,1,4,2,3,5]
 expect(orderedIndices(steps,{signature,indices})).toEqual(indices)
 expect(orderedIndices(steps,{signature,indices:[0,1,2,4,3,5]})).toEqual(identityOrder(steps))
 expect(orderedIndices(steps,{signature:'old',indices})).toEqual(identityOrder(steps))
 expect(steps.map(s=>s.name)).toEqual(['Warmup','A','B','C','D','E'])
 })
})

 it('drops a block directly across several other exercises without mutating plan order',()=>{
 const ids=identityOrder(steps)
 expect(moveSessionBlock(steps,ids,1,{}, {},5,{target:2})).toEqual([0,1,5,2,3,4])
 expect(moveSessionBlock(steps,ids,1,{}, {},2,{target:5})).toEqual([0,1,4,5,2,3])
 expect(moveSessionBlock(steps,ids,1,{}, {},5,{target:0})).toBeNull()
 const changed=[...steps,{name:'Warmup 2',type:'warmup'},{name:'F'}]
 expect(moveSessionBlock(changed,identityOrder(changed),1,{}, {},7,{target:4})).toBeNull()
 expect(orderedIndices(steps,null)).toEqual(ids)
 })
