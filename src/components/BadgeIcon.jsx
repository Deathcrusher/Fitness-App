import React from 'react'
import { Award, CalendarCheck, Crown, Dumbbell, Flag, Flame, Medal, Moon, Mountain, Sunrise, Target, Trophy, Weight } from 'lucide-react'

const ICONS = {
  first: Flag, ten: Dumbbell, fifty: Award, hundred: Crown, goal: Target, streak4: Flame, streak12: CalendarCheck,
  record: Medal, records10: Trophy, ton: Weight, tons10: Mountain, early: Sunrise, late: Moon,
}

export default function BadgeIcon({ id, locked = false, size = 20 }) {
  const Icon = ICONS[id] || Award
  return <span className={`badgeIcon${locked ? ' locked' : ''}`}><Icon size={size} /></span>
}
