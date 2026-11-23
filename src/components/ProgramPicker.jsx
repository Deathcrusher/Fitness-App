import React, { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Dumbbell, Plus, Sparkles, Check } from 'lucide-react'

// Primary training is always visible. Optional and custom workouts never crowd out the weekly plan.
export default function ProgramPicker({ plan, person, owner, builtinEntries, customEntries, dayIndex, dueDay, onPerson, onNewProgram, onDay }) {
  const specialEntries = customEntries.filter(([key, item]) =>
    key === 'chat-arm-special-20261122' || item.name === 'Arme Spezial')
  const otherEntries = customEntries.filter(([key]) => !specialEntries.some(([special]) => special === key))
  const [showOthers, setShowOthers] = useState(() => otherEntries.some(([key]) => key === person))

  useEffect(() => {
    if (otherEntries.some(([key]) => key === person)) setShowOthers(true)
  }, [person]) // Keep the expanded section visible when a custom program is selected.

  return (
    <>
      <header className="pageHead">
        <h1>Dein Training</h1>
        <p>{plan.name} · {plan.title}</p>
      </header>

      <div className="segmented personSeg" role="tablist" aria-label="Person wählen">
        {builtinEntries.map(([key, item]) => (
          <button key={key} role="tab" aria-selected={owner === key} className={owner === key ? 'active' : ''} onClick={() => onPerson(key)}>
            {item.name}
          </button>
        ))}
      </div>

      <section className="ffProgramPicker" aria-label="Trainingsprogramm auswählen">
        <div className="ffProgramHeading">
          <strong>Trainingsprogramm</strong>
          <span>Dein Standardplan zuerst, Extras bei Bedarf</span>
        </div>
        <div className="ffProgramChoices">
          <button type="button" className={`ffProgramOption${plan.builtin ? ' active' : ''}`}
            onClick={() => onPerson(owner)} aria-pressed={Boolean(plan.builtin)}>
            <span className="ffProgramIcon"><Dumbbell size={19} /></span>
            <span className="ffProgramText"><strong>Grundtraining</strong><small>3 Tage · Ganzkörper & Kraft</small></span>
            {plan.builtin && <Check className="ffProgramCheck" size={19} />}
          </button>
          {specialEntries.map(([key, item]) => (
            <button type="button" key={key} className={`ffProgramOption${person === key ? ' active' : ''}`}
              onClick={() => onPerson(key)} aria-pressed={person === key}>
              <span className="ffProgramIcon"><Sparkles size={19} /></span>
              <span className="ffProgramText"><strong>{item.name}</strong><small>Optional · Fokus auf Arme</small></span>
              {person === key && <Check className="ffProgramCheck" size={19} />}
            </button>
          ))}
        </div>
        <div className="ffProgramMore">
          <button type="button" className="ffProgramMoreToggle" onClick={() => setShowOthers(v => !v)}
            aria-expanded={showOthers} aria-controls="ff-other-plans">
            Weitere Programme {otherEntries.length > 0 && <span>({otherEntries.length})</span>}
            {showOthers ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
          </button>
          {showOthers && (
            <div className="ffOtherPlans" id="ff-other-plans">
              {otherEntries.map(([key, item]) => (
                <button type="button" key={key} className={`ffOtherPlan${person === key ? ' active' : ''}`}
                  onClick={() => onPerson(key)} aria-pressed={person === key}>
                  <span><strong>{item.name}</strong><small>{item.title || 'Eigenes Programm'}</small></span>
                  {person === key && <Check size={17} />}
                </button>
              ))}
              <button type="button" className="ffCreatePlan" onClick={onNewProgram}><Plus size={17} /> Neues Programm erstellen</button>
            </div>
          )}
        </div>
      </section>

      <nav className="dayTabsRail" aria-label="Trainingstag wählen">
        {plan.days.map((item, index) => (
          <button key={`${item.title}-${index}`} className={dayIndex === index ? 'active' : ''}
            onClick={() => onDay(index)} aria-current={dayIndex === index ? 'page' : undefined}>
            <strong>{item.title}{plan.builtin && dueDay === index && <em className="dueBadge">Heute dran</em>}</strong>
            <span>{item.focus}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
