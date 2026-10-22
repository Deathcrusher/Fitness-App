import React from 'react'
import ExerciseFigure from './ExerciseFigure'

export default function SessionMedia({ phase, step, stepKey, imageMode, onImageMode, image, imageFocus, guide, hasAnim, badge }) {
  return (
    <div className={`sessionImageWrap${phase === 'rest' ? ' resting' : ''}`}>
      {phase === 'work' && hasAnim && imageMode === 'anim' ? (
        <ExerciseFigure key={stepKey} step={step} label={`${step.name}: Bewegungsablauf`} />
      ) : (
        <img
          className={phase === 'work' && imageMode === 'guide' && guide ? 'guideImage' : ''}
          src={phase === 'work' && imageMode === 'guide' && guide ? guide : image}
          alt={phase === 'work' && imageMode === 'guide' && guide ? `${step.name}: Start- und Endposition` : `${step.name} Foto`}
          style={{ objectPosition: phase === 'work' && imageMode === 'guide' && guide ? 'center center' : imageFocus }}
          loading="lazy"
          decoding="async"
        />
      )}
      {phase === 'work' && imageMode === 'guide' && guide && (
        <>
          <span className="guidePosition start">Start</span>
          <span className="guidePosition end">Ende</span>
        </>
      )}
      <div className="phaseBadge">{badge}</div>
      {phase === 'work' && (hasAnim || guide) && (
        <div className="imageModeSwitch" aria-label="Übungsdarstellung">
          {hasAnim && <button className={imageMode === 'anim' ? 'active' : ''} onClick={() => onImageMode('anim')}>Animation</button>}
          {guide && <button className={imageMode === 'guide' ? 'active' : ''} onClick={() => onImageMode('guide')}>Start &amp; Ende</button>}
          <button className={imageMode === 'photo' || (!hasAnim && imageMode === 'anim') ? 'active' : ''} onClick={() => onImageMode('photo')}>Foto</button>
        </div>
      )}
    </div>
  )
}
