import React,{useEffect,useState} from 'react'
import {LockKeyhole,ArrowRight,Eye,EyeOff,RefreshCw} from 'lucide-react'
import App from '../App'
import ErrorBoundary from './ErrorBoundary'
import {cloudSignIn,cloudSignOut,currentCloudUser,verifyCloudAccess,bootstrapCloudSync,startAutomaticCloudSync} from '../lib/cloudBackup'
import {applyPlanFixes,repairMondayPlankSets} from '../lib/planFixes'
export default function AuthGate(){
 const [state,setState]=useState('checking')
 const [email,setEmail]=useState('')
 const [password,setPassword]=useState('')
 const [show,setShow]=useState(false)
 const [error,setError]=useState('')
 const [busy,setBusy]=useState(false)
 async function unlock(){
  await verifyCloudAccess()
  applyPlanFixes()
  await bootstrapCloudSync()
  repairMondayPlankSets()
  setState('ready')
 }
 useEffect(()=>{
  let alive=true
  async function start(){
   if(!currentCloudUser()){if(alive)setState('login');return}
   try{
    await verifyCloudAccess()
    if(!alive)return
    applyPlanFixes();await bootstrapCloudSync();repairMondayPlankSets()
    if(alive&&currentCloudUser())setState('ready')
   }catch(e){if(alive){setError(e.status===401||e.status===403?'Bitte melde dich erneut an.':'Zugang konnte nicht geprüft werden. Internetverbindung prüfen.');setState('login')}}
  }
  start()
  return()=>{alive=false}
 },[])
 useEffect(()=>{
  if(state!=='ready')return
  const stop=startAutomaticCloudSync()
  const auth=()=>{if(!currentCloudUser()){setState('login');setPassword('');setError('')}}
  const storage=e=>{if(e.key==='ffcloud-auth-v1'||e.key===null)auth()}
  let checking=false,alive=true
  const validate=async()=>{
   if(checking||!navigator.onLine||document.visibilityState==='hidden')return
   checking=true
   try{await verifyCloudAccess()}catch(e){if(alive&&(e.status===401||e.status===403)){await cloudSignOut();if(alive)setState('login')}}
   finally{checking=false}
  }
  window.addEventListener('fitflow-cloud-auth',auth);window.addEventListener('storage',storage)
  document.addEventListener('visibilitychange',validate)
  const timer=setInterval(validate,60000)
  return()=>{alive=false;stop();clearInterval(timer);window.removeEventListener('fitflow-cloud-auth',auth);window.removeEventListener('storage',storage);document.removeEventListener('visibilitychange',validate)}
 },[state])
 async function submit(e){
  e.preventDefault();if(busy)return
  setBusy(true);setError('')
  try{await cloudSignIn(email.trim(),password);setPassword('');await unlock()}
  catch(e){setError(e.status===403?'Zugang nicht freigegeben.':e.status===401||e.status===400?'E-Mail oder Passwort falsch.': 'Anmeldung fehlgeschlagen. Verbindung oder ursprüngliches Cloud-Konto prüfen.')}
  finally{setBusy(false)}
 }
 async function retry(){setBusy(true);setError('');try{await unlock()}catch{setError('Zugang nicht verfügbar. Bitte erneut anmelden.')}finally{setBusy(false)}}
 if(state==='ready')return <ErrorBoundary version={__APP_VERSION__}><App/></ErrorBoundary>
 return <main className="ffAuthScreen"><section className="ffAuthBrand"><img src="/icon-192-ff.png" alt="" width="68" height="68"/><div><strong>FitFlow<span>.</span></strong><small>PRIVATE TRAINING STUDIO</small></div></section>
 <section className="ffAuthCard"><span className="ffAuthLock"><LockKeyhole size={22}/></span><h1>{state==='checking'?'Willkommen zurück.':'Dein Training.\nDein Zugang.'}</h1><p>{state==='checking'?'Dein privater Zugang wird überprüft.':'Melde dich mit deinem bestehenden Cloud-Konto an.'}</p>
 {state==='checking'?<div role="status" className="ffAuthChecking">Zugang wird geprüft …</div>:<form onSubmit={submit}><label>E-Mail<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@beispiel.at"/></label><label>Passwort<div className="ffAuthPassword"><input type={show?'text':'password'} autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Dein Passwort"/><button type="button" aria-label={show?'Passwort verbergen':'Passwort anzeigen'} onClick={()=>setShow(v=>!v)}>{show?<EyeOff size={20}/>:<Eye size={20}/>}</button></div></label>
 {error&&<p className="ffAuthError" role="alert">{error}</p>}
 <button className="ffAuthSubmit" disabled={busy} type="submit">{busy?'Anmeldung …':'Anmelden'}<ArrowRight size={21}/></button>
 {currentCloudUser()&&<button type="button" className="ffAuthRetry" disabled={busy} onClick={retry}><RefreshCw size={16}/> Bestehende Sitzung erneut prüfen</button>}</form>}
 <footer><LockKeyhole size={14}/> Nur für freigegebene Konten</footer></section>
 </main>
}
