import React, { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Dumbbell, Plus, Sparkles, Check, MoveUpRight, CalendarDays } from 'lucide-react'

import { ENERGY_ID, ENERGY_MODES } from '../lib/energyPlan'
import { goalFor, isMaintenance } from '../lib/fitnessGoals'

// The program and day selectors only appear on the actual workout screen.
export default function ProgramPicker({ plan, person, owner, builtinEntries, customEntries, dayIndex, dueDay, onPerson, onNewProgram, onDay, energyMode, onEnergyMode, showProfiles = true }) {
  const specialEntries = customEntries.filter(([key, item]) =>
    key === 'chat-arm-special-20261122' || item.name === 'Arme Spezial')
  const energyEntry = customEntries.find(([key]) => key === ENERGY_ID)
  const otherEntries = customEntries.filter(([key]) => key !== ENERGY_ID && !specialEntries.some(([special]) => special === key))
  const [showOthers, setShowOthers] = useState(() => otherEntries.some(([key]) => key === person))

  useEffect(() => {
    if (otherEntries.some(([key]) => key === person)) setShowOthers(true)
  }, [person])

  return (
    <>
      <header className="pageHead ffPageHead">
        <div className="ffPageEyebrow"><span className="ffEyebrowDot" /> FITFLOW / TRAINING STUDIO</div>
        <div className="ffPageTitleRow">
          <div>
            <h1>{person === ENERGY_ID ? 'Finde deine ' : isMaintenance(owner) ? 'Bleib ' : 'Werde '}<span>{person === ENERGY_ID ? 'Balance.' : isMaintenance(owner) ? 'fit.' : 'stärker.'}</span></h1>
            <p>{goalFor(owner,person).label} · Dein Training. Dein Tempo.</p>
          </div>
          <span className="ffPageCorner" aria-hidden="true"><MoveUpRight size={29} /></span>
        </div>
      </header>

      {showProfiles && <div className="segmented personSeg ffPersonSeg" role="tablist" aria-label="Person wählen">
        {builtinEntries.map(([key, item]) => (
          <button key={key} role="tab" aria-selected={owner === key} className={owner === key ? 'active' : ''} onClick={() => onPerson(key)}>
            {item.name}
          </button>
        ))}
      </div>}

      <section className="ffProgramPicker" aria-label="Trainingsprogramm auswählen">
        <div className="ffProgramHeading">
          <strong>DEINE PROGRAMME</strong>
          <span>Wähle, was du heute trainierst</span>
        </div>
        <div className="ffProgramChoices">
          <button type="button" className={`ffProgramOption${plan.builtin ? ' active' : ''}`}
            onClick={() => onPerson(owner)} aria-pressed={Boolean(plan.builtin)}>
            <span className="ffProgramIcon"><Dumbbell size={19} /></span>
            <span className="ffProgramText"><strong>Grundtraining</strong><small>{isMaintenance(owner) ? 'Fit & Straff · Muskelerhalt & Ausdauer' : 'Muskelaufbau · 3-Tage-Ganzkörperplan'}</small></span>
            {plan.builtin && <Check className="ffProgramCheck" size={19} />}
          </button>
          {energyEntry && <button type="button" className={`ffProgramOption${person === ENERGY_ID ? ' active' : ''}`} onClick={() => onPerson(ENERGY_ID)} aria-pressed={person === ENERGY_ID}>
            <span className="ffProgramIcon"><Sparkles size={19} /></span>
            <span className="ffProgramText"><strong>Energy &amp; Balance</strong><small>3 Tage · Kraft, Hula Hoop &amp; Yoga</small></span>
            {person === ENERGY_ID && <Check className="ffProgramCheck" size={19} />}
          </button>}
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

      {person === ENERGY_ID && <section className="ffProgramPicker" aria-label="Tagesform">
        <div className="ffProgramHeading"><strong>DEINE TAGESFORM</strong><span>Wähle vor dem Start dein Tempo. Pausieren ist jederzeit okay.</span></div>
        <div className="ffProgramChoices">
          {Object.entries(ENERGY_MODES).map(([key,label]) => <button key={key} type="button" className={`ffProgramOption${energyMode === key ? ' active' : ''}`} aria-pressed={energyMode === key} disabled={!onEnergyMode} onClick={() => onEnergyMode?.(key)}><span className="ffProgramText"><strong>{label}</strong></span>{energyMode === key && <Check size={19} />}</button>)}
        </div>
      </section>}
      <div className="ffDayHeader"><span><CalendarDays size={16} /> DEINE TRAININGSTAGE</span><small>{plan.days.length} {plan.days.length === 1 ? 'Einheit' : 'Einheiten'}</small></div>
      <nav className="dayTabsRail" aria-label="Trainingstag wählen">
        {plan.days.map((item, index) => (
          <button key={`${item.title}-${index}`} className={dayIndex === index ? 'active' : ''}
            onClick={() => onDay(index)} aria-current={dayIndex === index ? 'page' : undefined}>
            <strong>{item.title}{plan.builtin && dueDay === index && <em className="dueBadge">Als Nächstes</em>}</strong>
            <span>{item.focus}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
