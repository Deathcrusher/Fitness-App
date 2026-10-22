/** Nächster fälliger Trainingstag: der Tag nach dem zuletzt abgeschlossenen */
export function nextDueDay(history, programKey, dayCount) {
  if (!dayCount) return 0
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i]
    if (entry.programId === programKey && Number.isInteger(entry.dayIndex)) {
      return (entry.dayIndex + 1) % dayCount
    }
  }
  return 0
}
