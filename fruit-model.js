(function(root){'use strict';
const SIZE=12;
function shuffled(rng=Math.random){const a=Array.from({length:SIZE},(_,i)=>i);for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function hidden(count=3,rng=Math.random){return shuffled(rng).slice(0,count);}
function fresh(mode='bot',count=3,variant='classic',starter=0){return {mode:mode==='friend'?'friend':'bot',count:count===4?4:3,variant:variant==='quick'?'quick':'classic',phase:'setup',setter:0,turn:starter===1?1:0,boards:[{poison:[],picked:[]},{poison:[],picked:[]}],winner:null};}
function seal(s,cells){if(s.phase!=='setup'||!Array.isArray(cells)||cells.length!==s.count||new Set(cells).size!==s.count||cells.some(i=>!Number.isInteger(i)||i<0||i>=SIZE))return s;const boards=s.boards.map(b=>({...b,poison:[...b.poison],picked:[...b.picked]}));boards[1-s.setter].poison=[...cells];return {...s,boards,setter:s.setter+1,phase:s.setter===1?'play':'setup'};}
function score(board){const hits=board.picked.filter(i=>board.poison.includes(i)).length;return {hits,safe:board.picked.length-hits,picks:board.picked.length};}
function pick(s,cell){if(s.phase!=='play'||!Number.isInteger(cell)||cell<0||cell>=SIZE||s.boards[s.turn].picked.includes(cell))return s;const player=s.turn,boards=s.boards.map((b,i)=>({...b,picked:i===player?[...b.picked,cell]:[...b.picked]})),sc=score(boards[player]);let winner=null,ended=false;
if(s.variant==='classic'){if(sc.hits===s.count){winner=1-player;ended=true;}else if(sc.safe===SIZE-s.count){winner=player;ended=true;}}
else if(boards.every(b=>b.picked.length===6)){const a=score(boards[0]),b=score(boards[1]);winner=a.hits===b.hits?'draw':a.hits<b.hits?0:1;ended=true;}
return {...s,boards,turn:1-player,phase:ended?'done':'play',winner};}
// The bot receives only publicly revealed cell indices, never hidden poison locations.
function botChoice(picked,rng=Math.random){const available=Array.from({length:SIZE},(_,i)=>i).filter(i=>!picked.includes(i));return available.length?available[Math.floor(rng()*available.length)]:null;}
root.NayaFruit={SIZE,hidden,fresh,seal,score,pick,botChoice};
})(typeof window!=='undefined'?window:globalThis);
