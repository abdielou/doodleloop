// Builds doodleloop-preview.svg (animated README banner, SMIL animation) from the game's own generator.
// Run: node tools/make-preview.js   (random doodle each run)
// Loads the doodle generator straight out of ../index.html so this script never drifts from the game.
const fs=require('fs'), path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1];
const GEN=js.slice(js.indexOf('const rnd'), js.indexOf('function cellNear'));
eval('var ASPECT=0.62, EASY=0.2; var G;\n'+GEN.replace(/^const |\nconst /g, m=>m.replace('const','var'))+'\nglobalThis.generate=generate;');
let best=null;
for(let i=0;i<40;i++){ const g=generate(6); const b=g.bbox; const ar=(b.maxX-b.minX)/(b.maxY-b.minY);
  if(!best || Math.abs(ar-1.7)<Math.abs(best.ar-1.7)) best={g,ar}; }
G=best.g;
const W=880,H=360, R={x:330,y:22,w:528,h:316};
const b=G.bbox, s=Math.min(R.w/(b.maxX-b.minX), R.h/(b.maxY-b.minY));
const ox=R.x+(R.w-s*(b.maxX-b.minX))/2 - s*b.minX, oy=R.y+(R.h-s*(b.maxY-b.minY))/2 - s*b.minY;
const X=u=>(ox+u*s).toFixed(1), Y=v=>(oy+v*s).toFixed(1);
const d='M'+G.sealed.pts.map(([u,v])=>X(u)+' '+Y(v)).join('L')+'Z';
const tip=[255,241,166], core=[255,79,139];
const mix=(t)=>'#'+tip.map((a,i)=>Math.round(a+(core[i]-a)*t).toString(16).padStart(2,'0')).join('');
const half=s*0.82;
let rects='';
for(const k of G.cells){ const r=G.rim[k], [u,v]=G.cpos.get(k);
  const f = r<EASY ? '#DCE2E6' : mix(Math.pow((r-EASY)/(1-EASY),1.2));
  rects+=`<rect x="${(ox+u*s-half).toFixed(1)}" y="${(oy+v*s-half).toFixed(1)}" width="${(2*half).toFixed(1)}" height="${(2*half).toFixed(1)}" fill="${f}"/>`; }
// tap: a deep-ish cell that isn't the center
let tapK=G.center, bd=9; for(const k of G.cells){ const r=G.rim[k]; if(k!==G.center && Math.abs(r-0.8)<bd){bd=Math.abs(r-0.8); tapK=k;} }
const [tu,tv]=G.cpos.get(tapK), [cu,cv]=G.cpos.get(G.center);
const star=(x,y,r)=>{let p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5, rr=i%2?r*.45:r;p.push((x+Math.cos(a)*rr).toFixed(1)+','+(y+Math.sin(a)*rr).toFixed(1));}return p.join(' ');};
let rules=''; for(let y=34;y<H;y+=26) rules+=`<line x1="0" y1="${y+.5}" x2="${W}" y2="${y+.5}"/>`;
const sw=Math.max(1.6,Math.min(2.4,s*.17)).toFixed(1);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="doodleloop: a doodle draws itself, then its inside fills in">
<title>doodleloop</title>

<defs><clipPath id="card"><rect x="2" y="2" width="${W-4}" height="${H-4}" rx="17"/></clipPath><clipPath id="in"><path d="${d}"/></clipPath></defs>
<rect x="1" y="1" width="${W-2}" height="${H-2}" rx="18" fill="#F7F9F8" stroke="#C6DFDB" stroke-width="2"/>
<g stroke="#C6DFDB" stroke-width="1" clip-path="url(#card)">${rules}</g>
<g font-family="'Segoe UI',Helvetica,Arial,sans-serif" fill="#1F2A55">
<text x="44" y="150" font-size="50" font-weight="800" letter-spacing="-1">doodleloop</text>
<text x="46" y="188" font-size="19" fill="#5A6479">One closed line. Find the inside.</text>
<text x="46" y="212" font-size="19" fill="#5A6479">Deeper and faster scores more.</text>
<rect x="44" y="238" width="124" height="46" rx="23" fill="#1F2A55"/>
<path d="M68 250 L68 272 L86 261 Z" fill="#F7F9F8"/>
<text x="96" y="268" font-size="20" font-weight="700" fill="#F7F9F8">Play</text>
</g>
<g><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.88;0.97;1" dur="10s" repeatCount="indefinite"/>
<g clip-path="url(#in)"><animate attributeName="opacity" values="0;0;1;1" keyTimes="0;0.48;0.58;1" dur="10s" repeatCount="indefinite"/>${rects}</g>
<path pathLength="1000" stroke-dasharray="1000" d="${d}" fill="none" stroke="#1F2A55" stroke-width="${sw}" stroke-linejoin="round"><animate attributeName="stroke-dashoffset" values="1000;0;0" keyTimes="0;0.42;1" dur="10s" repeatCount="indefinite"/></path>
<circle cx="${(ox+tu*s).toFixed(1)}" cy="${(oy+tv*s).toFixed(1)}" r="7" fill="#1F2A55" stroke="#F7F9F8" stroke-width="2.5"><animate attributeName="opacity" values="0;0;1;1" keyTimes="0;0.46;0.49;1" dur="10s" repeatCount="indefinite"/><animate attributeName="r" values="17;17;7;7" keyTimes="0;0.46;0.49;1" dur="10s" repeatCount="indefinite"/></circle>
<g transform="translate(${(ox+cu*s).toFixed(1)} ${(oy+cv*s).toFixed(1)})"><g><animateTransform attributeName="transform" type="scale" values="0.01;0.01;1.2;1;1" keyTimes="0;0.58;0.64;0.68;1" dur="10s" repeatCount="indefinite"/><polygon points="${star(0,0,Math.max(10,s*.9))}" fill="#F7F9F8" stroke="#1F2A55" stroke-width="2" stroke-linejoin="round"/></g></g>
</g>
</svg>`;
fs.writeFileSync(require('path').join(__dirname,'..','doodleloop-preview.svg'), svg);
console.log('bytes',svg.length,'cells',G.cells.length,'ar',best.ar.toFixed(2));
