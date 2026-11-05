// add the City of Chicago's official speed + red light camera lists to cams.json (from OSM), with the directions each one watches
import fs from 'fs';
const file=process.argv[2],base=JSON.parse(fs.readFileSync(file));
const D={NB:'N',SB:'S',EB:'E',WB:'W'};
const dist=(a,b)=>{const R=6371000,t=x=>x*Math.PI/180,dLa=t(b[1]-a[1]),dLo=t(b[0]-a[0]),x=Math.sin(dLa/2)**2+Math.cos(t(a[1]))*Math.cos(t(b[1]))*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.sqrt(x))};
const chi=[];
for(const [id,red] of [['4i42-qv3h',0],['thvf-6diy',1]]){
  const j=await (await fetch(`https://data.cityofchicago.org/resource/${id}.json?$limit=5000`,{headers:{'User-Agent':'Radar-dev/1.0 (+https://github.com/joshgraaves/radar)'}})).json();
  for(const c of j){if(!c.latitude)continue;const p=[+(+c.longitude).toFixed(5),+(+c.latitude).toFixed(5)];
    const dirs=[c.first_approach,c.second_approach,c.third_approach,c.fourth_approach].map(a=>D[a]).filter(Boolean);
    const same=chi.find(x=>x[3]===red&&dist([x[1],x[2]],p)<30);
    if(same){same[5]=[...new Set((same[5]+dirs.join('')).split(''))].join('');continue}
    chi.push([`chi-${red?'r':'s'}-${chi.length}`,p[0],p[1],red,'',dirs.join('')])}
}
const osm=base.cams.filter(o=>!chi.some(c=>dist([c[1],c[2]],[o[1],o[2]])<80)).map(o=>[o[0],o[1],o[2],o[3],o[4],'']);
const cams=[...chi,...osm];
fs.writeFileSync(file,JSON.stringify({made:new Date().toISOString().slice(0,10),region:'Illinois (OpenStreetMap) + City of Chicago official list',fields:'id,lon,lat,redLight,limit,watchedDirections',cams}));
console.log('chicago',chi.length,'(speed',chi.filter(c=>!c[3]).length,'red',chi.filter(c=>c[3]).length,') osm kept',osm.length,'total',cams.length,fs.statSync(file).size,'bytes');
