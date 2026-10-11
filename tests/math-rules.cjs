const assert=require('node:assert/strict');
const {round}=require('../math-model.js');
for(const max of [5,10])for(let i=0;i<1200;i++){
 const r=round(max,Math.random);
 assert.ok(r.first>=1&&r.first<=max);
 assert.ok(r.change>=1);
 assert.equal(r.result,r.op==='plus'?r.first+r.change:r.first-r.change);
 assert.ok(r.result>=0&&r.result<=max);
 assert.equal(r.options.length,3);
 assert.equal(new Set(r.options).size,3);
 assert.ok(r.options.includes(r.result));
 assert.ok(r.options.every(n=>Number.isInteger(n)&&n>=0&&n<=max));
}
assert.throws(()=>round(20),RangeError);
console.log('PASS: 2400 addition/subtraction tasks, range 0–5/0–10 and distinct answer choices.');
