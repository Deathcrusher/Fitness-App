import React from 'react'
import { Plus } from 'lucide-react'

export default function ProgramPicker({ plan, person, owner, builtinEntries, customEntries, dayIndex, dueDay, onPerson, onNewProgram, onDay }) {
  return (
    <>
      <header className="pageHead">
        <h1>{plan.name}</h1>
        <p>{plan.title}</p>
      </header>

      <div className="segmented personSeg" role="tablist" aria-label="Person wählen">
        {builtinEntries.map(([key, item]) => (
          <button key={key} role="tab" aria-selected={owner === key} className={owner === key ? 'active' : ''} onClick={() => onPerson(key)}>
            {item.name}
          </button>
        ))}
      </div>

      <div className="programChips" aria-label="Programm wählen">
        <button className={plan.builtin ? 'active' : ''} onClick={() => onPerson(owner)} aria-pressed={plan.builtin}>Grundtraining</button>
        {customEntries.map(([key, item]) => (
          <button key={key} className={person === key ? 'active' : ''} onClick={() => onPerson(key)} aria-pressed={person === key}>{item.name}</button>
        ))}
        <button className="chipAdd" onClick={onNewProgram} aria-label="Neues Programm"><Plus size={16} /> Neu</button>
      </div>

      <nav className="dayTabsRail" aria-label="Trainingstag wählen">
        {plan.days.map((item, index) => (
          <button key={`${item.title}-${index}`} className={dayIndex === index ? 'active' : ''} onClick={() => onDay(index)} aria-current={dayIndex === index ? 'page' : undefined}>
            <strong>{item.title}{dueDay === index && <em className="dueBadge">Heute dran</em>}</strong>
            <span>{item.focus}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
