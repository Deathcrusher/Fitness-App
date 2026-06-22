import React, { useEffect, useState } from 'react'
import { ArrowLeft, Copy, Play, Plus, Trash2 } from 'lucide-react'
import Editor from './Editor'

export default function Builder({
  customPlans,
  builtinPlans,
  selected,
  onChange,
  onNew,
  onDuplicateBuiltin,
  onDelete,
  onBack,
  onRun,
}) {
  const keys = Object.keys(customPlans)
  const [editingKey, setEditingKey] = useState(selected && customPlans[selected] ? selected : keys[0] || null)

  useEffect(() => {
    if (selected && customPlans[selected]) setEditingKey(selected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  const validKey = editingKey && customPlans[editingKey] ? editingKey : keys[0] || null
  const plan = validKey ? customPlans[validKey] : null

  function stepTotal(p) {
    return p.days.reduce((n, d) => n + d.steps.length, 0)
  }

  return (
    <div className="builder">
      <div className="builderHead">
        <button className="ghostBtn" onClick={onBack}><ArrowLeft size={16} /> Zum Training</button>
        <h2>Meine Programme</h2>
      </div>

      <div className="builderGrid">
        {keys.map((key) => {
          const p = customPlans[key]
          return (
            <button
              key={key}
              className={`programCard${validKey === key ? ' active' : ''}`}
              onClick={() => setEditingKey(key)}
            >
              <strong>{p.name}</strong>
              <small>{p.title}</small>
              <span className="cardMeta">{p.days.length} Tage · {stepTotal(p)} Übungen</span>
            </button>
          )
        })}
        <button className="programCard add" onClick={onNew}>
          <Plus size={20} /> <span>Neues Programm</span>
        </button>
      </div>

      <div className="templates">
        <span>Vorlage kopieren:</span>
        {Object.entries(builtinPlans).map(([k, p]) => (
          <button key={k} className="ghostBtn" onClick={() => onDuplicateBuiltin(k)}>
            <Copy size={15} /> {p.name}
          </button>
        ))}
      </div>

      {plan ? (
        <>
          <div className="builderActions">
            <button className="primaryAction" onClick={() => onRun(validKey)}>
              <Play size={18} /> Programm starten
            </button>
            <button className="ghostBtn danger" onClick={() => onDelete(validKey)}>
              <Trash2 size={16} /> Löschen
            </button>
          </div>
          <Editor key={validKey} plan={plan} onChange={(updated) => onChange(updated, validKey)} />
        </>
      ) : (
        <p className="muted builderEmpty">Noch kein Programm – leg eines an oder kopiere eine Vorlage.</p>
      )}
    </div>
  )
}
