import { describe, expect, it } from 'vitest'
import { buildIcs, firstOccurrence } from './reminders'

const monMorning = new Date('2026-11-02T09:00:00')

describe('firstOccurrence', () => {
  it('heute, wenn die Uhrzeit noch kommt', () => expect(firstOccurrence(['MO'], '18:00', monMorning).getDate()).toBe(2))
  it('nächster gewählter Tag, wenn heute vorbei', () => {
    expect(firstOccurrence(['MO', 'WE'], '08:00', monMorning).getDate()).toBe(4)
  })
  it('eine Woche später, wenn nur heute gewählt und vorbei', () => expect(firstOccurrence(['MO'], '08:00', monMorning).getDate()).toBe(9))
})

describe('buildIcs', () => {
  const ics = buildIcs({ days: ['MO', 'WE', 'FR'], time: '18:30', minutes: 45, alarm: 10, name: 'René', url: 'https://x.test/', now: monMorning })
  it('wöchentlich an den gewählten Tagen', () => expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR'))
  it('Start und Ende in lokaler Zeit', () => {
    expect(ics).toContain('DTSTART:20261102T183000')
    expect(ics).toContain('DTEND:20261102T191500')
  })
  it('mit Alarm vorher', () => expect(ics).toContain('TRIGGER:-PT10M'))
  it('Zeilenenden nach Standard', () => expect(ics.split('\r\n')[0]).toBe('BEGIN:VCALENDAR'))
  it('ohne Tage keine Datei', () => expect(buildIcs({ days: [], time: '18:00' })).toBeNull())
})
