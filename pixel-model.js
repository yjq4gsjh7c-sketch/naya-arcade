/* Original, hand-composed pixel pictures. No image files or third-party art. */
(function (root) {
  'use strict';
  const SIZE = 20;
  const schemes = {
    rose: ['#f26f92','#ffadbc','#ffe28c','#a47ce0','#743d70','#fff2dd','#77cf8d','#5eb5df'],
    sunny: ['#ffab52','#ffd46d','#fff0ad','#e97864','#915968','#fff5dc','#70c488','#6abbe5'],
    forest: ['#75cb87','#3ba982','#d9ed92','#a7735a','#755b70','#fff0d8','#ee88a0','#72bce8'],
    ocean: ['#5cbfdb','#418acf','#a3e8e5','#7655a9','#394b8b','#fff2dc','#ff9d8e','#7bdc9b'],
    violet: ['#a886e8','#d4b3fa','#fff0a1','#f484ac','#72549b','#fff6e4','#8dd3a1','#82bee8'],
    cocoa: ['#b77d61','#e1ac7d','#ffe5b7','#ee8c94','#765367','#fff5e8','#86ca8a','#8ec6e9']
  };
  const DATA = [
    ['heart','Herz','Tiere & Liebe','rose'],['cat','Katze','Tiere & Liebe','cocoa'],['bunny','Hase','Tiere & Liebe','rose'],['fox','Fuchs','Tiere & Liebe','sunny'],['panda','Panda','Tiere & Liebe','cocoa'],['owl','Eule','Tiere & Liebe','violet'],['fish','Fisch','Tiere & Liebe','ocean'],['butterfly','Schmetterling','Tiere & Liebe','rose'],
    ['unicorn','Einhorn','Zauberwelt','violet'],['dragon','Drache','Zauberwelt','forest'],['castle','Schloss','Zauberwelt','violet'],['crown','Krone','Zauberwelt','sunny'],['potion','Zaubertrank','Zauberwelt','ocean'],['star','Stern','Zauberwelt','sunny'],['rainbow','Regenbogen','Zauberwelt','rose'],['moon','Mond','Zauberwelt','violet'],
    ['flower','Blume','Natur & Garten','rose'],['sunflower','Sonnenblume','Natur & Garten','sunny'],['tree','Baum','Natur & Garten','forest'],['mushroom','Pilz','Natur & Garten','rose'],['strawberry','Erdbeere','Natur & Garten','rose'],['watermelon','Wassermelone','Natur & Garten','forest'],['bee','Biene','Natur & Garten','sunny'],['snail','Schnecke','Natur & Garten','cocoa'],
    ['house','Häuschen','Abenteuer','rose'],['rocket','Rakete','Abenteuer','ocean'],['robot','Roboter','Abenteuer','violet'],['boat','Segelboot','Abenteuer','ocean'],['balloon','Ballon','Abenteuer','rose'],['gift','Geschenk','Abenteuer','violet'],['icecream','Eis','Abenteuer','sunny'],['car','Auto','Abenteuer','forest']
  ];
  const pictures = DATA.map(([id,name,category,scheme])=>({id,name,category,palette:schemes[scheme]}));
  function make(id) {
    const p = pictures.find(x=>x.id===id); if (!p) throw Error('Unknown picture: '+id);
    const a = new Int8Array(SIZE*SIZE);
    const put=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&x<SIZE&&y>=0&&y<SIZE)a[y*SIZE+x]=c;};
    const rect=(x,y,w,h,c)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)put(xx,yy,c);};
    const ellipse=(cx,cy,rx,ry,c)=>{for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)put(x,y,c);};
    const poly=(pts,c)=>{for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){let inside=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,yi]=pts[i],[xj,yj]=pts[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;}if(inside)put(x,y,c);}};
    const line=(x1,y1,x2,y2,c,r=0)=>{const n=Math.max(Math.abs(x2-x1),Math.abs(y2-y1))*3+1;for(let i=0;i<=n;i++){const x=x1+(x2-x1)*i/n,y=y1+(y2-y1)*i/n;for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++)put(x+xx,y+yy,c);}};
    const eyes=(x1,x2,y)=>{put(x1,y,-1);put(x2,y,-1);};
    const blush=(x1,x2,y)=>{put(x1,y,4);put(x2,y,4);};
    switch(id){
      case 'heart': ellipse(6,6,4,4,1);ellipse(13,6,4,4,1);poly([[2,7],[17,7],[10,18]],1);ellipse(6,6,2,2,2);rect(8,12,4,2,3);break;
      case 'cat': poly([[4,9],[3,2],[8,6],[12,6],[17,2],[16,9]],1);ellipse(10,11,7,6,1);ellipse(7,12,2,2,6);ellipse(13,12,2,2,6);eyes(7,13,10);put(10,13,4);line(9,14,11,14,-1);blush(5,15,13);break;
      case 'bunny': ellipse(6,5,2,5,1);ellipse(14,5,2,5,1);ellipse(6,5,1,3,4);ellipse(14,5,1,3,4);ellipse(10,12,7,6,6);ellipse(10,16,3,1,1);eyes(7,13,11);put(10,14,4);blush(5,15,13);break;
      case 'fox': poly([[3,5],[6,2],[9,5],[11,5],[14,2],[17,5],[15,15],[10,18],[5,15]],1);poly([[4,12],[10,17],[16,12],[13,15],[7,15]],6);ellipse(10,14,2,1,5);eyes(7,13,10);blush(5,15,12);break;
      case 'panda': ellipse(10,10,7,7,6);ellipse(5,4,2,2,5);ellipse(15,4,2,2,5);ellipse(7,10,2,3,5);ellipse(13,10,2,3,5);eyes(7,13,10);ellipse(10,14,2,1,5);put(10,16,4);break;
      case 'owl': ellipse(10,10,7,7,1);poly([[4,6],[5,2],[8,5]],1);poly([[12,5],[15,2],[16,6]],1);ellipse(7,10,3,3,6);ellipse(13,10,3,3,6);eyes(7,13,10);poly([[9,12],[12,12],[10,15]],3);rect(7,17,2,1,3);rect(12,17,2,1,3);break;
      case 'fish': ellipse(9,10,6,5,1);poly([[13,10],[18,5],[18,15]],4);poly([[7,6],[11,2],[12,7]],2);poly([[7,14],[11,18],[12,13]],2);ellipse(7,9,1,1,6);put(7,9,-1);rect(10,7,1,7,3);rect(12,8,1,5,3);break;
      case 'butterfly': ellipse(6,6,4,4,1);ellipse(14,6,4,4,1);ellipse(6,13,3,4,4);ellipse(14,13,3,4,4);ellipse(6,6,2,2,3);ellipse(14,6,2,2,3);ellipse(10,10,1.5,6,5);line(9,5,7,2,-1);line(11,5,13,2,-1);break;
      case 'unicorn': ellipse(10,12,6,5,6);poly([[7,8],[8,3],[11,8]],1);poly([[11,8],[14,3],[15,9]],1);poly([[9,6],[13,1],[13,7]],3);rect(4,9,3,4,1);rect(5,7,3,3,4);rect(8,6,3,3,1);ellipse(13,12,1,1,5);put(13,12,-1);blush(7,15,14);break;
      case 'dragon': ellipse(10,11,6,6,1);ellipse(6,5,3,3,1);poly([[5,4],[3,1],[8,4]],3);poly([[11,6],[14,2],[16,9]],2);poly([[14,9],[18,6],[17,13]],2);poly([[15,13],[18,17],[12,16]],1);eyes(6,11,8);rect(8,14,4,2,6);break;
      case 'castle': rect(4,8,12,10,1);rect(3,5,4,13,2);rect(13,5,4,13,2);rect(3,3,2,3,4);rect(6,3,2,3,4);rect(12,3,2,3,4);rect(15,3,2,3,4);poly([[8,18],[8,13],[10,11],[12,13],[12,18]],5);rect(5,8,2,3,3);rect(13,8,2,3,3);break;
      case 'crown': poly([[2,5],[6,9],[10,3],[14,9],[18,5],[16,16],[4,16]],3);rect(4,14,12,3,1);ellipse(6,12,1,1,4);ellipse(10,10,1,1,1);ellipse(14,12,1,1,8);break;
      case 'potion': rect(8,3,4,3,5);rect(6,5,8,2,4);ellipse(10,12,6,6,1);rect(5,12,10,3,3);ellipse(8,11,1,1,6);ellipse(12,14,1,1,6);ellipse(10,9,1,1,2);break;
      case 'star': poly([[10,1],[12,7],[18,7],[13,11],[15,18],[10,14],[5,18],[7,11],[2,7],[8,7]],3);rect(7,9,1,1,-1);rect(12,9,1,1,-1);blush(5,15,11);break;
      case 'rainbow': ellipse(10,13,8,10,1);ellipse(10,15,6,8,2);ellipse(10,17,4,6,3);ellipse(10,18,2,5,0);rect(1,12,3,4,6);rect(16,12,3,4,6);break;
      case 'moon': ellipse(9,9,7,7,3);ellipse(13,6,6,6,0);ellipse(15,14,1,1,6);ellipse(3,15,1,1,6);poly([[16,2],[17,4],[19,4],[17,5],[17,7],[15,5],[13,5],[15,4]],2);break;
      case 'flower': rect(9,10,2,8,7);ellipse(7,14,3,2,7);ellipse(13,15,3,2,7);ellipse(10,5,3,3,1);ellipse(5,9,3,3,1);ellipse(15,9,3,3,1);ellipse(7,13,3,3,1);ellipse(13,13,3,3,1);ellipse(10,9,3,3,3);break;
      case 'sunflower': rect(9,11,2,7,7);ellipse(6,15,3,2,7);ellipse(14,16,3,2,7);for(let i=0;i<8;i++){const t=i*Math.PI/4;ellipse(10+5*Math.cos(t),8+5*Math.sin(t),2,2,2);}ellipse(10,8,4,4,5);ellipse(9,7,1,1,3);break;
      case 'tree': rect(8,10,4,8,4);ellipse(6,9,4,4,1);ellipse(14,9,4,4,1);ellipse(10,6,5,5,2);ellipse(6,10,1,1,4);ellipse(13,5,1,1,4);ellipse(15,10,1,1,4);break;
      case 'mushroom': ellipse(10,9,8,6,1);rect(3,9,14,2,1);rect(7,10,6,8,6);ellipse(7,6,2,2,6);ellipse(13,6,2,2,6);eyes(9,11,14);blush(7,13,15);break;
      case 'strawberry': poly([[3,6],[17,6],[16,12],[10,19],[4,12]],1);ellipse(10,6,6,3,1);ellipse(10,4,5,2,7);poly([[9,3],[10,1],[11,4]],7);for(const [x,y] of [[6,9],[10,9],[14,9],[8,12],[12,12],[10,15]])put(x,y,3);break;
      case 'watermelon': poly([[2,6],[18,6],[16,14],[10,18],[4,14]],1);ellipse(10,6,8,2,4);rect(3,6,14,2,6);for(const [x,y] of [[7,10],[11,10],[14,11],[9,13],[12,14]])put(x,y,5);break;
      case 'bee': ellipse(10,10,7,5,2);ellipse(7,5,3,3,6);ellipse(13,5,3,3,6);rect(7,6,2,9,5);rect(12,6,2,9,5);eyes(7,13,10);poly([[16,9],[19,10],[16,11]],5);blush(5,15,12);break;
      case 'snail': ellipse(11,11,6,6,1);ellipse(11,11,3,3,2);ellipse(11,11,1,1,4);rect(2,14,15,3,4);rect(3,8,3,7,4);line(4,8,4,5,4);line(6,8,6,5,4);put(4,5,-1);put(6,5,-1);break;
      case 'house': rect(4,9,12,9,1);poly([[2,9],[10,2],[18,9]],4);rect(8,12,4,6,2);rect(5,11,2,3,6);rect(13,11,2,3,6);rect(14,3,2,4,3);ellipse(11,15,1,1,3);break;
      case 'rocket': poly([[10,2],[14,6],[14,15],[6,15],[6,6]],1);poly([[6,6],[10,1],[14,6]],4);ellipse(10,9,3,3,6);ellipse(10,9,1,1,8);poly([[6,12],[3,17],[6,16]],2);poly([[14,12],[17,17],[14,16]],2);poly([[8,15],[10,19],[12,15]],3);break;
      case 'robot': rect(4,5,12,11,1);rect(7,2,6,3,2);rect(9,1,2,2,4);rect(2,9,2,6,4);rect(16,9,2,6,4);rect(6,16,3,2,5);rect(11,16,3,2,5);rect(6,8,3,3,6);rect(11,8,3,3,6);put(7,9,5);put(12,9,5);rect(8,13,4,1,5);break;
      case 'boat': poly([[2,12],[18,12],[15,17],[5,17]],1);line(10,3,10,12,5);poly([[9,3],[9,11],[3,11]],6);poly([[11,4],[11,11],[17,11]],3);rect(8,14,4,1,2);break;
      case 'balloon': ellipse(10,7,6,6,1);ellipse(8,5,2,2,2);poly([[9,13],[11,13],[10,15]],4);line(10,15,10,18,5);poly([[7,17],[10,16],[13,17],[10,19]],3);break;
      case 'gift': rect(3,8,14,10,1);rect(2,7,16,3,2);rect(9,7,2,11,3);ellipse(7,5,3,2,4);ellipse(13,5,3,2,4);rect(9,4,2,4,3);break;
      case 'icecream': poly([[5,9],[15,9],[11,18],[9,18]],4);ellipse(10,9,6,4,1);ellipse(10,6,5,4,2);ellipse(8,4,1,1,6);put(13,8,3);put(7,8,3);break;
      case 'car': rect(2,9,16,7,1);poly([[5,9],[7,5],[13,5],[16,9]],2);rect(7,7,2,2,6);rect(11,7,2,2,6);ellipse(6,16,2,2,5);ellipse(14,16,2,2,5);rect(16,11,2,2,3);break;
    }
    // Add a one-pixel dark border outside each coloured silhouette.
    const body=Int8Array.from(a);for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++)if(body[y*SIZE+x]>0)for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<SIZE&&yy>=0&&yy<SIZE&&body[yy*SIZE+xx]===0)a[yy*SIZE+xx]=-1;}
    return {picture:p,size:SIZE,cells:Array.from(a),total:a.filter(v=>v>0).length};
  }
  root.NayaPixels={pictures,make,size:SIZE};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.NayaPixels;
})(typeof window==='undefined'?globalThis:window);
