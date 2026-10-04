/* Shared world rules: no renderer or browser state required. */
(function(root){
'use strict';
const animals=new Set(['sheep','cow','bunny','horse']);
const furniture=new Set(['bed','sofa','table','chair','lamp','rug']);
const sized=new Set(['house','barn','pasture']);
const bounds=11.4;
function dimensions(o){if(sized.has(o.type)){const size=[2,3,4].includes(o.size)?o.size:3;return {w:size*1.4,d:size*1.4};}const sizes={bed:[1,1.7],sofa:[1.5,.8],table:[1,.8],chair:[.5,.5],lamp:[.55,.55],rug:[1.5,1.2],tree:[1.5,1.5],flowers:[.7,.7],fence:[1.5,.25],trough:[1.2,.7]};const [w,d]=sizes[o.type]||[.8,.9];return {w,d};}
function local(o,x,z){const a=o.rotation||0,c=Math.cos(a),s=Math.sin(a),dx=x-o.x,dz=z-o.z;return {x:dx*c-dz*s,z:dx*s+dz*c};}
function global(o,x,z){const a=o.rotation||0,c=Math.cos(a),s=Math.sin(a);return {x:o.x+x*c+z*s,z:o.z-x*s+z*c};}
function inside(o,x,z,margin=0){const p=local(o,x,z),d=dimensions(o);return Math.abs(p.x)<=d.w/2-margin&&Math.abs(p.z)<=d.d/2-margin;}
function container(objects,o){return objects.find(b=>b.id!==o.id&&((animals.has(o.type)&&['barn','pasture'].includes(b.type))||(furniture.has(o.type)&&['house','barn'].includes(b.type)))&&inside(b,o.x,o.z,.45));}
function footprint(o){const d=dimensions(o),a=o.rotation||0,c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));return {w:d.w*c+d.d*s,d:d.w*s+d.d*c};}
function overlap(a,b,padding=.12){const da=footprint(a),db=footprint(b);return Math.abs(a.x-b.x)<(da.w+db.w)/2+padding&&Math.abs(a.z-b.z)<(da.d+db.d)/2+padding;}
function fits(child,parent){const p=local(parent,child.x,child.z),d=dimensions(parent),q=footprint({...child,rotation:(child.rotation||0)-(parent.rotation||0)});return Math.abs(p.x)+q.w/2<=d.w/2-.15&&Math.abs(p.z)+q.d/2<=d.d/2-.15;}
function validate(objects,o,ignore=[]){const d=footprint(o);if(Math.abs(o.x)+d.w/2>bounds||Math.abs(o.z)+d.d/2>bounds)return 'edge';
 const others=objects.filter(a=>a.id!==o.id&&!ignore.includes(a.id));
 if(furniture.has(o.type)){const b=container(others,o);if(!b||!fits(o,b))return 'inside';if(o.type!=='rug'&&others.some(a=>furniture.has(a.type)&&a.type!=='rug'&&overlap(a,o,-.06)))return 'occupied';}
 if(sized.has(o.type)&&others.some(a=>sized.has(a.type)&&overlap(o,a,.2)))return 'occupied';
 if(sized.has(o.type)&&others.some(a=>!animals.has(a.type)&&!furniture.has(a.type)&&!sized.has(a.type)&&overlap(o,a,.05)))return 'occupied';
 if(['tree','flowers','trough','fence'].includes(o.type)&&others.some(a=>['house','barn'].includes(a.type)&&overlap(o,a,.08)))return 'occupied';
 return null;}
function dependents(objects,parent){return objects.filter(a=>a.id!==parent.id&&(a.containerId===parent.id||(furniture.has(a.type)&&inside(parent,a.x,a.z,.05))));}
function transformChildren(children,before,after){return children.map(o=>{const p=local(before,o.x,o.z),next=global(after,p.x,p.z);return {...o,...next,rotation:(o.rotation||0)+(after.rotation||0)-(before.rotation||0)};});}
root.NayaWorldRules={animals,furniture,sized,bounds,dimensions,local,global,inside,container,footprint,overlap,fits,validate,dependents,transformChildren};
})(typeof window!=='undefined'?window:globalThis);
