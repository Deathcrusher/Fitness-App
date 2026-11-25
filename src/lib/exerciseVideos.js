// Public original videos; use the official YouTube player, never rehost footage.
const cat={id:'a0wyBGg4aWw',author:'RosalieYoga',title:'Cat Cow',note:'Sechs ruhige Atemzyklen, nicht die gesamte Videolänge.'}
const child={id:'zqwK6J3yHfA',author:'RosalieYoga',title:"Child’s Pose",note:'Nur so weit zurücksetzen, wie Knie und Hüfte es angenehm finden.'}
const warrior={id:'8-03djCQq8w',author:'RosalieYoga',title:'Warrior II',note:'Kleinerer Stand und weniger Kniebeugung sind okay. Trainiere die im Plan genannte Seite.'}
const tree={id:'sXC2-QWXU7Q',author:'YOGATX',title:'Tree Pose – Varianten mit Wand',start:54,note:'Nur die erste, niedrige Variante wählen; mit Hand an der Wand abstützen. Fuß nie gegen das Knie drücken.'}
const butterfly={id:'MHwUChXNy-Y',author:'Hinge Health',title:'Butterfly Stretch',note:'Knie locker lassen und niemals nach unten drücken.'}
const bird={id:'QQot16miua8',author:'Physical Therapy & Hand Clinic of Hillsboro',title:'Bird Dog',start:44,note:'Gegenüberliegenden Arm und Bein nur so weit heben, wie der Rücken stabil bleibt.'}
const twist={id:'NSZ6YAm9L2w',author:'Originalvideo · GoLightWeight Übungsbibliothek',title:'Bent Knee Lying Twist',note:'Füße dürfen am Boden bleiben; Knie nur sanft zur angegebenen Seite sinken lassen.'}
const videos={catCow:cat,childPose:child,warriorLeft:warrior,warriorRight:warrior,treeLeft:tree,treeRight:tree,butterfly,birdDog:bird,supineTwistLeft:twist,supineTwistRight:twist}
export function exerciseVideoFor(step) {
 return step?.gentle && Object.hasOwn(videos,step.move) ? videos[step.move] : null
}
export function videoWatchUrl(video) {
 return 'https://www.youtube.com/watch?v='+video.id+(video.start?'&t='+video.start+'s':'')
}
export function videoEmbedUrl(video) {
 return 'https://www.youtube-nocookie.com/embed/'+video.id+'?playsinline=1&rel=0&cc_load_policy=1&cc_lang_pref=de&autoplay=1'+(video.start?'&start='+video.start:'')
}
