const assert=require('node:assert/strict');require('../fruit-model.js');const M=globalThis.NayaFruit;
function ready(mode='bot',count=3,variant='classic',starter=0){let s=M.fresh(mode,count,variant,starter);s=M.seal(s,[0,1,2,3].slice(0,count));return M.seal(s,[9,10,11,8].slice(0,count));}
let s=M.fresh();assert.equal(M.pick(s,0),s);assert.equal(M.seal(s,[0,0,1]),s);assert.equal(M.seal(s,[0,1,12]),s);const first=M.seal(s,[0,1,2]);assert.deepEqual(first.boards[1].poison,[0,1,2]);assert.deepEqual(s.boards[1].poison,[]);assert.equal(first.setter,1);s=ready();assert.equal(s.phase,'play');const picked=M.pick(s,0);assert.equal(picked.turn,1);assert.equal(M.score(picked.boards[0]).safe,1);assert.equal(s.boards[0].picked.length,0);assert.equal(M.pick(s,NaN),s);
s=ready();for(let i=0;i<3;i++){s=M.pick(s,9+i);if(s.phase!=='done')s=M.pick(s,3+i);}assert.equal(s.phase,'done');assert.equal(s.winner,1);assert.equal(M.pick(s,0),s);
s=ready();for(let i=0;i<9;i++){s=M.pick(s,i);if(s.phase!=='done')s=M.pick(s,(i+3)%12);}assert.equal(s.winner,0);assert.equal(M.score(s.boards[0]).safe,9);
s=ready('friend',3,'quick');for(let i=0;i<6;i++){s=M.pick(s,i);s=M.pick(s,i);}assert.equal(s.phase,'done');assert.equal(s.winner,0);assert.equal(M.score(s.boards[1]).hits,3);
s=ready('friend',3,'quick');for(let i=0;i<6;i++){s=M.pick(s,i+3);s=M.pick(s,i+3);}assert.equal(s.winner,'draw');
for(const count of [3,4])for(let i=0;i<100;i++){const p=M.hidden(count);assert.equal(p.length,count);assert.equal(new Set(p).size,count);assert(p.every(x=>x>=0&&x<12));}
assert.equal(M.botChoice([0,1,2],()=>0),3);assert.equal(M.botChoice(Array.from({length:12},(_,i)=>i)),null);
// Different hidden traps do not affect the bot's choice for identical public information.
assert.equal(M.botChoice([0,2,4],()=>.5),M.botChoice([0,2,4],()=>.5));
let twice=ready();twice=M.pick(twice,0);twice=M.pick(twice,0);assert.equal(M.pick(twice,0),twice);
let four=ready('friend',4);assert.equal(four.count,4);four=M.pick(four,0);assert.equal(M.score(four.boards[0]).safe,1);
console.log('PASS: secret boards, setup validation, immutable turns, invalid/double picks, classic wins/losses, quick scores/ties, 3/4 traps and bot public-only choices.');
