import { useEffect, useRef, useState } from 'react'

// Native touch listeners are deliberately non-passive only for movement/end.
// Before the hold threshold, a swipe is ordinary page scrolling.
export const HOLD_MS=350
export const MOVE_TOLERANCE=10
export function destinationFor(blocks, source, y, rectangles){
 const at=blocks.findIndex(b=>b.start===source)
 if(at<0||blocks[at].locked)return source
 let lo=at,hi=at
 while(lo>0&&!blocks[lo-1].locked)lo--
 while(hi<blocks.length-1&&!blocks[hi+1].locked)hi++
 let dest=at
 for(let i=at-1;i>=lo;i--){const r=rectangles[blocks[i].start];if(r&&y<r.top+r.height/2)dest=i;else break}
 for(let i=at+1;i<=hi;i++){const r=rectangles[blocks[i].start];if(r&&y>r.top+r.height/2)dest=i;else break}
 return blocks[dest].start
}
export function useExerciseDrag(blocks,enabled,onMove){
 const root=useRef(null),latest=useRef({blocks,onMove}),suppress=useRef(0)
 const [drag,setDrag]=useState(null)
 useEffect(()=>{latest.current={blocks,onMove}},[blocks,onMove])
 useEffect(()=>{
  const el=root.current
  if(!enabled||!el)return
  let gesture=null,hold=null,raf=null
  const clear=()=>{if(hold!==null)clearTimeout(hold);hold=null;if(raf!==null)cancelAnimationFrame(raf);raf=null}
  const rects=()=>Object.fromEntries([...el.querySelectorAll('[data-order-start]')].map(n=>[Number(n.dataset.orderStart),n.getBoundingClientRect()]))
  function refresh(){
   if(!gesture?.active)return
   const current=latest.current.blocks.find(b=>b.start===gesture.source)
   if(!current||current.locked){end(false);return}
   const rectangles=rects(),r=rectangles[gesture.source]
   if(!r){end(false);return}
   gesture.target=destinationFor(latest.current.blocks,gesture.source,gesture.y,rectangles)
   setDrag({source:gesture.source,target:gesture.target,top:gesture.y-gesture.offset,left:r.left,width:r.width,height:r.height})
  }
  function scrollFrame(){
   if(!gesture?.active)return
   const h=window.innerHeight,y=gesture.y
   const delta=y<95?-Math.ceil(Math.min(18,(95-y)/5)):y>h-115?Math.ceil(Math.min(18,(y-h+115)/5)):0
   if(delta){window.scrollBy(0,delta);refresh()}
   raf=requestAnimationFrame(scrollFrame)
  }
  function begin(target,x,y,kind,id){
   if(gesture)return
   const node=target.closest?.('[data-order-start]')
   if(!node||!el.contains(node)||target.closest?.('.stepInfo'))return
   const source=Number(node.dataset.orderStart),block=latest.current.blocks.find(b=>b.start===source)
   if(!block||block.locked)return
   gesture={source,target:source,x,y,initialX:x,initialY:y,kind,id,active:false,offset:y-node.getBoundingClientRect().top}
   hold=setTimeout(()=>{
    if(!gesture)return
    gesture.active=true
    suppress.current=Date.now()+1000
    try{navigator.vibrate?.(15)}catch{/* optional haptic */}
    refresh()
    raf=requestAnimationFrame(scrollFrame)
   },HOLD_MS)
  }
  function move(x,y,e){
   if(!gesture)return
   if(!gesture.active){
    if(Math.hypot(x-gesture.initialX,y-gesture.initialY)>MOVE_TOLERANCE)end(false)
    return
   }
   if(e.cancelable)e.preventDefault()
   gesture.x=x;gesture.y=y;refresh()
  }
  function end(commit,e){
   if(!gesture)return
   const g=gesture;gesture=null;clear()
   if(g.active){
    if(e?.cancelable)e.preventDefault()
    suppress.current=Date.now()+550
    setDrag(null)
    if(commit&&g.source!==g.target)latest.current.onMove?.(g.source,{target:g.target})
   }
  }
  const ts=e=>{if(e.touches.length!==1){end(false);return}const t=e.touches[0];begin(e.target,t.clientX,t.clientY,'touch',t.identifier)}
  const tm=e=>{if(gesture?.kind!=='touch')return;if(e.touches.length!==1){end(false,e);return}const t=[...e.touches].find(t=>t.identifier===gesture.id);if(t)move(t.clientX,t.clientY,e)}
  const te=e=>{if(gesture?.kind==='touch'&&[...e.changedTouches].some(t=>t.identifier===gesture.id))end(true,e)}
  const tc=e=>{if(gesture?.kind==='touch')end(false,e)}
  const md=e=>{if(e.button===0&&Date.now()>suppress.current)begin(e.target,e.clientX,e.clientY,'mouse',0)}
  const mm=e=>{if(gesture?.kind==='mouse')move(e.clientX,e.clientY,e)}
  const mu=e=>{if(gesture?.kind==='mouse')end(true,e)}
  const cancel=()=>end(false)
  const menu=e=>{if(gesture||Date.now()<suppress.current)e.preventDefault()}
  const click=e=>{if(Date.now()<suppress.current){e.preventDefault();e.stopPropagation()}}
  const select=e=>{if(gesture?.active)e.preventDefault()}
  const key=e=>{if(e.key==='Escape')end(false)}
  el.addEventListener('touchstart',ts,{passive:true})
  window.addEventListener('touchmove',tm,{passive:false})
  window.addEventListener('touchend',te,{passive:false})
  window.addEventListener('touchcancel',tc)
  el.addEventListener('mousedown',md)
  window.addEventListener('mousemove',mm)
  window.addEventListener('mouseup',mu)
  window.addEventListener('blur',cancel)
  window.addEventListener('keydown',key)
  window.addEventListener('selectstart',select)
  el.addEventListener('contextmenu',menu)
  el.addEventListener('click',click,true)
  return ()=>{
   clear();gesture=null
   el.removeEventListener('touchstart',ts);window.removeEventListener('touchmove',tm);window.removeEventListener('touchend',te);window.removeEventListener('touchcancel',tc)
   el.removeEventListener('mousedown',md);window.removeEventListener('mousemove',mm);window.removeEventListener('mouseup',mu)
   window.removeEventListener('blur',cancel);window.removeEventListener('keydown',key);window.removeEventListener('selectstart',select)
   el.removeEventListener('contextmenu',menu);el.removeEventListener('click',click,true)
  }
 },[enabled])
 return {root,drag:enabled?drag:null}
}
