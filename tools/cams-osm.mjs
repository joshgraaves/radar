// one-off: all OSM speed / red-light cameras in a state -> cams.json for the app
import fs from 'fs';
const [state,out]=process.argv.slice(2);
const q=`[out:json][timeout:180];area["name"="${state}"]["admin_level"="4"]->.s;
(node["highway"="speed_camera"](area.s);node["enforcement"~"maxspeed|traffic_signals"](area.s);)->.n;
rel["type"="enforcement"]["enforcement"~"maxspeed|traffic_signals"](area.s)->.e;
.n out;.e out;node(r.e:"device");out;`;
const servers=['https://overpass-api.de/api/interpreter','https://overpass.private.coffee/api/interpreter','https://overpass.kumi.systems/api/interpreter'];
let j;for(const u of servers){try{const t=Date.now();const r=await fetch(u,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'Radar-dev/1.0 (+https://github.com/joshgraaves/radar)'},body:'data='+encodeURIComponent(q),signal:AbortSignal.timeout(200000)});console.log(u,r.status,Date.now()-t);if(r.ok){j=await r.json();break}}catch(e){console.log(u,e.message)}}
if(!j)process.exit(1);
const dev={};for(const e of j.elements)if(e.type==='relation')for(const m of e.members)if(m.role==='device'&&m.type==='node')dev[m.ref]={red:e.tags.enforcement==='traffic_signals',max:e.tags.maxspeed};
const seen={};for(const e of j.elements){if(e.type!=='node'||seen[e.id])continue;const t=e.tags||{},d=dev[e.id];if(!d&&t.highway!=='speed_camera'&&!t.enforcement)continue;
seen[e.id]=[e.id,+e.lon.toFixed(5),+e.lat.toFixed(5),(d?d.red:t.enforcement==='traffic_signals')?1:0,(d&&d.max)||t.maxspeed||''];}
const list=Object.values(seen);fs.writeFileSync(out,JSON.stringify({made:new Date().toISOString().slice(0,10),region:state,cams:list}));
console.log(list.length,'cams,',list.filter(c=>c[3]).length,'red light,',fs.statSync(out).size,'bytes');
