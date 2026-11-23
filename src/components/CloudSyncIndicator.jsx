import React, { useEffect, useState } from 'react'
import { Cloud, CloudOff, CloudUpload } from 'lucide-react'
import { cloudStatus, currentCloudUser } from '../lib/cloudBackup'

export default function CloudSyncIndicator({ onOpen }) {
  const [status, setStatus] = useState(cloudStatus)
  const [user, setUser] = useState(currentCloudUser)

  useEffect(() => {
    const updateStatus = (event) => setStatus(event?.detail || cloudStatus())
    const updateUser = () => setUser(currentCloudUser())
    window.addEventListener('fitflow-cloud-status', updateStatus)
    window.addEventListener('fitflow-cloud-auth', updateUser)
    return () => {
      window.removeEventListener('fitflow-cloud-status', updateStatus)
      window.removeEventListener('fitflow-cloud-auth', updateUser)
    }
  }, [])

  const level = !user ? 'local' : status?.status === 'error' ? 'warning' : status?.status === 'saved' ? 'saved' : 'pending'
  const text = level === 'local' ? 'Nur lokal' : level === 'warning' ? 'Sync prüfen' : level === 'saved' ? 'Cloud-Backup' : 'Cloud aktiv'
  const Icon = level === 'warning' || level === 'local' ? CloudOff : level === 'saved' ? Cloud : CloudUpload
  const date = status?.at ? new Date(status.at).toLocaleString('de-AT') : null
  const label = level === 'saved' && date ? `Letzter bestätigter Cloud-Upload: ${date}` : text
  return (
    <button type="button" className={`ffSyncIndicator ${level}`} onClick={onOpen} title={label} aria-label={`${label} – Einstellungen öffnen`}>
      <Icon size={15} />
      <span>{text}</span>
      <i aria-hidden="true" />
    </button>
  )
}
