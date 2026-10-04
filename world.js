(() => {
'use strict';
const $=id=>document.getElementById(id),viewport=$('world-viewport'),R=window.NayaWorldRules,T=window.THREE,KEY='naya-world-v1';
function fallback(){ $('world-fallback').hidden=false;$('world-loading').hidden=true; }
if(!R||!T){fallback();return;}
const catalog={build:[['house','🏡','Haus'],['barn','🚜','Stall']],animals:[['sheep','🐑','Schaf'],['cow','🐄','Kuh'],['bunny','🐇','Hase'],['horse','🐴','Pferd']],garden:[['pasture','🥕','Weide'],['tree','🌳','Baum'],['flowers','🌷','Blumen'],['fence','🪵','Zaun'],['trough','🥕','Futter']],home:[['bed','🛏️','Bett'],['sofa','🛋️','Sofa'],['table','🪑','Tisch'],['chair','💺','Stuhl'],['lamp','💡','Lampe'],['rug','🌈','Teppich']]};
const allTypes=new Set(Object.values(catalog).flat().map(a=>a[0])),animals=R.animals,furniture=R.furniture,colors=['#f6dba8','#edb0c4','#a8d7db','#b6d49d','#c6bbe5'];
let data={version:1,objects:[],night:false,autoFeed:true},nextId=1,history=[],selected=null,size=3,category='build',gesture=null,drag=null,ghost=null,ghostState=null;
let renderer;try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'low-power'});}catch(e){fallback();return;}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
renderer.domElement.setAttribute('aria-label','Nayas 3D-Welt: Dinge ziehen, antippen und bauen');viewport.prepend(renderer.domElement);
const scene=new T.Scene(),camera=new T.OrthographicCamera(-10,10,10,-10,.1,120),meshes=new Map(),openRoofs=new Set();
scene.background=new T.Color('#c9e8ea');scene.fog=new T.Fog('#c9e8ea',48,90);
const ambient=new T.HemisphereLight(0xfff6e3,0x7eaa73,1.6);scene.add(ambient);
const sun=new T.DirectionalLight(0xffedcf,1.6);sun.position.set(-12,25,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-17;sun.shadow.camera.right=17;sun.shadow.camera.top=17;sun.shadow.camera.bottom=-17;sun.shadow.camera.far=60;sun.shadow.bias=-.0015;sun.shadow.normalBias=.025;scene.add(sun);
const materials=new Map(),geometryCache=new Map();
function material(color){if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.85}));return materials.get(color);}
function mesh(parent,geo,color,x=0,y=0,z=0){const m=new T.Mesh(geo,material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function roundedGeometry(w,h,d,r=.08){r=Math.min(r,w/2-.001,h/2-.001,d/2-.001);const key=[w,h,d,r].join(',');if(geometryCache.has(key))return geometryCache.get(key);const shape=new T.Shape(),a=w/2-r,b=h/2-r;shape.moveTo(-a,-b-r);shape.lineTo(a,-b-r);shape.quadraticCurveTo(a+r,-b-r,a+r,-b);shape.lineTo(a+r,b);shape.quadraticCurveTo(a+r,b+r,a,b+r);shape.lineTo(-a,b+r);shape.quadraticCurveTo(-a-r,b+r,-a-r,b);shape.lineTo(-a-r,-b);shape.quadraticCurveTo(-a-r,-b-r,-a,-b-r);const geo=new T.ExtrudeGeometry(shape,{depth:d-2*r,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:r,bevelThickness:r,curveSegments:4});geo.translate(0,0,-(d-2*r)/2);geo.scale(w/(w+2*r),h/(h+2*r),1);geometryCache.set(key,geo);return geo;}
function box(p,x,y,z,w,h,d,c,r=.06){return mesh(p,roundedGeometry(w,h,d,r),c,x,y,z);}
const sphere=new T.SphereGeometry(1,20,14);
function ball(p,x,y,z,r,c,sx=1,sy=1,sz=1){const m=mesh(p,sphere,c,x,y,z);m.scale.set(r*sx,r*sy,r*sz);return m;}
function cylinder(p,x,y,z,rt,rb,h,c){const key=['c',rt,rb,h].join(',');if(!geometryCache.has(key))geometryCache.set(key,new T.CylinderGeometry(rt,rb,h,16));return mesh(p,geometryCache.get(key),c,x,y,z);}
function shadow(p,w,d){const m=new T.Mesh(new T.CircleGeometry(1,24),new T.MeshBasicMaterial({color:'#4c7552',transparent:true,opacity:.12,depthWrite:false}));m.rotation.x=-Math.PI/2;m.scale.set(w,d,1);m.position.y=.025;m.userData.ownGeometry=true;m.userData.ownMaterial=true;p.add(m);return m;}
function tree(p,x,z,scale=1){const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(scale);p.add(g);shadow(g,.75,.7);cylinder(g,0,.65,0,.13,.22,1.3,'#b5906b');const branch=cylinder(g,-.15,1.06,0,.055,.09,.6,'#b5906b');branch.rotation.z=.7;ball(g,0,1.77,0,.72,'#83b96b',1.05,1.2,1);ball(g,-.43,1.55,.04,.49,'#a0c878');ball(g,.41,1.64,.07,.51,'#b5d48b');for(let i=0;i<3;i++)ball(g,Math.sin(i*2)*.5,1.72+Math.cos(i)*.16,.49,.09,'#eab081');return g;}
const land=new T.Group();scene.add(land);box(land,0,-.48,0,24,.85,24,'#b4c593',.32);box(land,0,-.06,0,24,.13,24,'#509a42',.06);
// Subtle green patches, daisies and all trees sit on the meadow.
for(let i=0;i<65;i++){const x=Math.sin(i*71.83)*10.9,z=Math.cos(i*33.57)*10.9;const tuft=new T.Group();tuft.position.set(x,.01,z);land.add(tuft);for(let j=0;j<3;j++){const blade=box(tuft,(j-1)*.045,.065,0,.035,.12,.025,i%2?'#99c367':'#b8d58c',.009);blade.rotation.z=(j-1)*.3;}}
const ground=new T.Mesh(new T.PlaneGeometry(24,24),new T.MeshBasicMaterial({visible:false}));ground.rotation.x=-Math.PI/2;scene.add(ground);
const grid=new T.GridHelper(23.8,17,'#7b9b57','#7b9b57');grid.position.y=.021;grid.material.transparent=true;grid.material.opacity=.18;grid.visible=false;scene.add(grid);
function fenceSide(g,width,z,color='#ead7ad',gate=false){const count=Math.ceil(width/.8);for(let i=0;i<=count;i++){const x=-width/2+width*i/count;if(gate&&Math.abs(x)<.65)continue;box(g,x,.34,z,.11,.68,.11,color);ball(g,x,.71,z,.065,color);}
 if(gate){const side=(width-1.45)/2;for(const x of [-(width+1.45)/4,(width+1.45)/4])for(const y of [.25,.52])box(g,x,y,z,side,.095,.09,color);}else for(const y of [.25,.52])box(g,0,y,z,width,.095,.09,color);}
function makeObject(o){const g=new T.Group();g.position.set(o.x||0,0,o.z||0);g.rotation.y=o.rotation||0;g.userData.id=o.id;g.userData.legs=[];const d=R.dimensions(o),color=o.color||colors[0];
 if(o.type==='house'||o.type==='barn'){
 const barn=o.type==='barn',w=d.w,depth=d.d,wall=barn?(o.color||'#d69582'):color,height=1.65,door=barn?1.65:1.05;
 shadow(g,w*.59,depth*.56);box(g,0,.055,0,w,.12,depth,'#e4cbaa');
 box(g,0,.89,-depth/2+.09,w,1.68,.18,wall);box(g,-w/2+.09,.89,0,.18,1.68,depth,wall);box(g,w/2-.09,.89,0,.18,1.68,depth,wall);
 // Painted timber trim, windows and a wide open stall entrance.
 const facade=new T.Group();g.add(facade);const side=(w-door)/2;
 box(facade,-(w+door)/4,.87,depth/2-.09,side,1.65,.18,wall);box(facade,(w+door)/4,.87,depth/2-.09,side,1.65,.18,wall);box(facade,0,1.61,depth/2-.09,door,.22,.18,wall);
 const win=(x,z,rotate=false)=>{const q=new T.Group();q.position.set(x,1.02,z);if(rotate)q.rotation.y=Math.PI/2;g.add(q);box(q,0,0,0,.7,.72,.13,'#fff4df');box(q,0,0,.085,.51,.53,.05,'#a8dce3');box(q,0,0,.13,.05,.54,.025,'#fff4df');box(q,0,0,.13,.52,.05,.025,'#fff4df');box(q,0,-.4,.08,.85,.12,.27,'#e5b795');};
 if(!barn){if(side>.9)win((w+door)/4,depth/2+.02);win(w/2+.02,0,true);}else{for(const x of [-w/2+.24,w/2-.24])box(g,x,.95,0,.08,1.7,depth-.12,'#ffe9cc');}
 for(const x of [-door/2,door/2])box(facade,x,.82,depth/2+.05,.12,1.64,.17,'#fff0d6');box(facade,0,1.69,depth/2+.05,door+.12,.12,.17,'#fff0d6');
 if(barn){for(const x of [-door*.72,door*.72]){const doorMesh=box(facade,x,.7,depth/2+.13,.55,1.3,.11,'#b36b64');box(facade,x,.7,depth/2+.21,.45,.07,.04,'#ffe9ce');}}
 const roof=new T.Group();g.add(roof);const slope=.42,half=w/2+.18,len=half/Math.cos(slope),roofColor=barn?'#b97770':'#b497c5';
 for(const sign of [-1,1]){const r=box(roof,sign*half/2,1.8+half/2*Math.tan(slope),0,len,.15,depth+.5,roofColor);r.rotation.z=-sign*slope;
 for(let j=1;j<5;j++){const tile=box(roof,sign*half/2,1.9+half/2*Math.tan(slope),(j/5-.5)*(depth+.5),len,.055,.06,barn?'#ca9186':'#c5acd2',.02);tile.rotation.z=-sign*slope;}}
 box(roof,0,1.87+half*Math.tan(slope),0,.18,.16,depth+.55,barn?'#c48a7f':'#c0a5ce');
 if(!barn)box(roof,w/4,2.23,-depth/4,.38,.8,.4,'#f1d5b1');
 else {for(const x of [-w*.28,w*.28]){box(g,x,.29,-depth*.29,.68,.45,.58,'#e7c879');for(let i=0;i<4;i++)box(g,x+(i-1.5)*.12,.53,-depth*.29,.04,.045,.57,'#cfb163',.01);}}
 g.userData.roof=roof;g.userData.facade=facade;
 }else if(o.type==='pasture'){
 box(g,0,.035,0,d.w,.07,d.d,'#96c763');fenceSide(g,d.w,-d.d/2);fenceSide(g,d.w,d.d/2,'#ead7ad',true);
 for(const x of [-d.w/2,d.w/2]){const side=new T.Group();side.position.x=x;side.rotation.y=Math.PI/2;g.add(side);fenceSide(side,d.d,0);}
 for(let i=0;i<9;i++){const x=Math.sin(i*7.3)*(d.w/2-.5),z=Math.cos(i*4.1)*(d.d/2-.5);for(let j=0;j<3;j++){const sprout=ball(g,x+(j-1)*.07,.16,z,.075,'#76ae50',.4,1.8,.4);sprout.rotation.z=(j-1)*.3;}if(i%2===0){ball(g,x,.09,z,.085,'#eda563',.7,.6,1.3);ball(g,x,.14,z-.09,.055,'#639d48',.7,1,.7);}}
 }else if(o.type==='tree')tree(g,0,0);
 else if(o.type==='flowers'){shadow(g,.43,.36);for(let i=0;i<5;i++){const x=(i%3-1)*.21,z=(Math.floor(i/3)-.5)*.27;cylinder(g,x,.21,z,.02,.02,.42,'#7fac65');for(let j=0;j<5;j++)ball(g,x+Math.sin(j*1.26)*.07,.43,z+Math.cos(j*1.26)*.07,.055,['#eaa8b4','#f9db8b','#c5a5d2'][i%3]);ball(g,x,.46,z,.045,'#f7e6a6');}}
 else if(o.type==='fence')fenceSide(g,1.5,0);
 else if(o.type==='trough'){shadow(g,.72,.44);box(g,0,.15,0,1.2,.3,.7,'#c69a6d');box(g,0,.315,0,1.02,.04,.52,'#b5c975');for(let i=0;i<5;i++){const c=ball(g,(i-2)*.18,.37,0,.095,'#efa765',.5,.55,1.7);c.rotation.y=.4;ball(g,(i-2)*.18,.41,-.13,.055,'#699e50',1,.6,1);}}
 else if(o.type==='bed'){shadow(g,.65,1);box(g,0,.23,0,1,.38,1.65,'#cbaa86');box(g,0,.47,0,.98,.18,1.58,'#fff8e5');box(g,0,.59,-.55,.71,.14,.34,'#fffdf0');box(g,0,.58,.23,.99,.16,1.04,color);box(g,0,.53,-.82,1,.91,.1,'#cbaa86');for(let i=0;i<4;i++)box(g,(i-1.5)*.18,.675,.25,.035,.02,.78,'#fff4db',.005);}
 else if(o.type==='sofa'){shadow(g,.9,.55);box(g,0,.28,0,1.5,.42,.8,color);box(g,0,.69,-.3,1.5,.8,.19,color);for(const x of [-.68,.68])box(g,x,.48,0,.18,.65,.82,color);for(const x of [-.29,.29])box(g,x,.51,.06,.55,.18,.6,'#fff0dc');ball(g,-.39,.77,-.1,.19,'#e7bd94',1,1,.45);}
 else if(o.type==='table'){shadow(g,.62,.45);box(g,0,.66,0,1,.14,.8,'#e3c398');for(const x of [-.38,.38])for(const z of [-.28,.28])box(g,x,.31,z,.1,.62,.1,'#b99472');ball(g,0,.78,0,.12,'#e0a79f',1,.45,1);}
 else if(o.type==='chair'){shadow(g,.37,.35);box(g,0,.41,0,.5,.1,.5,color);box(g,0,.71,-.22,.5,.6,.1,color);for(const x of [-.18,.18])for(const z of [-.18,.18])box(g,x,.21,z,.065,.4,.065,'#bba080',.015);}
 else if(o.type==='rug'){box(g,0,.035,0,1.5,.055,1.2,color,.02);box(g,0,.066,0,1.2,.018,.91,'#fff0d1',.005);ball(g,0,.08,0,.22,color,1,.04,1);}
 else if(o.type==='lamp'){cylinder(g,0,.055,0,.23,.23,.1,'#bd9e75');cylinder(g,0,.65,0,.034,.034,1.2,'#bd9e75');const shade=cylinder(g,0,1.28,0,.22,.35,.38,o.color||'#fff0b7');shade.material=material(o.color||'#fff0b7').clone();shade.userData.ownMaterial=true;shade.material.emissive.set(o.lit?0xffd47a:0x000000);shade.material.emissiveIntensity=.65;const glow=shadow(g,.75,.75);glow.material.color.set('#ffdf85');glow.material.opacity=.55;glow.visible=o.lit!==false;g.userData.glow=glow;g.userData.bulb=shade;}
 else if(animals.has(o.type)){
 const bunny=o.type==='bunny',cow=o.type==='cow',horse=o.type==='horse',sheep=o.type==='sheep',skin=horse?'#bc9577':bunny?'#e6cab3':cow?'#fff6e7':'#fffbea',feet=horse?'#7d6958':'#c9b8a0';
 const body=new T.Group();g.add(body);g.userData.body=body;shadow(g,bunny?.38:.6,bunny?.42:.72);if(bunny)body.scale.setScalar(.72);
 ball(body,0,.59,-.05,.4,skin,1,.95,1.35);
 if(sheep){for(let i=0;i<18;i++){const a=i*2.4,y=.55+(i%3)*.15;ball(body,Math.sin(a)*.3,y,Math.cos(a)*.38-.07,.19,'#fff9e6');}}
 if(cow){ball(body,-.32,.69,-.19,.19,'#80736b',.4,1,1.25);ball(body,.31,.55,.08,.21,'#80736b',.4,1,1);}
 for(const x of [-.22,.22])for(const z of [-.29,.23]){const leg=new T.Group();leg.position.set(x,.43,z);body.add(leg);cylinder(leg,0,-.15,0,.065,.08,.31,skin);ball(leg,0,-.29,.025,.083,feet,1,.65,1.2);g.userData.legs.push(leg);}
 const head=new T.Group();head.position.set(0,.92,.4);body.add(head);g.userData.head=head;
 ball(head,0,.02,0,.29,skin,1,horse?1.15:1,1.02);ball(head,0,-.08,.22,.19,cow?'#eab8aa':horse?'#ddba9b':'#f5decc',1.15,.7,.72);
 for(const x of [-.22,.22]){const ear=ball(head,x,.19,.01,.13,skin,.55,bunny?2.4:1.05,.42);ear.rotation.z=x>0?-.45:.45;ball(head,x,.19,.049,.08,bunny?'#dfa6a1':'#dab3a1',.5,bunny?2.5:1,.25);
 // Wide dark eyes and light glints face forward instead of staring sideways.
 ball(head,x*.64,.075,.246,.067,'#fffdf2',1,1,.44);ball(head,x*.64,.072,.273,.045,'#454747',1,1,.45);ball(head,x*.64-.009,.089,.292,.014,'#fffdf5');ball(head,x*.89,-.08,.22,.056,'#edbcb0',1,.65,.3);
 if(cow||horse)ball(head,x*.35,-.07,.365,.026,'#9d7668',1,.65,.45);}
 if(bunny||sheep){ball(head,0,-.05,.367,.035,'#bd8e85',1,.7,.45);}
 if(cow)for(const x of [-.19,.19]){const horn=cylinder(head,x,.29,-.03,.015,.052,.19,'#e2cda2');horn.rotation.z=x>0?-.2:.2;}
 if(horse){for(let i=0;i<6;i++)ball(body,0,1.02-i*.07,.27-i*.03,.09,'#897361',.7,1,1);for(let i=0;i<3;i++)ball(body,0,.49-i*.07,-.61,.07,'#897361',.7,1,1);}
 else ball(body,0,.63,-.61,bunny?.13:.075,skin);g.userData.goal=null;g.userData.pause=Math.random()*1.5;g.userData.phase=Math.random()*6;const hit=new T.Mesh(sphere,new T.MeshBasicMaterial({visible:false}));hit.scale.set(.72,.75,.85);hit.position.y=.58;hit.userData.ownMaterial=true;g.add(hit);
 }
 g.traverse(m=>{if(m.isMesh)m.userData.id=o.id;});return g;}
function dispose(g){g.traverse(m=>{if(m.userData.ownGeometry)m.geometry.dispose();if(m.userData.ownMaterial)m.material.dispose();});g.removeFromParent();}
function create(o){const g=makeObject(o);scene.add(g);meshes.set(o.id,g);return g;}
function replace(o){const g=meshes.get(o.id);if(g)dispose(g);meshes.delete(o.id);create(o);}
function saved(silent=true){try{localStorage.setItem(KEY,JSON.stringify(data));$('save-state').textContent='☁ ✓';$('save-state').setAttribute('aria-label','Welt auf diesem Gerät gespeichert');}catch(e){$('save-state').textContent='☁ !';$('save-state').setAttribute('aria-label','Speichern nicht möglich');if(!silent)toast('☁ ❗','Speichern ist gerade nicht möglich.');}}
function checkpoint(){history.push(JSON.stringify(data));if(history.length>25)history.shift();$('undo').disabled=false;}
function rebuild(){for(const g of meshes.values())dispose(g);meshes.clear();data.objects.forEach(create);selected=null;openRoofs.clear();update();}
let toastTimer;
function toast(icons,words){$('world-toast').textContent=icons;$('world-toast').setAttribute('aria-label',words||icons);$('world-toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('world-toast').classList.remove('show'),1700);}
let audioCtx,music=false,musicTimer,noteIndex=0;
function unlock(){try{if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();}catch(e){}}
function tone(f=660){if(!audioCtx)return;const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),t=audioCtx.currentTime;osc.type='sine';osc.frequency.setValueAtTime(f,t);osc.frequency.exponentialRampToValueAtTime(f*1.4,t+.1);gain.gain.setValueAtTime(.035,t);gain.gain.exponentialRampToValueAtTime(.001,t+.2);osc.connect(gain);gain.connect(audioCtx.destination);osc.start(t);osc.stop(t+.21);}
function error(reason){tone(220);const info={edge:['🌱 ↩️','Bleib auf der Wiese.'],inside:['🏡 → 🛏️','Ziehe die Möbel in ein Haus.'],occupied:['✋ ↔️','Hier steht schon etwas. Nimm einen freien Platz.'],limit:['🏡 🐑 💚','Deine Welt ist voll. Du kannst Dinge verschieben.']};const [icons,words]=info[reason]||info.occupied;toast(icons,words);}
function current(){return data.objects.find(o=>o.id===selected);}
function resizeTarget(){const o=current();return o&&((category==='build'&&['house','barn'].includes(o.type))||(category==='garden'&&o.type==='pasture'))?o:null;}
const selection=new T.Mesh(new T.RingGeometry(.58,.65,36),new T.MeshBasicMaterial({color:'#fff8d2',side:T.DoubleSide,transparent:true,opacity:.9,depthWrite:false}));selection.rotation.x=-Math.PI/2;selection.position.y=.05;selection.visible=false;scene.add(selection);
function update(){const o=current();$('object-actions').hidden=!o;$('rotate').hidden=!o||animals.has(o.type);$('color').hidden=!o||!['house','barn','bed','sofa','rug','chair','lamp'].includes(o.type);$('roof').hidden=!o||!['house','barn'].includes(o.type);$('feed').hidden=!o||!animals.has(o.type);$('roof').setAttribute('aria-pressed',o?openRoofs.has(o.id):false);$('roof').textContent=o&&openRoofs.has(o.id)?'🏠':'🪟';
 $('size-picker').hidden=!(category==='build'||category==='garden');document.querySelectorAll('[data-size]').forEach(b=>b.classList.toggle('selected',Number(b.dataset.size)===(resizeTarget()?resizeTarget().size:size)));
 selection.visible=!!o;if(o){const d=R.dimensions(o);selection.position.set(o.x,.08,o.z);selection.scale.set(Math.max(.65,d.w*.7),Math.max(.65,d.d*.7),1);}
 $('animal-info').hidden=!o||!animals.has(o.type);if(o&&animals.has(o.type)){$('animal-info').textContent=(o.hunger<45?'🥕':'💚')+(o.containerId?' 🌿':'');$('animal-info').setAttribute('aria-label',o.hunger<45?'Ich habe Hunger':'Mir geht es gut');}
 for(const a of data.objects){const g=meshes.get(a.id);if(g?.userData.roof){const peek=openRoofs.has(a.id)||(o&&(o.containerId===a.id||furniture.has(o.type)&&R.inside(a,o.x,o.z)));g.userData.roof.visible=!peek;g.userData.facade.visible=!peek;}}
 $('day-night').textContent=data.night?'🌙':'☀️';$('day-night').setAttribute('aria-pressed',data.night);scene.background.set(data.night?'#536b86':'#c9e8ea');scene.fog.color.copy(scene.background);ambient.intensity=data.night?.85:1.6;sun.intensity=data.night?.35:1.6;
 $('trash').classList.toggle('has-selection',!!o);$('undo').disabled=!history.length;
}
function choose(id){selected=id;update();}
function attach(o){const parent=R.container(data.objects,o);if(animals.has(o.type)){o.containerId=parent?.id||null;if(parent?.type==='barn')openRoofs.add(parent.id);}else if(furniture.has(o.type)&&parent)openRoofs.add(parent.id);}
function adoptAnimals(parent){if(!['barn','pasture'].includes(parent.type))return;for(const a of data.objects)if(animals.has(a.type)&&!a.containerId&&R.inside(parent,a.x,a.z,.5))a.containerId=parent.id;}
function add(o){if(data.objects.length>=100){error('limit');return false;}const problem=R.validate(data.objects,o);if(problem){error(problem);return false;}checkpoint();o.id=nextId++;data.objects.push(o);attach(o);adoptAnimals(o);create(o);choose(o.id);saved();tone();toast('✨ '+emoji(o.type),'Gebaut!');return true;}
function remove(id){const o=data.objects.find(a=>a.id===id);if(!o)return;checkpoint();const children=R.sized.has(o.type)?R.dependents(data.objects,o):[];
 // Removing a building keeps animals on the meadow; undo restores furniture too.
 const furnitureIds=children.filter(a=>furniture.has(a.type)).map(a=>a.id);data.objects=data.objects.filter(a=>a.id!==id&&!furnitureIds.includes(a.id));for(const a of data.objects)if(a.containerId===id)a.containerId=null;rebuild();saved();tone(480);toast('🗑️ → ↶','Entfernt. Rückgängig bringt es zurück.');}
function commitMove(o,x,z){const before={...o},after={...o,x,z},children=R.sized.has(o.type)?R.dependents(data.objects,o):[],changed=R.transformChildren(children,before,after);const ignore=children.map(a=>a.id);let problem=R.validate(data.objects,after,ignore);if(!problem)for(const c of changed){const v=R.validate([...data.objects.filter(a=>a.id!==o.id&&!ignore.includes(a.id)),after,...changed],c);if(v){problem=v;break;}}if(problem){error(problem);return false;}checkpoint();Object.assign(o,after);for(const c of changed)Object.assign(data.objects.find(a=>a.id===c.id),c);attach(o);for(const a of [o,...children]){const g=meshes.get(a.id);g.position.set(a.x,0,a.z);g.rotation.y=a.rotation||0;g.userData.goal=null;}adoptAnimals(o);choose(o.id);saved();tone();return true;}
function emoji(type){return Object.values(catalog).flat().find(a=>a[0]===type)?.[1]||'🏡';}
function makeEntry(type){return {id:nextId,type,x:0,z:0,rotation:0,size,color:type==='barn'?'#d69582':colors[0],lit:true,hunger:100,containerId:null};}
let azimuth=.64,zoom=1.25,target=new T.Vector3(0,0,0);
function cameraUpdate(){const w=viewport.clientWidth,h=viewport.clientHeight,aspect=w/h,span=Math.max(12.6,17/aspect)/zoom;camera.left=-span*aspect;camera.right=span*aspect;camera.top=span;camera.bottom=-span;camera.position.set(target.x+Math.sin(azimuth)*26,24,target.z+Math.cos(azimuth)*26);camera.lookAt(target);camera.updateProjectionMatrix();renderer.render(scene,camera);}
function resize(){renderer.setSize(viewport.clientWidth,viewport.clientHeight,false);cameraUpdate();}new ResizeObserver(resize).observe(viewport);
const ray=new T.Raycaster(),pointer=new T.Vector2();
function inViewport(x,y){const r=renderer.domElement.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;}
function floorPoint(x,y){const r=renderer.domElement.getBoundingClientRect();pointer.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObject(ground)[0]?.point;}
function visible(m){for(let p=m;p;p=p.parent)if(!p.visible)return false;return true;}
function pick(x,y){floorPoint(x,y);return ray.intersectObjects(Array.from(meshes.values()),true).find(h=>visible(h.object))?.object.userData.id;}
function overTrash(x,y){const r=$('trash').getBoundingClientRect();return x>r.left-12&&x<r.right+12&&y>r.top-12&&y<r.bottom+12;}
function destroyGhost(){if(ghost){ghost.traverse(m=>{if(m.isMesh&&m.material?.userData.ghost)m.material.dispose();});dispose(ghost);ghost=null;}ghostState=null;}
function preview(o){destroyGhost();ghost=makeObject(o);ghost.traverse(m=>{if(m.isMesh){const base=m.material;m.material=base.clone();if(m.userData.ownMaterial)base.dispose();m.material.userData.ghost=true;m.material.transparent=true;m.material.opacity=.48;m.material.depthWrite=false;m.castShadow=false;m.userData.ownMaterial=false;}});scene.add(ghost);grid.visible=true;ghost.visible=false;}
function dragUpdate(x,y){if(!drag)return;$('drag-icon').style.left=x+'px';$('drag-icon').style.top=y+'px';const bin=overTrash(x,y);$('trash').classList.toggle('drag-over',bin);const p=inViewport(x,y)&&!bin?floorPoint(x,y):null;
 if(!p){ghost.visible=false;ghostState=null;$('drag-icon').hidden=false;return;}
 const snapped={...drag.entry,x:Math.round((p.x-(drag.offsetX||0))*2)/2,z:Math.round((p.z-(drag.offsetZ||0))*2)/2};const children=drag.existing&&R.sized.has(snapped.type)?R.dependents(data.objects,drag.entry).map(a=>a.id):[];const problem=R.validate(data.objects,snapped,children);ghost.position.set(snapped.x,.06,snapped.z);ghost.visible=true;ghostState={entry:snapped,problem};ghost.traverse(m=>{if(m.isMesh){m.material.color.set(problem?'#e99681':'#acd686');m.material.opacity=problem?.5:.7;}});$('drag-icon').hidden=true;$('world-tip').textContent=problem?'✋ ↔️':'✓';viewport.classList.add('dragging');}
function beginDrag(g,x,y){drag={entry:g.entry,existing:g.kind==='object',offsetX:g.offsetX||0,offsetZ:g.offsetZ||0};preview(g.entry);const url=thumbs.get(g.entry.type);$('drag-icon').replaceChildren();if(url){const img=new Image();img.src=url;$('drag-icon').append(img);}else $('drag-icon').textContent=emoji(g.entry.type);$('drag-icon').hidden=false;if(drag.existing)meshes.get(g.entry.id).visible=false;selection.visible=false;$('object-actions').hidden=true;dragUpdate(x,y);}
function finishDrag(x,y,cancel=false){if(!drag)return;const old=drag,point=ghostState;destroyGhost();grid.visible=false;viewport.classList.remove('dragging');$('trash').classList.remove('drag-over');$('drag-icon').hidden=true;
 if(old.existing)meshes.get(old.entry.id).visible=true;
 drag=null;if(!cancel&&old.existing&&overTrash(x,y))remove(old.entry.id);else if(!cancel&&point&&inViewport(x,y)){if(point.problem)error(point.problem);else if(old.existing)commitMove(data.objects.find(o=>o.id===old.entry.id),point.entry.x,point.entry.z);else add(point.entry);}
 update();$('world-tip').textContent='👆 ↔️ 🏡';}
// A simple tap also adds an item in a free position. Dragging is never required to read instructions.
function autoPlace(type){const o=makeEntry(type),candidates=[];
 if(furniture.has(type)){const preferred=current();const homes=data.objects.filter(a=>['house','barn'].includes(a.type));if(preferred&&homes.includes(preferred)){homes.splice(homes.indexOf(preferred),1);homes.unshift(preferred);}for(const b of homes){const d=R.dimensions(b);for(let z=-d.d/2+.6;z<d.d/2-.4;z+=.5)for(let x=-d.w/2+.6;x<d.w/2-.4;x+=.5){const p=R.global(b,x,z);candidates.push(p);}}}
 else if(animals.has(type)&&current()&&['barn','pasture'].includes(current().type)){const b=current();candidates.push({x:b.x,z:b.z});}
 if(!furniture.has(type))for(let radius=0;radius<10;radius+=1)for(let a=0;a<(radius?12:1);a++){const angle=a*Math.PI/6;candidates.push({x:Math.round(Math.sin(angle)*radius*2)/2,z:Math.round(Math.cos(angle)*radius*2)/2});}
 const spot=candidates.find(p=>!R.validate(data.objects,{...o,...p}));if(!spot){error(furniture.has(type)?'inside':'occupied');return;}add({...o,...spot});}
const pointers=new Map();let pinch=null;
renderer.domElement.addEventListener('pointerdown',e=>{e.preventDefault();unlock();renderer.domElement.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pointers.size===2){if(drag)finishDrag(e.clientX,e.clientY,true);gesture=null;const p=Array.from(pointers.values());pinch={distance:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2};return;}
 const id=pick(e.clientX,e.clientY),entry=data.objects.find(o=>o.id===id),p=floorPoint(e.clientX,e.clientY);gesture={pointerId:e.pointerId,kind:entry?'object':'camera',entry:entry?{...entry}:null,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,moved:false,offsetX:entry&&p?p.x-entry.x:0,offsetZ:entry&&p?p.z-entry.z:0};});
document.addEventListener('pointermove',e=>{if(pointers.has(e.pointerId))pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size>=2&&pinch){const p=Array.from(pointers.values()),d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);if(pinch.distance>0)zoom=Math.max(.65,Math.min(3,zoom*d/pinch.distance));pinch.distance=d;cameraUpdate();return;}if(!gesture||gesture.pointerId!==e.pointerId)return;const g=gesture;const moved=Math.hypot(e.clientX-g.startX,e.clientY-g.startY)>7;
 if(!g.moved&&moved){g.moved=true;if(g.kind!=='camera')beginDrag(g,e.clientX,e.clientY);}
 if(g.moved){if(g.kind==='camera'){azimuth-=(e.clientX-g.x)*.007;cameraUpdate();}else dragUpdate(e.clientX,e.clientY);}g.x=e.clientX;g.y=e.clientY;},{passive:true});
