import { warmupSteps, step } from './plansBase'

export const CORE_SPECIAL_ID = 'rene-core-special-v1'
export const coreSpecial = {
  id: CORE_SPECIAL_ID,
  owner: 'rene',
  name: 'Bauch Spezial',
  title: 'Core · Muskelaufbau',
  accent: 'green',
  equipment: 'Matte, optional Kurzhantel',
  version: '2026-11-25-core-1',
  days: [{
    title: 'Bauch Spezial',
    focus: 'Gerade & seitliche Bauchmuskeln',
    tone: 'Optional, zunächst höchstens einmal zusätzlich pro Woche. Nicht direkt nach einem anstrengenden Core-Tag. Langsam und sauber, 45–60 Sekunden Satzpause.',
    steps: [
      ...warmupSteps().filter(s => ['Marschieren','Knie heben – links','Knie heben – rechts'].includes(s.name)).map(s=>({...s,reps:'30 Sek'})),
      step('core','Crunches','Rückenlage, Knie gebeugt. Schulterblätter wenige Zentimeter anheben, ausatmen, langsam senken. Nicht am Nacken ziehen. Erst ohne Zusatzlast; später optional eine leichte Kurzhantel eng vor der Brust.','2 x 12-15'),
      step('core','Reverse Crunches','Knie gebeugt über der Hüfte. Becken mit den Bauchmuskeln leicht einrollen und vom Boden heben, ohne Schwung. Langsam abrollen.','2 x 10-15'),
      step('core','Bicycle Crunches','Abwechselnd Schulter zum gegenüberliegenden Knie führen, langsam und ohne am Nacken zu ziehen. 10 pro Seite, 20 insgesamt.','2 x 20'),
      step('core','Plank','Unterarme aufstützen, Körper in einer Linie, Bauch fest und ruhig atmen. Bei Formverlust den Satz beenden.','2 x 30-45 Sek'),
    ],
  }],
}
