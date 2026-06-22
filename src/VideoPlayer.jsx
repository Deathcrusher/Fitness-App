import React from 'react'
import { X } from 'lucide-react'
import { parseVideo } from './plans'

export default function VideoPlayer({ url, onClose }) {
  const parsed = parseVideo(url)
  if (!parsed) return null
  return (
    <div className="videoWrap">
      <button className="videoClose" onClick={onClose} aria-label="Video schließen">
        <X size={20} />
      </button>
      <div className="videoFrame">
        {parsed.kind === 'youtube' && (
          <iframe
            src={parsed.embed}
            title="Übungsvideo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
        {parsed.kind === 'file' && (
          <video src={parsed.src} controls playsInline />
        )}
        {parsed.kind === 'iframe' && (
          <iframe src={parsed.src} title="Übungsvideo" allowFullScreen />
        )}
      </div>
    </div>
  )
}
