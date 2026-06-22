import React, { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Video,
} from 'lucide-react'
import { ACCENTS, EXERCISE_LIBRARY, TYPE_META, TYPE_KEYS, emptyStep, emptyDay } from './plans'

export default function Editor({ plan, onChange }) {
  const [dayIndex, setDayIndex] = useState(0)
  const [blockType, setBlockType] = useState('all')
  const day = plan.days[dayIndex] || plan.days[0]

  function patchProgram(patch) {
    onChange({ ...plan, ...patch })
  }
  function patchDay(di, patch) {
    onChange({
      ...plan,
      days: plan.days.map((d, i) => (i === di ? { ...d, ...patch } : d)),
    })
  }
  function patchStep(di, si, patch) {
    onChange({
      ...plan,
      days: plan.days.map((d, i) => {
        if (i !== di) return d
        return { ...d, steps: d.steps.map((s, j) => (j === si ? { ...s, ...patch } : s)) }
      }),
    })
  }
  function addStep(di, stepObj) {
    onChange({
      ...plan,
      days: plan.days.map((d, i) => (i === di ? { ...d, steps: [...d.steps, stepObj || emptyStep()] } : d)),
    })
  }
  function addBlock(block) {
    addStep(dayIndex, { type: block.type, name: block.name, detail: block.detail, reps: block.reps })
  }
  function removeStep(di, si) {
    onChange({
      ...plan,
      days: plan.days.map((d, i) => {
        if (i !== di) return d
        const steps = d.steps.filter((_, j) => j !== si)
        return { ...d, steps: steps.length ? steps : [emptyStep()] }
      }),
    })
  }
  function moveStep(di, si, dir) {
    onChange({
      ...plan,
      days: plan.days.map((d, i) => {
        if (i !== di) return d
        const steps = [...d.steps]
        const target = si + dir
        if (target < 0 || target >= steps.length) return d
        ;[steps[si], steps[target]] = [steps[target], steps[si]]
        return { ...d, steps }
      }),
    })
  }
  function addDay() {
    const next = emptyDay()
    onChange({ ...plan, days: [...plan.days, next] })
    setDayIndex(plan.days.length)
  }
  function removeDay(di) {
    if (plan.days.length <= 1) return
    const days = plan.days.filter((_, i) => i !== di)
    onChange({ ...plan, days })
    setDayIndex((idx) => Math.max(0, Math.min(idx, days.length - 1)))
  }

  const blocks = blockType === 'all' ? EXERCISE_LIBRARY : EXERCISE_LIBRARY.filter((b) => b.type === blockType)

  return (
    <div className="editor">
      <section className="editorSection">
        <h3>Programm</h3>
        <label className="field">
          <span>Name</span>
          <input value={plan.name} onChange={(e) => patchProgram({ name: e.target.value })} />
        </label>
        <label className="field">
          <span>Untertitel</span>
          <input value={plan.title} onChange={(e) => patchProgram({ title: e.target.value })} />
        </label>
        <label className="field">
          <span>Equipment</span>
          <input value={plan.equipment} onChange={(e) => patchProgram({ equipment: e.target.value })} />
        </label>
        <label className="field">
          <span>Farbe</span>
          <select value={plan.accent} onChange={(e) => patchProgram({ accent: e.target.value })}>
            {ACCENTS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
      </section>

      <section className="editorSection">
        <div className="editorRow">
          <h3>Trainingstage</h3>
          <button className="ghostBtn" onClick={addDay}><Plus size={16} /> Tag</button>
        </div>
        <div className="dayTabs">
          {plan.days.map((d, i) => (
            <button key={i} className={i === dayIndex ? 'active' : ''} onClick={() => setDayIndex(i)}>
              {d.title || `Tag ${i + 1}`}
            </button>
          ))}
        </div>
        {day && (
          <>
            <label className="field">
              <span>Titel</span>
              <input value={day.title} onChange={(e) => patchDay(dayIndex, { title: e.target.value })} />
            </label>
            <label className="field">
              <span>Fokus</span>
              <input value={day.focus} onChange={(e) => patchDay(dayIndex, { focus: e.target.value })} />
            </label>
            <label className="field">
              <span>Beschreibung</span>
              <input value={day.tone} onChange={(e) => patchDay(dayIndex, { tone: e.target.value })} />
            </label>
            {plan.days.length > 1 && (
              <button className="dangerGhost" onClick={() => removeDay(dayIndex)}>
                <Trash2 size={16} /> Tag löschen
              </button>
            )}
          </>
        )}
      </section>

      <section className="editorSection">
        <h3>Bausteine · Übung hinzufügen</h3>
        <div className="blockFilter">
          <button className={blockType === 'all' ? 'active' : ''} onClick={() => setBlockType('all')}>Alle</button>
          {TYPE_KEYS.map((t) => (
            <button key={t} className={blockType === t ? 'active' : ''} onClick={() => setBlockType(t)}>
              {TYPE_META[t].label}
            </button>
          ))}
        </div>
        <div className="blockGrid">
          {blocks.map((b, i) => (
            <button key={`${b.name}-${i}`} className="blockChip" onClick={() => addBlock(b)} title={b.detail}>
              + {b.name}
            </button>
          ))}
        </div>
        <button className="ghostBtn block" onClick={() => addStep(dayIndex)}>
          <Plus size={16} /> Eigene Übung (leer)
        </button>
      </section>

      <section className="editorSection">
        <div className="editorRow">
          <h3>Übungen · {day?.title}</h3>
        </div>
        <div className="stepEditorList">
          {day?.steps.map((s, si) => (
            <div key={si} className="stepEditor">
              <div className="stepEditorTop">
                <strong>Übung {si + 1}</strong>
                <div className="stepEditorBtns">
                  <button className="iconAction sm" onClick={() => moveStep(dayIndex, si, -1)} disabled={si === 0} aria-label="Hoch"><ChevronUp size={16} /></button>
                  <button className="iconAction sm" onClick={() => moveStep(dayIndex, si, 1)} disabled={si === day.steps.length - 1} aria-label="Runter"><ChevronDown size={16} /></button>
                  <button className="iconAction sm danger" onClick={() => removeStep(dayIndex, si)} aria-label="Löschen"><Trash2 size={16} /></button>
                </div>
              </div>
              <label className="field">
                <span>Name</span>
                <input value={s.name} onChange={(e) => patchStep(dayIndex, si, { name: e.target.value })} />
              </label>
              <div className="fieldGrid">
                <label className="field">
                  <span>Typ</span>
                  <select value={s.type} onChange={(e) => patchStep(dayIndex, si, { type: e.target.value })}>
                    {TYPE_KEYS.map((t) => <option key={t} value={t}>{TYPE_META[t].label}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>WDH / Dauer</span>
                  <input
                    value={s.reps}
                    onChange={(e) => patchStep(dayIndex, si, { reps: e.target.value })}
                    placeholder="3 x 12 oder 45 Sek"
                  />
                </label>
              </div>
              <label className="field">
                <span>Hinweis</span>
                <textarea
                  rows={2}
                  value={s.detail}
                  onChange={(e) => patchStep(dayIndex, si, { detail: e.target.value })}
                />
              </label>
              <label className="field">
                <span><Video size={14} /> Video-URL (YouTube oder MP4)</span>
                <input
                  value={s.video || ''}
                  onChange={(e) => patchStep(dayIndex, si, { video: e.target.value })}
                  placeholder="https://youtu.be/…"
                />
              </label>
            </div>
          ))}
        </div>
        <button className="ghostBtn block" onClick={() => addStep(dayIndex)}><Plus size={16} /> Eigene Übung hinzufügen</button>
      </section>
    </div>
  )
}
