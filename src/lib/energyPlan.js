// Additional, independent preset. No migration or mutation of existing plans.
export const ENERGY_ID = 'connie-energy-balance-v1'
export const ENERGY_MODES = { low: 'Wenig Energie', normal: 'Normal', high: 'Sehr fit' }
export function energyPlan(mode = 'normal') {
  const low = mode === 'low'
  const high = mode === 'high'
  const strength = (type, name, detail, reps = 8) => ({ type, name, detail, reps: low ? '1 x 5-6' : '2 x ' + reps, gentle: true })
  const time = (type, name, detail, seconds, move) => ({ type, name, detail, reps: seconds >= 60 && seconds % 60 === 0 ? seconds / 60 + ' Min' : seconds + ' Sek', durationSec: seconds, move, gentle: true })
  const hoop = (minutes) => time('cardio','Hula Hoop','Die ersten Minuten locker beginnen. Ein Tempo wählen, bei dem du noch sprechen kannst; bei Bedarf früher stoppen.',minutes*60,'hulaHoop')
  const yoga = (name, detail, move, secs = 30) => time('recovery',name,detail,low ? Math.min(secs,15) : secs,move)
  const sides = (name, detail, move) => ['links','rechts'].map((side,i)=>yoga(name+' – '+side,detail+' Seite: '+side+'.',move+(i?'Right':'Left'),20))
  const squat = () => strength('lower','Kniebeugen zum Stuhl','Stabilen Stuhl ohne Rollen verwenden. Langsam absetzen und wieder aufstehen.')
  const child = () => yoga('Stellung des Kindes','Hüfte Richtung Fersen, Arme nach vorne. Nur so weit wie angenehm.','childPose')
  return {
    id: ENERGY_ID, owner:'connie', name:'Energy & Balance', title:'Kraft, Ausdauer & Yoga', accent:'violet',
    equipment:'Matte, stabiler Stuhl, Wand, Hula Hoop, leichte Hanteln', version:'2026-11-25-energy-1',
    days:[
      {title:'Montag',focus:'Strength & Balance',tone:'Locker beginnen, sauber bewegen, Pausen nach Bedarf.',steps:[
        hoop(low?5:high?10:5), squat(),
        strength('lower','Glute Bridge','Becken kontrolliert heben und senken.',10),
        strength('upper','Wandliegestütze','Hände auf Brusthöhe an eine feste Wand, Füße stabil, Körper gerade.'),
        {type:'recovery',name:'Katzen-Kuh-Yoga',detail:'Im Vierfüßlerstand den Rücken sanft runden und wieder öffnen; 6 ruhige Atemzyklen.',reps:'6 langsame Wdh.',move:'catCow',gentle:true},child()
      ]},
      {title:'Mittwoch',focus:'Cardio & Yoga',tone:'Hula Hoop ist die Haupteinheit. Yoga ist optional, wenn noch Energie da ist.',steps:[
        hoop(low?10:high?20:15),
        ...sides('Krieger II','Breiter Stand, vorderes Knie sanft beugen, Arme seitlich ausstrecken.','warrior'),
        ...sides('Baumposition','Mit einer Hand an einer Wand oder Stuhllehne abstützen; Fuß tief am anderen Bein, nie am Knie.','tree'),
        {type:'core',name:'Bird Dog',detail:'Gegenüberliegenden Arm und Bein langsam strecken, dann wechseln. Insgesamt 12 Wiederholungen, bei wenig Energie 6.',reps:low?'1 x 6':'1 x 12',move:'birdDog',gentle:true},
        yoga('Schmetterlingssitz','Fußsohlen zusammen, Knie locker sinken lassen, nicht drücken.','butterfly'),child()
      ]},
      {title:'Freitag',focus:'Full Body & Flexibility',tone:'Leichte Gewichte wählen und nie bis zum Muskelversagen gehen.',steps:[
        hoop(low?5:high?10:5),
        strength('upper','Rudern mit Hanteln','Leichte Hanteln, Rücken neutral, langsam ziehen.'),
        squat(),
        strength('upper','Bizeps-Curls','Leichte Hanteln, Ellbogen ruhig, ohne Schwung.'),
        strength('lower','Wadenheben stehend','An Wand oder Stuhl abstützen, Fersen langsam heben und senken.',10),
        ...sides('Liegende Wirbelsäulendrehung','Auf dem Rücken liegen, gebeugte Knie sanft zur Seite sinken lassen, Schultern entspannt.','supineTwist')
      ]}
    ]
  }
}
export const workSecondsFor = (step, fallback) => step?.durationSec ?? fallback(step?.reps || '')
