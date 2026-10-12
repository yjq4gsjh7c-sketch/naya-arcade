const assert=require('node:assert/strict');
const {cards,groups}=require('./cards.js');
assert.equal(cards.length,78);
assert.equal(cards.filter(c=>!c.hot).length,42);
assert.equal(cards.filter(c=>c.hot).length,36);
for(const card of cards.filter(c=>c.hot))assert.deepEqual(card.choices.map(c=>c.heat),[1,2,3],card.id);
for(const card of cards.filter(c=>c.hot))assert.deepEqual(card.choices.map(c=>c.heat),[1,2,3],card.id);
assert.equal(new Set(cards.map(c=>c.id)).size,cards.length);
assert.equal(new Set(cards.map(c=>c.prompt.it)).size,cards.length);
for(const card of cards){
 assert.ok(groups[card.category],card.id);
 assert.ok(card.prompt.it.trim().length>30,card.id);
 assert.ok(card.prompt.de.trim().length>30,card.id);
 assert.equal(card.choices.length,3,card.id);
 for(const choice of card.choices){assert.ok(choice.it.trim(),card.id);assert.ok(choice.de.trim(),card.id);}
 assert.equal(new Set(card.choices.map(c=>c.it)).size,3,card.id);
}
console.log('PASS: 78 distinct bilingual scenarios, 234 distinct choices, 42 classic and 36 hot cards.');
