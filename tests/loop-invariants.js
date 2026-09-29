// Checks generator invariants: no line crossings (within or across loops) and every sealed cell is inside the sealed polygon.
// Run: node tests/loop-invariants.js
// Loads the doodle generator straight out of ../index.html so this script never drifts from the game.
const fs=require('fs'), path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1];
const GEN=js.slice(js.indexOf('const rnd'), js.indexOf('function cellNear'));
eval('var ASPECT=1.3, EASY=0.2; var G;\n'+GEN.replace(/^const |\nconst /g, m=>m.replace('const','var'))+'\nglobalThis.generate=generate; globalThis.pip=pip;');
function segx(a,b,c,d){const o=(p,q,r)=>Math.sign((q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]));return o(a,b,c)*o(a,b,d)<0&&o(c,d,a)*o(c,d,b)<0;}
for(const lvl of [1,8,9,10,12,15]){ for(let t=0;t<2;t++){
 const t0=Date.now(); G=generate(lvl); const ms=Date.now()-t0;
 // all segments across all loops
 const segs=[]; G.loops.forEach((lp,li)=>{const p=lp.pts,n=p.length; for(let i=0;i<n;i++) segs.push([p[i],p[(i+1)%n],li,i,n]);});
 // grid bucket to speed up
 const B=new Map(), cs=1.5; const key=(x,y)=>Math.floor(x/cs)+','+Math.floor(y/cs);
 segs.forEach((sg,idx)=>{const xs=[sg[0][0],sg[1][0]],ys=[sg[0][1],sg[1][1]]; for(let x=Math.floor(Math.min(...xs)/cs);x<=Math.floor(Math.max(...xs)/cs);x++)for(let y=Math.floor(Math.min(...ys)/cs);y<=Math.floor(Math.max(...ys)/cs);y++){const k=x+','+y; if(!B.has(k))B.set(k,[]); B.get(k).push(idx);}});
 let bad=0; const seen=new Set();
 for(const arr of B.values()) for(let a=0;a<arr.length;a++)for(let b=a+1;b<arr.length;b++){const i=arr[a],j=arr[b]; const P=segs[i],Q=segs[j];
   if(P[2]===Q[2]){const d=Math.abs(P[3]-Q[3]); if(d<=1||d===P[4]-1)continue;}
   const k=i<j?i+'_'+j:j+'_'+i; if(seen.has(k))continue; seen.add(k); if(segx(P[0],P[1],Q[0],Q[1]))bad++;}
 let mis=0; for(const k of G.cells){const [u,v]=G.cpos.get(k); if(!pip(u,v,G.sealed.pts))mis++;}
 console.log('lvl',lvl,'loops',G.loops.length,'sealedCells',G.cells.length,'crossings',bad,'cells not inside',mis,'ms',ms);
}}
