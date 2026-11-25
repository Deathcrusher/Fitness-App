import { moveFor } from './figure/moves'
// Public original videos; use the official YouTube player, never rehost footage.
const cat={id:'a0wyBGg4aWw',author:'RosalieYoga',title:'Cat Cow',note:'Sechs ruhige Atemzyklen, nicht die gesamte Videolänge.'}
const child={id:'zqwK6J3yHfA',author:'RosalieYoga',title:"Child’s Pose",note:'Nur so weit zurücksetzen, wie Knie und Hüfte es angenehm finden.'}
const warrior={id:'8-03djCQq8w',author:'RosalieYoga',title:'Warrior II',note:'Kleinerer Stand und weniger Kniebeugung sind okay. Trainiere die im Plan genannte Seite.'}
const tree={id:'sXC2-QWXU7Q',author:'YOGATX',title:'Tree Pose – Varianten mit Wand',start:54,note:'Nur die erste, niedrige Variante wählen; mit Hand an der Wand abstützen. Fuß nie gegen das Knie drücken.'}
const butterfly={id:'B6tb4TncKhY',author:'Yoga With Adriene',title:'Bound Angle Pose',start:35,note:'Bei der aufrechten Sitzposition bleiben; Knie locker lassen und niemals nach unten drücken.'}
const bird={id:'QQot16miua8',author:'Physical Therapy & Hand Clinic of Hillsboro',title:'Bird Dog',start:44,note:'Gegenüberliegenden Arm und Bein nur so weit heben, wie der Rücken stabil bleibt.'}
const twist={id:'mNdJti7ZwKI',author:'Vive Health · David Lee, Physiotherapeut',title:'Supine Spinal Twist',start:15,note:'Knie nur sanft zur angegebenen Seite sinken lassen, Schultern am Boden lassen und nicht nachdrücken.'}
const videos={catCow:cat,childPose:child,warriorLeft:warrior,warriorRight:warrior,treeLeft:tree,treeRight:tree,butterfly,birdDog:bird,supineTwistLeft:twist,supineTwistRight:twist}
const strengthVideos = {
  "romanianDeadlift": {
    "id": "FQKfr1YDhEk",
    "author": "ScottHermanFitness",
    "title": "Dumbbell Romanian Deadlift",
    "note": "Po nach hinten führen, Rücken neutral und Hanteln nah an den Beinen."
  },
  "rowOneArm": {
    "id": "dFzUjzfih7k",
    "author": "2 Minute Tutorial",
    "title": "Single Arm Dumbbell Row",
    "note": "Stabil abstützen, Ellbogen zur Hüfte ziehen und nicht mit dem Oberkörper drehen."
  },
  "row": {
    "id": "KIdzT7ZJT0o",
    "author": "Exercise Demo",
    "title": "Bent Over Two Dumbbell Row Palms In",
    "note": "Rücken neutral, beide Hanteln kontrolliert ziehen."
  },
  "wristCurl": {
    "id": "yio7CGPjQ-8",
    "author": "Live Lean TV Daily Exercises",
    "title": "Seated Dumbbell Wrist Curls",
    "note": "Unterarme auf den Oberschenkeln abstützen, Handflächen nach oben, nur Handgelenke bewegen."
  },
  "reverseCurl": {
    "id": "rV2asdIdXF0",
    "author": "Original-Tutorial",
    "title": "Reverse Curls With Dumbbells",
    "note": "Handrücken nach oben, Ellbogen ruhig, Handgelenke gerade."
  },
  "calfRaise": {
    "id": "rsOLKY02m70",
    "author": "UVM Campus Recreation",
    "title": "Standing Calf Raise",
    "note": "Fersen langsam heben und senken. An einer Wand abstützen."
  },
  "curl": {
    "id": "in7PaeYlhrM",
    "author": "Mind Pump TV",
    "title": "Proper Dumbbell Biceps Curl",
    "note": "Ellbogen ruhig halten und ohne Schwung absenken.",
    "start": 38
  },
  "hammer": {
    "id": "CFBZ4jN1CMI",
    "author": "Original-Tutorial",
    "title": "Dumbbell Hammer Curl",
    "note": "Handflächen zueinander, Ellbogen am Körper."
  },
  "floorPress": {
    "id": "uUGDRwge4F8",
    "author": "ScottHermanFitness",
    "title": "Dumbbell Floor Press",
    "note": "Auf dem Boden liegen, Oberarme sanft absetzen und kontrolliert drücken."
  },
  "press": {
    "id": "B-aVuyhvLHU",
    "author": "Original-Tutorial",
    "title": "Dumbbell Shoulder Press",
    "note": "Rippen über der Hüfte halten, nicht ins Hohlkreuz gehen."
  },
  "lateral": {
    "id": "kDqklk1ZESo",
    "author": "Original-Tutorial",
    "title": "Side Dumbbell Lateral Raises",
    "note": "Leichte Gewichte kontrolliert seitlich anheben, Schultern nicht hochziehen."
  },
  "squat": {
    "id": "vm1iZ16jJ3k",
    "author": "Exercise Demo",
    "title": "Bodyweight Squat",
    "note": "Erst die Bewegung ohne Gewicht üben. Knie folgen den Fußspitzen."
  },
  "bridge": {
    "id": "UbkRomoSE74",
    "author": "Invigorate Training",
    "title": "Glute Bridge",
    "note": "Bei der einfachen beidbeinigen Variante bleiben. Hüfte heben, nicht ins Hohlkreuz gehen."
  },
  "wallPushup": {
    "id": "5NPvv40gd3Q",
    "author": "Sunnybrook Hospital",
    "title": "Push-ups against a wall",
    "note": "Hände an eine feste Wand, Körper gerade, langsam beugen und strecken."
  },
  "hulaHoop": {
    "id": "cMfVYyEqcfA",
    "author": "Original-Tutorial",
    "title": "Basic Waist Hooping",
    "note": "Locker im eigenen Rhythmus beginnen. Die FitFlow-Dauer gilt, nicht die Videolänge."
  }
}
export function prefersVideo(step) {
 return Boolean(step?.gentle && Object.hasOwn(videos,step.move))
}
export function exerciseVideoFor(step) {
 if(prefersVideo(step)) return videos[step.move]
 // Close-grip triceps floor press differs from standard floor press.
 if(/trizeps.*brustdrück/i.test(step?.name || '')) return null
 const move=moveFor(step)
 return Object.hasOwn(strengthVideos,move) ? strengthVideos[move] : null
}
export function defaultMediaMode(step) { return prefersVideo(step) ? 'video' : 'anim' }
export function videoWatchUrl(video) {
 return 'https://www.youtube.com/watch?v='+video.id+(video.start?'&t='+video.start+'s':'')
}
export function videoEmbedUrl(video) {
 return 'https://www.youtube-nocookie.com/embed/'+video.id+'?playsinline=1&rel=0&cc_load_policy=1&cc_lang_pref=de&autoplay=1'+(video.start?'&start='+video.start:'')
}
