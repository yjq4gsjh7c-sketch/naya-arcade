const assert=require('node:assert/strict');
const {pictures,make,size}=require('../pixel-model.js');
assert.equal(pictures.length,32);
assert.equal(new Set(pictures.map(p=>p.id)).size,pictures.length);
const designs=new Set();
for(const picture of pictures){
  const art=make(picture.id);
  assert.equal(art.cells.length,size*size,picture.id);
  assert(art.total>=30&&art.total<=350,picture.id);
  assert.equal(art.cells.filter(v=>v>0).length,art.total,picture.id);
  assert(art.cells.every(v=>v>=-1&&v<=picture.palette.length),picture.id);
  assert(art.cells.some(v=>v===-1),picture.id);
  designs.add(art.cells.join(','));
}
assert.equal(designs.size,32,'every image has a distinct drawing');
console.log('PASS: 32 original, distinct numbered pictures with valid palettes and outlines');
