import React from 'react'

export default function BrandMark() {
  return (
    <svg className="brandMark" viewBox="0 0 64 64" width="28" height="28" aria-hidden="true">
      <rect width="64" height="64" rx="15" />
      <g transform="translate(0 -5) rotate(-24 32 32)">
        <rect x="18" y="29" width="28" height="6" rx="3" />
        <rect x="14.5" y="20" width="7" height="24" rx="3" />
        <rect x="9" y="24.5" width="5" height="15" rx="2.5" />
        <rect x="42.5" y="20" width="7" height="24" rx="3" />
        <rect x="50" y="24.5" width="5" height="15" rx="2.5" />
      </g>
      <path d="M14 51c6 0 8-5 13-5s7 5 12 5 7-5 11-5" />
    </svg>
  )
}
