import React, { useEffect, useState } from 'react'
import { Copy, Play, Plus, Sparkles, Trash2 } from 'lucide-react'
import Editor from './Editor'

export default function Builder({
  customPlans,
  builtinPlans,
  owner,
  onOwner,
  selected,
  templates,
  onChange,
  onNew,
  onGenerate,
  onAddTemplate,
  onDuplicateBuiltin,
  onDelete,
  onBack,
  onRun,
}) {
  const ownedEntries = Object.entries(customPlans).filter(([, p]) => (p.owner || 'connie') === owner)
  const [editingKey, setEditingKey] = useState(
    selected && customPlans[selected] ? selected : ownedEntries[0]?.[0] || null,
  )

  useEffect(() => {
    if (selected && customPlans[selected] && customPlans[selected].owner === owner) setEditingKey(selected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  useEffect(() => {
    setEditingKey(null)
  }, [owner])

  const ownedKeys = ownedEntries.map(([k]) => k)
  const validKey = editingKey && ownedKeys.includes(editingKey) ? editingKey : ownedKeys[0] || null
  const plan = validKey ? customPlans[validKey] : null

  function stepTotal(p) {
    return p.days.reduce((n, d) => n + d.steps.length, 0)
  }

  return (
    <div className="builder">
      <header className="pageHead builderTitle">
        <h1>Programme</h1>
        <p>Eigene Trainings anlegen und bearbeiten.</p>
      </header>

      <div className="segmented" role="tablist" aria-label="Programme für">
        <button role="tab" aria-selected={owner === 'connie'} className={owner === 'connie' ? 'active' : ''} onClick={() => onOwner('connie')}>Connie</button>
        <button role="tab" aria-selected={owner === 'rene'} className={owner === 'rene' ? 'active' : ''} onClick={() => onOwner('rene')}>René</button>
      </div>

      <section className="builderSection">
        <h2>Deine Programme</h2>
        {ownedEntries.length > 0 ? (
          <div className="programList">
            {ownedEntries.map(([key, p]) => (
              <button
                key={key}
                className={`programRow${validKey === key ? ' active' : ''}`}
                onClick={() => setEditingKey(key)}
                aria-pressed={validKey === key}
              >
                <span className="programInitial">{p.name.slice(0, 1)}</span>
                <span className="programCopy">
                  <strong>{p.name}</strong>
                  <small>{p.days.length} {p.days.length === 1 ? 'Tag' : 'Tage'}, {stepTotal(p)} Übungen</small>
                </span>
                <span className="programPlay" onClick={(e) => { e.stopPropagation(); onRun(key) }} role="button" aria-label={`${p.name} starten`}>
                  <Play size={16} />
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="muted builderEmpty">Noch kein eigenes Programm. Leg eins an oder starte mit einer Vorlage.</p>
        )}
        <div className="createRow">
          <button className="primaryAction" onClick={onGenerate}><Sparkles size={17} /> Generieren</button>
          <button className="ghostBtn" onClick={onNew}><Plus size={17} /> Neu anlegen</button>
        </div>
      </section>

      <section className="builderSection">
        <h2>Vorlagen</h2>
        <div className="templateRail">
          {templates.map((t, i) => (
            <button key={i} className="templateCard" onClick={() => onAddTemplate(t)}>
              <strong>{t.name}</strong>
              <small>{t.title}</small>
              <span><Plus size={14} /> Hinzufügen</span>
            </button>
          ))}
          {Object.entries(builtinPlans).map(([k, p]) => (
            <button key={k} className="templateCard" onClick={() => onDuplicateBuiltin(k)}>
              <strong>{p.name}</strong>
              <small>Grundtraining kopieren</small>
              <span><Copy size={14} /> Kopieren</span>
            </button>
          ))}
        </div>
      </section>

      {plan && (
        <section className="builderSection">
          <div className="editHead">
            <h2>{plan.name} bearbeiten</h2>
            <div className="builderActions">
              <button className="primaryAction" onClick={() => onRun(validKey)}><Play size={17} /> Starten</button>
              <button className="iconAction sm danger" onClick={() => onDelete(validKey)} aria-label="Programm löschen"><Trash2 size={16} /></button>
            </div>
          </div>
          <Editor key={validKey} plan={plan} onChange={(updated) => onChange(updated, validKey)} />
        </section>
      )}
    </div>
  )
}
