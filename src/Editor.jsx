import React, { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Video,
  X,
} from 'lucide-react'
import { ACCENTS, TYPE_META, TYPE_KEYS, emptyStep, emptyDay } from './plans'

export default function Editor({ plan, onChange, onDelete, onClose }) {
  const [dayIndex, setDayIndex] = useState(0)
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
  function addStep(di) {
    onChange({
      ...plan,
      days: plan.days.map((d, i) => (i === di ? { ...d, steps: [...d.steps, emptyStep()] } : d)),
    })
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

  return (
    <div className="editor">
      <div className="editorHead">
        <h2>Programm bearbeiten</h2>
        <button className="iconAction" onClick={onClose} aria-label="Editor schließen"><X size={20} /></button>
      </div>

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
            <button
              key={i}
              className={i === dayIndex ? 'active' : ''}
              onClick={() => setDayIndex(i)}
            >
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
        <div className="editorRow">
          <h3>Übungen · {day?.title}</h3>
          <button className="ghostBtn" onClick={() => addStep(dayIndex)}><Plus size={16} /> Übung</button>
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
        <button className="ghostBtn block" onClick={() => addStep(dayIndex)}><Plus size={16} /> Übung hinzufügen</button>
      </section>

      <section className="editorSection dangerZone">
        <button className="dangerGhost" onClick={onDelete}>
          <Trash2 size={16} /> Programm löschen
        </button>
      </section>
    </div>
  )
}
