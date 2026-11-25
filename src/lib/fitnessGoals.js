// Profiles change presentation and coaching, never historical measurements.
export const isMaintenance = owner => owner === 'connie'
export const goalFor = (owner, programId) => programId === 'connie-energy-balance-v1'
  ? {title:'Energy & Balance',label:'Fitness & Energie',description:'Ausdauer, Beweglichkeit und Kraft in deinem Tempo.'}
  : isMaintenance(owner)
    ? {title:'Fit & Straff',label:'Muskelerhalt & Körperfettreduktion',description:'Kraft erhalten, Kondition verbessern und Körperwerte langfristig beobachten.'}
    : {title:'Muscle Builder',label:'Muskelaufbau',description:'Kraft, Muskelgruppen und Trainingsvolumen gezielt entwickeln.'}
export const fitnessBadge = badge => !['record','records10','ton','tons10'].includes(badge.id)
