const assert=require('node:assert/strict');require('../atelier-life-model.js');const M=globalThis.NayaLife;
const old=M.restore(null);assert.equal(old.petName,'Mimi');assert.equal(old.objects.length,4);
const moved=M.place(old,'bed',-10,50);assert.equal(moved.objects.length,4);assert.equal(moved.objects.find(x=>x.kind==='bed').x,.13);assert.equal(moved.objects.find(x=>x.kind==='bed').y,.96);assert.equal(old.objects.find(x=>x.kind==='bed').x,.26);
assert.equal(M.place(old,'bad',.5,.5),old);assert.equal(M.place(old,'bed',NaN,.5),old);assert.equal(M.remove(old,'bed').objects.length,3);
let s=M.start(old,'picnic');assert.equal(M.event(s,'night'),s);s=M.event(s,'outfit');assert.equal(s.active.step,1);s=M.event(s,'food');s=M.event(s,'play');assert.equal(s.active,null);assert.deepEqual(s.completed,['picnic']);
s=M.start(s,'picnic');for(const e of ['outfit','food','play'])s=M.event(s,e);assert.equal(s.completed.length,1);
const restored=M.restore({...s,petName:'<Mimi>\u0000',objects:[{kind:'bed',x:-20,y:200},{kind:'bed',x:.2,y:.7},{kind:'wrong',x:.4,y:.4}],album:[{image:'javascript:bad'}],active:{id:'party',step:99}});assert.equal(restored.petName,'Mimi');assert.equal(restored.objects.length,1);assert.equal(restored.objects[0].x,.13);assert.equal(restored.album.length,0);assert.equal(restored.active.step,2);
assert.equal(M.pet({...s,petJoy:99},'eat').petJoy,100);assert.equal(M.pet(s,'unknown'),s);assert.equal(M.restore({...s,version:9}).completed.length,0);
console.log('PASS: old-save defaults, finite normalized placement, removal, quest sequence/replay, validated local photos, pet care, restore.');
