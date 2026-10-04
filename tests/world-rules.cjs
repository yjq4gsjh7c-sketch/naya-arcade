const assert=require('node:assert/strict');
require('../world-model.js');
const R=globalThis.NayaWorldRules;
const barn={id:1,type:'barn',size:3,x:0,z:0,rotation:0};
assert.equal(R.validate([barn],{id:2,type:'barn',size:3,x:1,z:0}),'occupied');
assert.equal(R.validate([],{id:2,type:'house',size:4,x:10,z:0}),'edge');
assert.equal(R.validate([],{id:2,type:'bed',x:0,z:0}),'inside');
assert.equal(R.validate([barn],{id:2,type:'bed',x:0,z:0}),null);
assert.equal(R.validate([barn],{id:2,type:'bed',x:1.7,z:0}),'inside');
const pasture={id:3,type:'pasture',size:4,x:6,z:0,rotation:Math.PI/2};
const sheep={id:4,type:'sheep',x:6,z:0,containerId:3};
assert.equal(R.container([barn,pasture],sheep).id,3);
assert.equal(R.container([barn],{...sheep,x:0,z:0}).id,1);
assert.equal(R.container([{...barn,type:'house'}],{...sheep,x:0,z:0}),undefined);
for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
 const p={...pasture,rotation:angle},world=R.global(p,.3,-.4),local=R.local(p,world.x,world.z);
 assert(Math.abs(local.x-.3)<1e-9);assert(Math.abs(local.z+.4)<1e-9);
 assert(R.inside(p,world.x,world.z,.5));
}
const chair={id:5,type:'chair',x:.5,z:.5,rotation:0};
const children=R.dependents([barn,chair],barn);assert.equal(children.length,1);
const moved={...barn,x:-5,z:3,rotation:Math.PI/2},transformed=R.transformChildren(children,barn,moved)[0];
assert(Math.abs(transformed.x+4.5)<1e-9);assert(Math.abs(transformed.z-2.5)<1e-9);
assert(R.fits(transformed,moved));
const rug={id:6,type:'rug',x:0,z:0},bed={id:7,type:'bed',x:0,z:0};
assert.equal(R.validate([barn,rug],bed),null);
assert.equal(R.validate([barn,bed],{id:8,type:'table',x:0,z:0}),'occupied');
console.log('PASS: bounds, collisions, indoor furniture, pasture/stall containment, rotated coordinates, moving building contents.');
