(function(root){
'use strict';
const allowed={outfit:[0,1,2,3],hair:['brown','honey','auburn','dark'],shoes:[0,1,2,3],socks:['mint','pink','lavender','peach'],bracelet:['none','flowers','rainbow','pearls','stars'],lip:['natural','rose','peach','berry']};
const clamp=n=>Math.max(20,Math.min(100,n));
function fresh(now=Date.now()){return {version:1,outfit:0,hair:'brown',shoes:0,socks:'mint',bracelet:'flowers',lip:'natural',hunger:82,thirst:76,updatedAt:now};}
function restore(raw,now=Date.now()){const base=fresh(now);if(!raw||raw.version!==1)return base;for(const [key,values]of Object.entries(allowed))if(values.includes(raw[key]))base[key]=raw[key];for(const key of ['hunger','thirst'])if(Number.isFinite(raw[key]))base[key]=clamp(raw[key]);const elapsed=Number.isFinite(raw.updatedAt)?Math.max(0,Math.min(1200,(now-raw.updatedAt)/1000)):0;return advance(base,elapsed,now);}
function advance(state,seconds,now=Date.now()){seconds=Math.max(0,Math.min(1200,Number(seconds)||0));return {...state,hunger:clamp(state.hunger-seconds*.018),thirst:clamp(state.thirst-seconds*.025),updatedAt:now};}
function apply(state,item,now=Date.now()){if(!item||!allowed[item.kind]&&!['food','drink'].includes(item.kind))return state;const next={...state,updatedAt:now};if(item.kind==='food')next.hunger=Math.min(100,state.hunger+34);else if(item.kind==='drink')next.thirst=Math.min(100,state.thirst+38);else if(allowed[item.kind].includes(item.value))next[item.kind]=item.value;else return state;return next;}
function joy(state){return Math.round(55+(state.hunger+state.thirst)*.225);}
root.NayaAtelier={allowed,fresh,restore,advance,apply,joy};
})(typeof window!=='undefined'?window:globalThis);