function endPointer(e,cancel=false){pointers.delete(e.pointerId);if(pinch){if(pointers.size<2)pinch=null;gesture=null;return;}if(!gesture||gesture.pointerId!==e.pointerId)return;const g=gesture;gesture=null;if(drag)finishDrag(e.clientX,e.clientY,cancel);else if(!cancel&&!g.moved){if(g.kind==='new')autoPlace(g.entry.type);else if(g.kind==='object'){choose(g.entry.id);tone(520);if(g.entry.type==='lamp')toggleLamp();}else choose(null);}}
document.addEventListener('pointerup',e=>endPointer(e));document.addEventListener('pointercancel',e=>endPointer(e,true));
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.65,Math.min(3,zoom*(e.deltaY>0?.94:1.06)));cameraUpdate();},{passive:false});
const thumbs=new Map();
function thumbnails(){let rr;try{rr=new T.WebGLRenderer({alpha:true,antialias:true});rr.setSize(140,120);rr.setPixelRatio(1);rr.outputColorSpace=T.SRGBColorSpace;const sc=new T.Scene();sc.add(new T.HemisphereLight(0xfff7e6,0x829a70,2.7));const light=new T.DirectionalLight(0xfff5e1,2.1);light.position.set(-5,9,7);sc.add(light);const cam=new T.OrthographicCamera(-3,3,2.5,-2.5,.1,40);cam.position.set(7,6,9);cam.lookAt(0,.7,0);
 for(const type of allTypes){const g=makeObject({type,size:2,x:0,z:0,lit:true});sc.add(g);const scale=R.sized.has(type)?1:animals.has(type)?1.9:type==='tree'?1.45:1.8;g.scale.setScalar(scale);rr.render(sc,cam);thumbs.set(type,rr.domElement.toDataURL('image/png'));dispose(g);}rr.dispose();}catch(e){if(rr)rr.dispose();}}
