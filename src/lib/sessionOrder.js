import { groupOf } from './superset'

// Indices always reference the immutable plan. A signature prevents applying
// an old order to a different program/day or a changed exercise definition.
export const identityOrder = steps => steps.map((_,i)=>i)
export const orderSignature = steps => JSON.stringify(steps.map(s=>[s.name,s.type,s.reps,s.durationSec??null,Boolean(s.superset)]))
export function orderedIndices(steps,stored) {
 const ids=stored?.indices
 if(stored?.signature!==orderSignature(steps)||!Array.isArray(ids)||ids.length!==steps.length||new Set(ids).size!==steps.length||ids.some(i=>!Number.isInteger(i)||i<0||i>=steps.length))return identityOrder(steps)
 // A persisted order may never split or invert a superset.
 for(let i=0;i<steps.length;i++)if(steps[i].superset&&i+1<steps.length&&ids.indexOf(i+1)!==ids.indexOf(i)+1)return identityOrder(steps)
 return ids
}
export function orderBlocks(steps, current, done={}, log={}) {
 // Freeze the prefix through the furthest already visited exercise, including
 // the complete active superset. That keeps every index-keyed set and draft intact.
 const touched=[...Object.keys(done).filter(k=>done[k]),...Object.keys(log).filter(k=>Array.isArray(log[k])&&log[k].some(Boolean))].map(Number).filter(i=>Number.isInteger(i)&&i>=0&&i<steps.length)
 let end=Math.max(current,...touched)
 end=groupOf(steps,end)?.[1]??end
 const blocks=[]
 for(let i=0;i<steps.length;){
   const last=groupOf(steps,i)?.[1]??i
   const locked=i<=end||steps.slice(i,last+1).some(s=>s.type==='warmup')
   blocks.push({start:i,end:last,locked})
   i=last+1
 }
 return blocks
}
export function moveSessionBlock(steps,indices,current,done,log,index,direction){
 const blocks=orderBlocks(steps,current,done,log)
 const at=blocks.findIndex(b=>index>=b.start&&index<=b.end)
 if(at<0||blocks[at].locked)return null
 let dest=at
 if(direction==='next'){
   while(dest>0&&!blocks[dest-1].locked)dest--
 }else if(direction===-1||direction===1){dest=at+direction}
 else if(direction&&Number.isInteger(direction.target)){
   dest=blocks.findIndex(b=>direction.target>=b.start&&direction.target<=b.end)
 }else return null
 if(dest===at||dest<0||dest>=blocks.length||blocks.slice(Math.min(at,dest),Math.max(at,dest)+1).some(b=>b.locked))return null
 const [moved]=blocks.splice(at,1);blocks.splice(dest,0,moved)
 return blocks.flatMap(b=>indices.slice(b.start,b.end+1))
}
