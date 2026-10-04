(() => {
'use strict';
const $=id=>document.getElementById(id), viewport=$('world-viewport');
if(!window.THREE){$('world-fallback').hidden=false;$('world-loading').hidden=true;return;}
const T=THREE, KEY='naya-world-v1';
const catalog={
 build:[['house','🏡','Haus'],['barn','🛖','Stall']],
 home:[['bed','🛏','Bett'],['sofa','🛋','Sofa'],['table','🪑','Tisch'],['chair','💺','Stuhl'],['lamp','💡','Lampe'],['rug','🌈','Teppich']],
 animals:[['sheep','🐑','Schaf'],['cow','🐄','Kuh'],['bunny','🐇','Hase'],['horse','🐴','Pferd']],
 garden:[['tree','🌳','Baum'],['flowers','🌷','Blumen'],['fence','🪵','Zaun'],['trough','🥕','Futterstelle']]
};
const animals=new Set(catalog.animals.map(x=>x[0])), furniture=new Set(catalog.home.map(x=>x[0]));
const colors=['#f8d79f','#ee9dba','#95cdd6','#a4d29a','#c8b5e4'];
let renderer;
try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});}catch(e){$('world-fallback').hidden=false;$('world-loading').hidden=true;return;}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=T.SRGBColorSpace;
viewport.prepend(renderer.domElement);renderer.domElement.style.cssText='width:100%;height:100%;display:block;touch-action:none';
const scene=new T.Scene(), camera=new T.OrthographicCamera(-10,10,10,-10,.1,100);
scene.background=new T.Color('#ccebf1');scene.fog=new T.Fog('#ccebf1',35,75);
scene.add(new T.HemisphereLight(0xfff5de,0x658d57,2.2));
const sun=new T.DirectionalLight(0xffe5c1,2.1);sun.position.set(-8,18,10);scene.add(sun);
const ambient=scene.children[0];
const materials=new Map();
function mat(color){if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.88}));return materials.get(color);}
function box(parent,x,y,z,w,h,d,color){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);parent.add(m);return m;}
function ball(parent,x,y,z,r,color,sx=1,sy=1,sz=1){const m=new T.Mesh(new T.SphereGeometry(r,12,8),mat(color));m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;}
function cylinder(parent,x,y,z,rt,rb,h,color){const m=new T.Mesh(new T.CylinderGeometry(rt,rb,h,10),mat(color));m.position.set(x,y,z);parent.add(m);return m;}
const land=new T.Group();scene.add(land);
box(land,0,-.36,0,19,.7,19,'#8ab86c');box(land,0,-.015,0,18.9,.06,18.9,'#abd57a');
const ground=new T.Mesh(new T.PlaneGeometry(19,19),new T.MeshBasicMaterial({visible:false}));ground.rotation.x=-Math.PI/2;scene.add(ground);
function tree(parent,x,z,scale=1){const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(scale);parent.add(g);cylinder(g,0,.7,0,.13,.2,1.4,'#b38360');ball(g,0,1.75,0,.8,'#72ad61');ball(g,-.45,1.5,.1,.55,'#90bf6a');ball(g,.42,1.58,.08,.55,'#a2cc70');return g;}
for(let i=0;i<10;i++){const a=i*Math.PI*2/10;tree(scene,Math.sin(a)*11.4,Math.cos(a)*11.4,.9+(i%3)*.15);}
// Decorative tufts stay outside the editable area.
for(let i=0;i<28;i++){const a=i*2.4,r=9.3;ball(scene,Math.sin(a)*r,.06,Math.cos(a)*r,.08,'#e9e99d',1,.5,1);}
let data={version:1,objects:[],night:false,autoFeed:true}, nextId=1, history=[], meshes=new Map(), selected=null, placement=null, rotation=0, tool='view', inside=false;
let azimuth=.72,zoom=1,target=new T.Vector3(0,0,0), toastTimer;
const ray=new T.Raycaster(),pointer=new T.Vector2(), selectionRing=new T.Mesh(new T.RingGeometry(.6,.72,32),new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide}));selectionRing.rotation.x=-Math.PI/2;selectionRing.position.y=.05;selectionRing.visible=false;scene.add(selectionRing);
function toast(message){$('world-toast').textContent=message;$('world-toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('world-toast').classList.remove('show'),2400);}
function save(silent=true){try{localStorage.setItem(KEY,JSON.stringify(data));$('world-save-info').textContent='✓ Auf diesem iPad gespeichert · jederzeit weiterspielen';if(!silent)toast('Deine Welt ist gespeichert! 💚');}catch(e){$('world-save-info').textContent='Speichern ist gerade nicht möglich. Prüfe den freien Speicher.';if(!silent)toast('Speichern ist gerade nicht möglich.');}}
function checkpoint(){history.push(JSON.stringify(data));if(history.length>20)history.shift();}
function isBuilding(o){return o.type==='house'||o.type==='barn';}
function localPoint(o,x,z){const dx=x-o.x,dz=z-o.z,c=Math.cos(o.rotation||0),s=Math.sin(o.rotation||0);return {x:dx*c-dz*s,z:dx*s+dz*c};}
function buildingAt(x,z){return data.objects.find(o=>{if(!isBuilding(o))return false;const p=localPoint(o,x,z);return Math.abs(p.x)<1.65&&Math.abs(p.z)<1.4;});}
function validPosition(type,x,z,id){const margin=isBuilding({type})?2:.4;if(Math.abs(x)>9-margin||Math.abs(z)>9-margin){toast('Bleib auf der grünen Wiese 🌱');return false;}
 if(furniture.has(type)&&(!buildingAt(x,z)||Math.abs(localPoint(buildingAt(x,z),x,z).x)>1.15||Math.abs(localPoint(buildingAt(x,z),x,z).z)>.9)){toast('Stelle Möbel ins Haus oder in den Stall. 🏡');return false;}
 if(isBuilding({type})&&data.objects.some(o=>o.id!==id&&(isBuilding(o)?Math.hypot(x-o.x,z-o.z)<4.4:Math.hypot(x-o.x,z-o.z)<2))){toast('Hier steht schon etwas. Suche einen freien Platz.');return false;}return true;}
function create(o){const g=new T.Group();g.position.set(o.x,0,o.z);g.rotation.y=o.rotation||0;g.userData.id=o.id;g.userData.parts=[];const color=o.color||colors[0];
 if(isBuilding(o)){
 const barn=o.type==='barn',wall=barn?(o.color||'#cf7c77'):color;box(g,0,.08,0,3.8,.16,3.3,'#ddc6a3');
 box(g,0,1,-1.55,3.8,1.9,.13,wall);box(g,-1.83,1,0,.13,1.9,3.1,wall);box(g,1.83,1,0,.13,1.9,3.1,wall);
 const front=new T.Group();g.add(front);box(front,-1.15,1,1.55,1.5,1.9,.13,wall);box(front,1.15,1,1.55,1.5,1.9,.13,wall);box(front,0,1.7,1.55,.8,.5,.13,wall);
 box(front,1.1,1.1,1.63,.6,.6,.05,'#bce5ee');box(front,-1.1,1.1,1.63,.6,.6,.05,'#bce5ee');
 const roof=new T.Group();g.add(roof);const r1=box(roof,-1,2.28,0,2.2,.17,3.65,barn?'#8e635e':'#bb8eaa');r1.rotation.z=.4;const r2=box(roof,1,2.28,0,2.2,.17,3.65,barn?'#8e635e':'#bb8eaa');r2.rotation.z=-.4;
 g.userData.roof=roof;g.userData.front=front;roof.visible=front.visible=!inside;
 if(barn){box(g,-1.1,.35,-.9,.8,.6,.7,'#e6c86c');box(g,1.1,.35,-.9,.8,.6,.7,'#e6c86c');}else{box(g,1.05,2.65,-.8,.35,.9,.4,'#dbb9a1');}
 }else if(o.type==='tree'){tree(g,0,0,.95);}
 else if(o.type==='flowers'){for(let i=0;i<5;i++){const x=(i%3-.8)*.23,z=(Math.floor(i/3)-.5)*.3;cylinder(g,x,.18,z,.015,.015,.36,'#639c55');ball(g,x,.38,z,.11,['#f1a8bf','#ffe899','#c9b7ed'][i%3]);}}
 else if(o.type==='fence'){for(const x of [-.65,.65])box(g,x,.45,0,.12,.9,.13,'#ead4ae');box(g,0,.32,0,1.5,.12,.1,'#ead4ae');box(g,0,.65,0,1.5,.12,.1,'#ead4ae');}
 else if(o.type==='trough'){box(g,0,.15,0,1.2,.3,.7,'#bb8c61');box(g,0,.31,0,1,.05,.5,'#a9c863');for(let i=0;i<5;i++){const carrot=box(g,(i-2)*.18,.36,0,.1,.08,.3,'#f0a65d');carrot.rotation.y=.6;}}
 else if(o.type==='bed'){box(g,0,.23,0,1,.4,1.6,'#c49c7c');box(g,0,.46,0,.95,.18,1.5,'#fff5db');box(g,0,.59,-.55,.68,.13,.33,'#fffdf0');box(g,0,.58,.2,.97,.12,.92,color);box(g,0,.55,-.83,1,.8,.1,'#c49c7c');}
 else if(o.type==='sofa'){box(g,0,.25,0,1.6,.5,.75,color);box(g,0,.7,-.33,1.6,.75,.18,color);for(const x of [-.73,.73])box(g,x,.5,0,.18,.65,.8,color);box(g,0,.55,.04,1.25,.13,.55,'#fff0dc');}
 else if(o.type==='table'){box(g,0,.65,0,1.1,.12,.8,'#e7c49a');for(const x of [-.43,.43])for(const z of [-.28,.28])box(g,x,.3,z,.09,.6,.09,'#bd9271');}
 else if(o.type==='chair'){box(g,0,.4,0,.5,.1,.5,color);box(g,0,.7,-.22,.5,.6,.09,color);for(const x of [-.19,.19])for(const z of [-.19,.19])box(g,x,.2,z,.06,.4,.06,'#b49178');}
 else if(o.type==='rug'){box(g,0,.025,0,1.4,.04,1,color);box(g,0,.051,0,1.1,.015,.75,'#fff1d0');}
 else if(o.type==='lamp'){cylinder(g,0,.055,0,.23,.23,.1,'#a0886b');cylinder(g,0,.65,0,.035,.035,1.2,'#a0886b');const bulb=new T.Mesh(new T.CylinderGeometry(.24,.4,.4,12),new T.MeshStandardMaterial({color:o.color||'#ffe9a4',emissive:o.lit?0xffce65:0x000000,emissiveIntensity:.8}));bulb.position.y=1.3;g.add(bulb);g.userData.bulb=bulb;const glow=new T.Mesh(new T.CircleGeometry(.65,24),new T.MeshBasicMaterial({color:'#ffe49a',transparent:true,opacity:.35,depthWrite:false}));glow.rotation.x=-Math.PI/2;glow.position.y=.06;glow.visible=!!o.lit;g.add(glow);g.userData.glow=glow;}
 else if(animals.has(o.type)){
 const bunny=o.type==='bunny',horse=o.type==='horse',cow=o.type==='cow';const skin=horse?'#be906e':cow?'#fff7e4':bunny?'#d6beb0':'#fffae9';const scale=bunny?.65:horse?1.1:1;
 g.scale.setScalar(scale);ball(g,0,.62,0,.46,skin,1,1,1.3);ball(g,0,.85,.48,.3,skin,1,.95,1.05);ball(g,0,.72,.72,.18,horse?'#e0b996':skin,1,.65,.8);
 if(o.type==='sheep')for(let i=0;i<9;i++){const a=i*2.4;ball(g,Math.sin(a)*.35,.66+(i%3)*.12,Math.cos(a)*.38,.22,'#fffbea');}
 if(cow){ball(g,-.32,.74,.05,.2,'#6c625f',.5,1,1.4);ball(g,.29,.68,-.23,.19,'#6c625f',.5,1,1.2);}
 for(const x of [-.23,.23])for(const z of [-.28,.28]){const leg=box(g,x,.25,z,.12,.45,.14,horse?'#8b6652':'#b8a490');g.userData.parts.push(leg);}
 for(const x of [-.2,.2]){const ear=ball(g,x,1.04,.44,.13,skin,.65,bunny?2.8:1.2,.5);ear.rotation.z=x>0?-.22:.22;ball(g,x*.8,.91,.69,.033,'#4b4542');}
 ball(g,0,.76,.88,.06,'#dba2a0',1,.7,.5);ball(g,0,.7,-.58,.12,skin);g.userData.walk=Math.random()*6;g.userData.goal=null;
 }
 g.traverse(m=>{if(m.isMesh)m.userData.id=o.id;});scene.add(g);meshes.set(o.id,g);return g;}
function dispose(g){g.traverse(m=>{if(m.geometry)m.geometry.dispose();if(m.material&&!Array.from(materials.values()).includes(m.material))m.material.dispose();});scene.remove(g);}
function rebuild(){for(const g of meshes.values())dispose(g);meshes.clear();for(const o of data.objects)create(o);selected=null;selectionRing.visible=false;update();}
function update(){ $('world-count').textContent=data.objects.length+' Dinge';$('auto-feed').checked=data.autoFeed;$('day-night').textContent=data.night?'🌙 Nacht':'☀ Tag';$('day-night').setAttribute('aria-pressed',data.night);scene.background.set(data.night?'#263953':'#ccebf1');scene.fog.color.copy(scene.background);ambient.intensity=data.night?.65:2.2;sun.intensity=data.night?.3:2.1;
 $('inside-tool').setAttribute('aria-pressed',inside);for(const g of meshes.values()){if(g.userData.roof)g.userData.roof.visible=g.userData.front.visible=!inside;}
 const o=data.objects.find(o=>o.id===selected);if(o){selectionRing.visible=true;selectionRing.position.set(o.x,.07,o.z);selectionRing.scale.setScalar(isBuilding(o)?2.5:1);}
 else selectionRing.visible=false;
 if(o&&animals.has(o.type)){$('animal-info').hidden=false;$('animal-info').textContent=(catalog.animals.find(a=>a[0]===o.type)[1])+' '+(o.hunger<40?'Ich habe Hunger 🥕':'Mir geht es gut 💚');}else $('animal-info').hidden=true;
}
function setTool(value){tool=value;placement=null;for(const b of document.querySelectorAll('.world-tools button'))b.classList.toggle('selected',b.id===value+'-tool');document.querySelectorAll('.world-item').forEach(b=>b.classList.remove('selected'));$('world-tip').textContent=({view:'Tippe auf ein Tier oder eine Lampe. Ziehen dreht die Welt.',move:'Tippe auf ein Ding, dann auf seinen neuen Platz.',feed:'Tippe auf ein Tier, um es zu füttern.',remove:'Tippe auf das Ding, das du wegnehmen möchtest.'})[value]||'Wähle etwas aus.';}
function palette(category){$('world-palette').replaceChildren();for(const [type,emoji,name]of catalog[category]){const b=document.createElement('button');b.className='world-item';b.innerHTML='<span>'+emoji+'</span>'+name;b.onclick=()=>{setTool('place');placement=type;document.querySelectorAll('.world-item').forEach(x=>x.classList.toggle('selected',x===b));$('world-tip').textContent=name+': Tippe auf einen freien Platz'+(furniture.has(type)?' im Haus.':'.');if(furniture.has(type)){inside=true;update();}};$('world-palette').append(b);}document.querySelectorAll('[data-category]').forEach(b=>{const active=b.dataset.category===category;b.classList.toggle('selected',active);b.setAttribute('aria-selected',active);});}
function pick(x,y){const r=renderer.domElement.getBoundingClientRect();pointer.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(Array.from(meshes.values()),true).filter(h=>h.object.visible&&h.object.parent.visible);const floor=ray.intersectObject(ground)[0];return {id:hits[0]?.object.userData.id,point:floor?.point};}
function heart(o){toast('Mmm, lecker! '+catalog.animals.find(a=>a[0]===o.type)[1]+' 💚');}
function tap(x,y){const hit=pick(x,y),o=data.objects.find(o=>o.id===hit.id);const p=hit.point;if(placement&&p){const px=Math.round(p.x*2)/2,pz=Math.round(p.z*2)/2;if(!validPosition(placement,px,pz))return;if(data.objects.length>=100){toast('Deine Welt ist voll! Du kannst Dinge verschieben.');return;}checkpoint();const entry={id:nextId++,type:placement,x:px,z:pz,rotation,color:colors[0],lit:true,hunger:100};data.objects.push(entry);create(entry);selected=entry.id;save();update();if(data.objects.length%5===0)toast('✨ Deine Welt wächst! '+data.objects.length+' Dinge ✨');return;}
 if(tool==='move'&&selected&&p&&(!o||o.id!==selected)){const entry=data.objects.find(o=>o.id===selected),px=Math.round(p.x*2)/2,pz=Math.round(p.z*2)/2;if(!validPosition(entry.type,px,pz,entry.id))return;checkpoint();const dx=px-entry.x,dz=pz-entry.z;const attached=isBuilding(entry)?data.objects.filter(a=>a.id!==entry.id&&furniture.has(a.type)&&buildingAt(a.x,a.z)?.id===entry.id):[];entry.x=px;entry.z=pz;for(const a of attached){a.x+=dx;a.z+=dz;meshes.get(a.id).position.set(a.x,0,a.z);}meshes.get(entry.id).position.set(px,0,pz);selected=null;save();update();toast('Neuer Platz! ✨');return;}
 if(!o){selected=null;update();return;}selected=o.id;
 if(tool==='remove'){checkpoint();const attached=isBuilding(o)?data.objects.filter(a=>furniture.has(a.type)&&buildingAt(a.x,a.z)?.id===o.id).map(a=>a.id):[];data.objects=data.objects.filter(a=>a.id!==o.id&&!attached.includes(a.id));rebuild();save();toast('Weggenommen. Rückgängig bringt es zurück.');return;}
 if(tool==='feed'){if(animals.has(o.type)){checkpoint();o.hunger=100;heart(o);save();}else toast('Wähle ein Tier zum Füttern 🥕');}
 else if(tool==='view'&&o.type==='lamp'){checkpoint();o.lit=!o.lit;const g=meshes.get(o.id);g.userData.bulb.material.emissive.set(o.lit?0xffce65:0x000000);g.userData.glow.visible=o.lit;save();toast(o.lit?'Licht an 💡':'Licht aus');}
 update();}
function cameraUpdate(){const w=viewport.clientWidth,h=viewport.clientHeight,aspect=w/h,span=Math.max(10,13/aspect)/zoom;camera.left=-span*aspect;camera.right=span*aspect;camera.top=span;camera.bottom=-span;camera.position.set(Math.sin(azimuth)*20,20,Math.cos(azimuth)*20);camera.lookAt(target);camera.updateProjectionMatrix();}
function resize(){renderer.setSize(viewport.clientWidth,viewport.clientHeight,false);cameraUpdate();}new ResizeObserver(resize).observe(viewport);
const touches=new Map();let gesture=null;
renderer.domElement.addEventListener('pointerdown',e=>{renderer.domElement.setPointerCapture(e.pointerId);touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.size===1)gesture={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};else{gesture.moved=true;const ps=Array.from(touches.values());gesture.distance=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y);}});
renderer.domElement.addEventListener('pointermove',e=>{if(!touches.has(e.pointerId)||!gesture)return;touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.size===2){const ps=Array.from(touches.values()),d=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y);if(gesture.distance)zoom=Math.max(.6,Math.min(2.8,zoom*d/gesture.distance));gesture.distance=d;cameraUpdate();}else{if(Math.hypot(e.clientX-gesture.startX,e.clientY-gesture.startY)>8)gesture.moved=true;if(gesture.moved){azimuth-=(e.clientX-gesture.x)*.008;cameraUpdate();}gesture.x=e.clientX;gesture.y=e.clientY;}});
function pointerEnd(e){if(!touches.has(e.pointerId))return;const clicked=touches.size===1&&gesture&&!gesture.moved;touches.delete(e.pointerId);if(clicked)tap(e.clientX,e.clientY);if(touches.size===0)gesture=null;else if(gesture)gesture.moved=true;}
renderer.domElement.addEventListener('pointerup',pointerEnd);renderer.domElement.addEventListener('pointercancel',e=>{touches.delete(e.pointerId);gesture=null;});
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.6,Math.min(2.8,zoom*(e.deltaY>0?.93:1.07)));cameraUpdate();},{passive:false});
for(const dir of ['left','right'])$('camera-'+dir).onclick=()=>{azimuth+=(dir==='left'?-.35:.35);cameraUpdate();};
$('zoom-in').onclick=()=>{zoom=Math.min(2.8,zoom*1.2);cameraUpdate();};$('zoom-out').onclick=()=>{zoom=Math.max(.6,zoom/1.2);cameraUpdate();};$('camera-home').onclick=()=>{zoom=1;azimuth=.72;cameraUpdate();};
document.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>palette(b.dataset.category));
for(const t of ['view','move','feed','remove'])$(t+'-tool').onclick=()=>setTool(t);
$('rotate-tool').onclick=()=>{if(placement){rotation+=Math.PI/2;toast('Nächster Gegenstand gedreht ↻');return;}const o=data.objects.find(o=>o.id===selected);if(!o){toast('Tippe zuerst auf ein Ding.');return;}if(isBuilding(o)&&data.objects.some(a=>furniture.has(a.type)&&buildingAt(a.x,a.z)?.id===o.id)){toast('Verschiebe zuerst die Möbel, dann drehe das Haus.');return;}checkpoint();o.rotation=(o.rotation||0)+Math.PI/2;meshes.get(o.id).rotation.y=o.rotation;save();};
$('color-tool').onclick=()=>{const o=data.objects.find(o=>o.id===selected);if(!o||animals.has(o.type)||['tree','flowers','fence','trough','table'].includes(o.type)){toast('Wähle ein Haus oder ein Möbelstück für die Farbe.');return;}checkpoint();o.color=colors[(colors.indexOf(o.color)+1)%colors.length];dispose(meshes.get(o.id));meshes.delete(o.id);create(o);save();update();};
$('undo-tool').onclick=()=>{if(!history.length){toast('Noch nichts zum Rückgängigmachen.');return;}data=JSON.parse(history.pop());rebuild();save();toast('Zurück! ↶');};
$('inside-tool').onclick=()=>{inside=!inside;update();toast(inside?'Dach geöffnet – richte dein Haus ein!':'Dach wieder geschlossen');};
$('auto-feed').onchange=e=>{data.autoFeed=e.target.checked;save();};$('save-world').onclick=()=>save(false);
$('day-night').onclick=()=>{data.night=!data.night;update();save();};
let audioCtx,music=false,musicTimer,noteIndex=0;
function note(){if(!music||document.hidden)return;const notes=[60,64,67,72,67,64,62,65,69,74,69,65,59,62,67,71];const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),t=audioCtx.currentTime;osc.type='sine';osc.frequency.value=440*Math.pow(2,(notes[noteIndex++%notes.length]-69)/12);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.055,t+.03);gain.gain.exponentialRampToValueAtTime(.001,t+.65);osc.connect(gain);gain.connect(audioCtx.destination);osc.start(t);osc.stop(t+.7);}
$('world-music').onclick=()=>{if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();audioCtx.resume();music=!music;$('world-music').textContent=music?'♫ Musik an':'♫ Musik aus';$('world-music').setAttribute('aria-pressed',music);clearInterval(musicTimer);if(music){note();musicTimer=setInterval(note,400);}};
try{const stored=JSON.parse(localStorage.getItem(KEY));if(stored?.version===1&&Array.isArray(stored.objects)){const types=new Set(Object.values(catalog).flat().map(a=>a[0]));data={version:1,night:!!stored.night,autoFeed:stored.autoFeed!==false,objects:stored.objects.slice(0,100).filter(o=>types.has(o.type)&&Number.isFinite(o.x)&&Number.isFinite(o.z)&&Number.isInteger(o.id)).map(o=>({...o,x:Math.max(-8,Math.min(8,o.x)),z:Math.max(-8,Math.min(8,o.z)),rotation:Number.isFinite(o.rotation)?o.rotation:0,hunger:Number.isFinite(o.hunger)?Math.max(0,Math.min(100,o.hunger)):100,color:/^#[0-9a-f]{6}$/i.test(o.color)?o.color:colors[0]}))};}}
catch(e){/* A fresh meadow remains usable if browser storage is unavailable. */}
if(!data.objects.length){data.objects=[{id:1,type:'bunny',x:2,z:2,hunger:100,rotation:0},{id:2,type:'trough',x:3.5,z:2,rotation:0},{id:3,type:'flowers',x:-3,z:3,rotation:0}];}
nextId=Math.max(0,...data.objects.map(o=>o.id))+1;rebuild();palette('build');resize();$('world-loading').hidden=true;save();
let last=performance.now(),saveTime=0;
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;if(document.hidden)return;
 for(const o of data.objects){if(!animals.has(o.type))continue;const g=meshes.get(o.id);o.hunger=Math.max(0,(o.hunger??100)-dt*.1);const troughs=data.objects.filter(a=>a.type==='trough');const near=troughs.find(a=>Math.hypot(o.x-a.x,o.z-a.z)<1.2);if(data.autoFeed&&near&&o.hunger<85)o.hunger=Math.min(100,o.hunger+dt*12);
 if(data.autoFeed&&o.hunger<55&&troughs.length){const a=troughs.reduce((a,b)=>Math.hypot(o.x-a.x,o.z-a.z)<Math.hypot(o.x-b.x,o.z-b.z)?a:b);g.userData.goal={x:a.x+.7,z:a.z};}
 if(!g.userData.goal){g.userData.goal={x:Math.max(-8,Math.min(8,o.x+(Math.random()-.5)*4)),z:Math.max(-8,Math.min(8,o.z+(Math.random()-.5)*4))};g.userData.pause=Math.random()*3;}
 if(g.userData.pause>0){g.userData.pause-=dt;continue;}const goal=g.userData.goal,dx=goal.x-o.x,dz=goal.z-o.z,dist=Math.hypot(dx,dz);if(dist<.15){g.userData.goal=null;continue;}
 const nx=o.x+dx/dist*dt*.32,nz=o.z+dz/dist*dt*.32;if(buildingAt(nx,nz)&&!buildingAt(o.x,o.z)){g.userData.goal=null;g.userData.pause=1;continue;}o.x=nx;o.z=nz;o.rotation=Math.atan2(dx,dz);g.position.set(o.x,Math.sin(now*.008)*.018,o.z);g.rotation.y=o.rotation;g.userData.parts.forEach((leg,i)=>leg.rotation.x=Math.sin(now*.006+(i%2)*Math.PI)*.2);
 if(selected===o.id)selectionRing.position.set(o.x,.07,o.z);
 }
 saveTime+=dt;if(saveTime>10){saveTime=0;save();update();}renderer.render(scene,camera);
}requestAnimationFrame(frame);
document.addEventListener('visibilitychange',()=>{last=performance.now();if(document.hidden){save();if(audioCtx)audioCtx.suspend();}else if(audioCtx&&music)audioCtx.resume();});window.addEventListener('pagehide',()=>save());
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
