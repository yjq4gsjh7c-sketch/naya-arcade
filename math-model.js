(function(root){'use strict';
 const scenes=[{id:'apple',plural:'Äpfel',singular:'Apfel',place:'Garten'},{id:'fish',plural:'Fische',singular:'Fisch',place:'Teich'},{id:'balloon',plural:'Ballons',singular:'Ballon',place:'Himmel'}];
 const pick=(items,rng)=>items[Math.floor(rng()*items.length)];
 function round(max=5,rng=Math.random,previous=''){
  if(max!==5&&max!==10)throw new RangeError('max');
  let task;
  for(let attempt=0;attempt<12;attempt++){
   const scene=pick(scenes,rng),op=rng()<.5?'plus':'minus';
   const first=op==='plus'?1+Math.floor(rng()*(max-1)):2+Math.floor(rng()*(max-1));
   const change=op==='plus'?1+Math.floor(rng()*(max-first)):1+Math.floor(rng()*first);
   const result=op==='plus'?first+change:first-change;
   task={scene,op,first,change,result};
   if(`${op}:${first}:${change}`!==previous)break;
  }
  const others=Array.from({length:max+1},(_,n)=>n).filter(n=>n!==task.result);
  others.sort((a,b)=>Math.abs(a-task.result)-Math.abs(b-task.result)||a-b);
  const near=others.slice(0,Math.min(5,others.length));
  const chosen=[];
  while(chosen.length<2){const index=Math.floor(rng()*near.length);chosen.push(near.splice(index,1)[0]);}
  const options=[task.result,...chosen];
  for(let i=options.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[options[i],options[j]]=[options[j],options[i]];}
  return {...task,options,max,signature:`${task.op}:${task.first}:${task.change}`};
 }
 const api={round,scenes};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.NayaMath=api;
})(typeof module==='object'?module.exports:window);