function palette(cat){category=cat;$('world-palette').replaceChildren();for(const [type,icon,name]of catalog[cat]){const b=document.createElement('button');b.className='world-item';b.dataset.type=type;b.setAttribute('aria-label',name+' auf die Wiese ziehen oder antippen');if(thumbs.has(type)){const img=new Image();img.src=thumbs.get(type);img.alt='';img.draggable=false;b.append(img);}else{const s=document.createElement('span');s.textContent=icon;b.append(s);}const label=document.createElement('small');label.textContent=name;b.append(label);
 b.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();unlock();b.setPointerCapture(e.pointerId);gesture={kind:'new',entry:makeEntry(type),pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,moved:false};});b.addEventListener('click',e=>{if(e.detail===0)autoPlace(type);});$('world-palette').append(b);}
 document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-selected',b.dataset.category===cat));update();}
for(const b of document.querySelectorAll('[data-category]'))b.onclick=()=>{unlock();palette(b.dataset.category);tone(440);};
for(const b of document.querySelectorAll('[data-size]')){const n=Number(b.dataset.size),gridEl=b.querySelector('.size-grid');for(let i=0;i<n*n;i++)gridEl.append(document.createElement('i'));b.onclick=()=>{unlock();const o=resizeTarget();if(o){const changed={...o,size:n},children=R.dependents(data.objects,o);const problem=R.validate(data.objects,changed,children.map(a=>a.id));if(problem){error(problem);return;}if(children.some(a=>!animals.has(a.type)&&!R.fits(a,changed))){error('occupied');return;}checkpoint();o.size=n;const dim=R.dimensions(o);for(const a of children){if(!animals.has(a.type))continue;const p=R.local(o,a.x,a.z),limit=dim.w/2-.68;Object.assign(a,R.global(o,Math.max(-limit,Math.min(limit,p.x)),Math.max(-limit,Math.min(limit,p.z))));const model=meshes.get(a.id);model.position.set(a.x,0,a.z);model.userData.goal=null;}replace(o);saved();}size=n;update();tone();};}
$('trash').onclick=()=>{unlock();if(selected)remove(selected);else toast('👆 🏡 → 🗑️','Ziehe ein Ding in den Papierkorb.');};$('delete').onclick=()=>{unlock();remove(selected);};
$('undo').onclick=()=>{if(!history.length)return;unlock();data=JSON.parse(history.pop());rebuild();saved();tone(600);toast('↶ 💚','Zurück!');};
$('rotate').onclick=()=>{const o=current();if(!o)return;unlock();const after={...o,rotation:(o.rotation||0)+Math.PI/2},children=R.sized.has(o.type)?R.dependents(data.objects,o):[],transformed=R.transformChildren(children,o,after),ignore=children.map(a=>a.id);let problem=R.validate(data.objects,after,ignore);const proposed=[...data.objects.filter(a=>a.id!==o.id&&!ignore.includes(a.id)),after,...transformed];if(!problem)problem=transformed.map(a=>R.validate(proposed,a)).find(Boolean);if(problem){error(problem);return;}checkpoint();Object.assign(o,after);for(const a of transformed){const child=data.objects.find(b=>b.id===a.id);Object.assign(child,a);const g=meshes.get(a.id);g.position.set(a.x,0,a.z);g.rotation.y=a.rotation;}meshes.get(o.id).rotation.y=o.rotation;update();saved();tone();};
$('color').onclick=()=>{const o=current();if(!o)return;unlock();checkpoint();o.color=colors[(colors.indexOf(o.color)+1)%colors.length];replace(o);update();saved();tone();};
$('roof').onclick=()=>{const o=current();if(!o)return;unlock();if(openRoofs.has(o.id))openRoofs.delete(o.id);else openRoofs.add(o.id);update();tone(480);};
$('feed').onclick=()=>{const o=current();if(!o||!animals.has(o.type))return;unlock();checkpoint();o.hunger=100;meshes.get(o.id).userData.happy=2;update();saved();tone(880);toast('🥕 '+emoji(o.type)+' 💚','Mmm, lecker!');};
function toggleLamp(){const o=current();if(!o||o.type!=='lamp')return;checkpoint();o.lit=!o.lit;const g=meshes.get(o.id);g.userData.bulb.material.emissive.set(o.lit?0xffd47a:0x000000);g.userData.glow.visible=o.lit;saved();}
for(const dir of ['left','right'])$('camera-'+dir).onclick=()=>{azimuth+=(dir==='left'?-.35:.35);cameraUpdate();};$('zoom-in').onclick=()=>{zoom=Math.min(3,zoom*1.22);cameraUpdate();};$('zoom-out').onclick=()=>{zoom=Math.max(.65,zoom/1.22);cameraUpdate();};$('camera-home').onclick=()=>{zoom=1;azimuth=.64;target.set(0,0,0);cameraUpdate();};
$('day-night').onclick=()=>{unlock();data.night=!data.night;update();saved();tone(480);};
function note(){if(!music||document.hidden||!audioCtx)return;const notes=[60,64,67,72,67,64,62,65,69,74,69,65,59,62,67,71],osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),t=audioCtx.currentTime;osc.type='sine';osc.frequency.value=440*Math.pow(2,(notes[noteIndex++%notes.length]-69)/12);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.03,t+.04);gain.gain.exponentialRampToValueAtTime(.001,t+.7);osc.connect(gain);gain.connect(audioCtx.destination);osc.start(t);osc.stop(t+.72);}
$('music').onclick=()=>{unlock();music=!music;$('music').setAttribute('aria-pressed',music);$('music').setAttribute('aria-label',music?'Musik ausschalten':'Musik einschalten');clearInterval(musicTimer);if(music){note();musicTimer=setInterval(note,480);}};
let storedExists=false;try{const stored=JSON.parse(localStorage.getItem(KEY));if(stored?.version===1&&Array.isArray(stored.objects)){storedExists=true;const seen=new Set();data={version:1,gardenMigrated:!!stored.gardenMigrated,night:!!stored.night,autoFeed:true,objects:stored.objects.slice(0,100).filter(o=>{if(!allTypes.has(o.type)||!Number.isFinite(o.x)||!Number.isFinite(o.z)||!Number.isInteger(o.id)||seen.has(o.id))return false;seen.add(o.id);return true;}).map(o=>({...o,x:Math.max(-10,Math.min(10,o.x)),z:Math.max(-10,Math.min(10,o.z)),rotation:Number.isFinite(o.rotation)?o.rotation:0,size:[2,3,4].includes(o.size)?o.size:3,hunger:Number.isFinite(o.hunger)?Math.max(0,Math.min(100,o.hunger)):100,color:/^#[0-9a-f]{6}$/i.test(o.color)?o.color:undefined}))};}}
catch(e){$('save-state').textContent='☁ !';}
if(!storedExists){data.objects=[{id:1,type:'tree',x:-9,z:-7},{id:2,type:'tree',x:9,z:-7},{id:3,type:'tree',x:-9,z:7},{id:4,type:'tree',x:9,z:7},{id:5,type:'flowers',x:-6,z:5},{id:6,type:'bunny',x:1,z:2,hunger:100},{id:7,type:'trough',x:2.5,z:2}];}
nextId=Math.max(0,...data.objects.map(o=>o.id))+1;if(storedExists&&!data.objects.some(o=>o.type==='tree')&&!data.gardenMigrated){for(const [x,z]of [[-9,-7],[9,-7],[-9,7],[9,7]]){if(!data.objects.some(o=>R.sized.has(o.type)&&R.inside(o,x,z,-.9)))data.objects.push({id:nextId++,type:'tree',x,z});}data.gardenMigrated=true;}for(const a of data.objects)attach(a);rebuild();thumbnails();palette('build');resize();saved();renderer.render(scene,camera);$('world-loading').hidden=true;
let last=performance.now(),saveTime=0,renderTime=0;
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.06,(now-last)/1000);last=now;if(document.hidden)return;
 for(const o of data.objects){if(!animals.has(o.type)||drag?.existing&&drag.entry.id===o.id)continue;const g=meshes.get(o.id),parent=data.objects.find(a=>a.id===o.containerId),pasture=parent?.type==='pasture';o.hunger=Math.max(0,(o.hunger??100)-dt*.12);
 const trough=data.objects.find(a=>a.type==='trough'&&Math.hypot(a.x-o.x,a.z-o.z)<1.2);
 const inBarn=parent?.type==='barn';const eating=(pasture||inBarn||trough)&&o.hunger<96;if(eating){o.hunger=Math.min(100,o.hunger+dt*14);g.userData.head.rotation.x=.35+Math.sin(now*.004)*.12;g.userData.pause=Math.max(g.userData.pause,.4);}else g.userData.head.rotation.x=0;
 if(g.userData.happy>0){g.userData.happy-=dt;g.userData.body.position.y=Math.abs(Math.sin(now*.008))*.18;}else g.userData.body.position.y=0;
 if(g.userData.pause>0){g.userData.pause-=dt;g.userData.legs.forEach(leg=>leg.rotation.x*=.85);continue;}
 if(!g.userData.goal){if(parent){const dim=R.dimensions(parent);g.userData.goal=R.global(parent,(Math.random()-.5)*(dim.w-1.4),(Math.random()-.5)*(dim.d-1.4));}
 else if(o.hunger<55){const food=data.objects.filter(a=>a.type==='trough'||a.type==='pasture');if(food.length){const near=food.reduce((a,b)=>Math.hypot(a.x-o.x,a.z-o.z)<Math.hypot(b.x-o.x,b.z-o.z)?a:b);g.userData.goal={x:near.x,z:near.z};}}
 if(!g.userData.goal)g.userData.goal={x:Math.max(-10.4,Math.min(10.4,o.x+(Math.random()-.5)*3)),z:Math.max(-10.4,Math.min(10.4,o.z+(Math.random()-.5)*3))};}
 const goal=g.userData.goal,dx=goal.x-o.x,dz=goal.z-o.z,dist=Math.hypot(dx,dz);if(dist<.1){g.userData.goal=null;g.userData.pause=1+Math.random()*3;continue;}
 const nx=o.x+dx/dist*dt*.34,nz=o.z+dz/dist*dt*.34;
 if(!parent&&data.objects.some(a=>a.type==='house'&&R.inside(a,nx,nz,-.4))){g.userData.goal=null;g.userData.pause=.4;continue;}
 if(parent&&!R.inside(parent,nx,nz,.52)){g.userData.goal=null;continue;}
 if(!parent){const enclosure=R.container(data.objects,{...o,x:nx,z:nz});if(enclosure){const p=R.local(enclosure,nx,nz),old=R.local(enclosure,o.x,o.z),dim=R.dimensions(enclosure);const entersFront=old.z>=dim.d/2-.65&&Math.abs(p.x)<.65;if(!entersFront){g.userData.goal=null;g.userData.pause=.4;continue;}o.containerId=enclosure.id;g.userData.goal=null;if(enclosure.type==='barn')openRoofs.add(enclosure.id);update();}}
 o.x=nx;o.z=nz;o.rotation=Math.atan2(dx,dz);g.position.set(o.x,0,o.z);g.rotation.y=o.rotation;g.userData.body.position.y+=Math.sin(now*.007+g.userData.phase)*.012;g.userData.legs.forEach((leg,i)=>leg.rotation.x=Math.sin(now*.007+(i===0||i===3?0:Math.PI))*.25);
 if(selected===o.id)selection.position.set(o.x,.08,o.z);
 }
 saveTime+=dt;if(saveTime>8){saveTime=0;saved();update();}renderTime+=dt;if(renderTime>=1/30){renderTime=0;renderer.render(scene,camera);}
}requestAnimationFrame(frame);
function cancelGesture(){if(drag)finishDrag(0,0,true);gesture=null;pointers.clear();pinch=null;}
window.addEventListener('blur',cancelGesture);document.addEventListener('visibilitychange',()=>{last=performance.now();if(document.hidden){cancelGesture();saved();audioCtx?.suspend();}else if(music)audioCtx?.resume();});window.addEventListener('pagehide',()=>saved());
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
