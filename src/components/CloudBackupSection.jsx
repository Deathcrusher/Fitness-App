import React,{useEffect,useState} from 'react'
import {CloudUpload,LogOut} from 'lucide-react'
import {cloudSignOut,currentCloudUser,initialCloudBackup,cloudStatus,syncFitflowNow} from '../lib/cloudBackup'
export default function CloudBackupSection(){
 const user=currentCloudUser()
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[failure,setFailure]=useState(false),[syncState,setSyncState]=useState(cloudStatus)
 useEffect(()=>{const onStatus=e=>setSyncState(e.detail);window.addEventListener('fitflow-cloud-status',onStatus);return()=>window.removeEventListener('fitflow-cloud-status',onStatus)},[])
 async function run(action){
  setBusy(true);setMessage('');setFailure(false)
  try{
   if(action==='logout'){await cloudSignOut();return}
   if(action==='sync'){await syncFitflowNow();setMessage('Cloud-Sicherung überprüft.')}
   else{const result=await initialCloudBackup();setMessage(result.saved?'Erst-Backup gespeichert.':'Erst-Backup vorhanden.')}
  }catch{setFailure(true);setMessage('Cloud-Aktion fehlgeschlagen. Lokale Daten bleiben erhalten.')}
  finally{setBusy(false)}
 }
 return <section className="setSection"><h4>Privater Zugang & Cloud</h4><p className="setHint">Angemeldet: <strong>{user?.email}</strong></p><p className="setHint">Daten werden lokal und in deiner privaten Cloud gespeichert.</p>{syncState&&<p className={syncState.status==='error'?'setError':'setHint'} role="status">Cloud: {syncState.message}</p>}<div className="setActions"><button className="primaryAction" disabled={busy} onClick={()=>run('sync')}><CloudUpload size={17}/> Synchronisieren</button><button className="ghostBtn" disabled={busy} onClick={()=>run('backup')}>Erst-Backup prüfen</button><button className="ghostBtn" disabled={busy} onClick={()=>run('logout')}><LogOut size={17}/> Abmelden</button></div>{message&&<p role="status" className={failure?'setError':'setHint'}>{message}</p>}</section>
}
