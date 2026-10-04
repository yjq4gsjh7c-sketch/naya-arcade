(function(root){'use strict';
const furniture=['bed','rug','lamp','plant'];
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const quests={picnic:[{event:'outfit',target:'clothes',icon:'👗'},{event:'food',target:'food',icon:'🍓'},{event:'play',target:'pet',icon:'🐈'}],party:[{event:'outfit',target:'clothes',icon:'👗'},{event:'bracelet',target:'jewelry',icon:'💎'},{event:'lamp',target:'room',icon:'💡'}],sleep:[{event:'bed',target:'room',icon:'🛏️'},{event:'cuddle',target:'pet',icon:'💗'},{event:'night',target:'room',icon:'🌙'}]};
function fresh(){return {version:1,wall:'blush',light:true,petName:'Mimi',petMode:'happy',petJoy:80,objects:[{kind:'rug',x:.48,y:.94},{kind:'bed',x:.26,y:.75},{kind:'lamp',x:.47,y:.67},{kind:'plant',x:.84,y:.71}],completed:[],active:null,album:[]};}
function restore(raw){const s=fresh();if(!raw||raw.version!==1)return s;
if(['blush','mint','lavender'].includes(raw.wall))s.wall=raw.wall;if(typeof raw.light==='boolean')s.light=raw.light;
if(typeof raw.petName==='string')s.petName=raw.petName.replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,16)||'Mimi';
if(['happy','sleep','play','eat'].includes(raw.petMode))s.petMode=raw.petMode;
if(Number.isFinite(raw.petJoy))s.petJoy=clamp(raw.petJoy,20,100);
if(Array.isArray(raw.objects))s.objects=raw.objects.filter(o=>o&&furniture.includes(o.kind)&&Number.isFinite(o.x)&&Number.isFinite(o.y)).filter((o,i,a)=>a.findIndex(t=>t.kind===o.kind)===i).slice(0,4).map(o=>({kind:o.kind,x:clamp(o.x,.13,.87),y:clamp(o.y,.42,.96)}));
if(Array.isArray(raw.completed))s.completed=[...new Set(raw.completed.filter(k=>quests[k]))];
if(raw.active&&quests[raw.active.id]&&Number.isInteger(raw.active.step))s.active={id:raw.active.id,step:clamp(raw.active.step,0,2)};
if(Array.isArray(raw.album))s.album=raw.album.filter(a=>a&&typeof a.image==='string'&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(a.image)&&a.image.length<180000).slice(-8).map(a=>({image:a.image,frame:['pink','mint','lavender'].includes(a.frame)?a.frame:'pink',time:Number.isFinite(a.time)?a.time:0}));return s;}
function place(s,kind,x,y){if(!furniture.includes(kind)||!Number.isFinite(x)||!Number.isFinite(y))return s;return {...s,objects:[...s.objects.filter(o=>o.kind!==kind),{kind,x:clamp(x,.13,.87),y:clamp(y,.42,.96)}]};}
function remove(s,kind){return {...s,objects:s.objects.filter(o=>o.kind!==kind)};}
function start(s,id){return quests[id]?{...s,active:{id,step:0}}:s;}
function event(s,event){if(!s.active)return s;const a=s.active;if(quests[a.id][a.step].event!==event)return s;if(a.step===2)return {...s,active:null,completed:[...new Set([...s.completed,a.id])]};return {...s,active:{...a,step:a.step+1}};}
function pet(s,mode){if(!['happy','sleep','play','eat'].includes(mode))return s;return {...s,petMode:mode,petJoy:Math.min(100,s.petJoy+(mode==='eat'?15:8))};}
root.NayaLife={fresh,restore,place,remove,start,event,pet,quests,furniture};
})(typeof window!=='undefined'?window:globalThis);
