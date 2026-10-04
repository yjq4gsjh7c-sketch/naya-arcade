const assert=require('node:assert/strict');require('../atelier-model.js');const M=globalThis.NayaAtelier;
const start=M.fresh(1000);assert.equal(M.restore({version:1,outfit:99,hair:'bad',hunger:-200,thirst:999},1000).outfit,0);
const look=M.apply(start,{kind:'outfit',value:2},2000);assert.equal(look.outfit,2);assert.equal(start.outfit,0);assert.equal(M.apply(start,{kind:'hair',value:'wrong'}),start);
assert.equal(M.apply(start,{kind:'food'}).hunger,100);assert.equal(M.apply(start,{kind:'drink'}).thirst,100);
const later=M.advance(start,100000);assert(Math.abs(later.hunger-60.4)<1e-9);assert.equal(later.thirst,46);
const hungry=M.advance({...start,hunger:22,thirst:20},1000);assert.equal(hungry.hunger,20);assert.equal(hungry.thirst,20);
const restored=M.restore({...look,updatedAt:1000},Date.now());assert.equal(restored.outfit,2);assert(Math.abs(restored.hunger-60.4)<1e-9);assert.equal(restored.thirst,46);
assert(M.joy(hungry)>=55);assert.equal(M.joy({...start,hunger:100,thirst:100}),100);
console.log('PASS: isolated preferences, validated saves, outfits, food/water limits, gentle care, offline decay cap.');
