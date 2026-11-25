// Numeric entry and countdown helpers shared by controls and regression tests.
export function parseStepper(raw,min,max,decimals=false){
 const s=String(raw).trim().replace(',','.')
 if(!s || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return null
 const n=Number(s)
 if(!Number.isFinite(n))return null
 const value=decimals?Math.round(n*2)/2:Math.round(n)
 return Math.max(min,Math.min(max,value))
}
export function secondsUntil(deadline,now=Date.now()){
 return Math.max(0,Math.ceil((deadline-now)/1000))
}
export function timerMinutes(value){
 const n=Number(value)
 return Number.isFinite(n)&&n>=1&&n<=180?Math.round(n):5
}
