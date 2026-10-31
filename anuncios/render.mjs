import { chromium } from 'playwright';
import fs from 'fs';
const B='https://helicesites.com.br';
const shots=[
 {f:'geovanna',u:'/geovanna-marreiros/',sel:null},
 {f:'geovanna-mapa',u:'/geovanna-marreiros/',sel:'#mapa',act:async p=>{await p.click('.pin[data-k="labios"]');await p.click('#add');}},
 {f:'geovanna-painel',u:'/geovanna-marreiros/',sel:'#painel'},
 {f:'anapaula-agenda',u:'/ana-paula-beauty-hair/',sel:'#agendar',act:async p=>{await p.click('[data-pre="mechas"]');await p.click('[data-sv="Morena iluminada"]');await p.click('#segue');await p.click('.dia:not([disabled])');await p.click('.hr:not([disabled])');}},
 {f:'faby-loja',u:'/faby-santos-hair/',sel:'#lojinha'},
];
fs.mkdirSync('anuncios/shots',{recursive:true});fs.mkdirSync('anuncios/png',{recursive:true});
const b=await chromium.launch();
for(const s of shots){
  const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
  p.on('popup',x=>x.close());
  await p.goto(B+s.u,{waitUntil:'networkidle'});
  await p.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';document.querySelectorAll('.rv').forEach(e=>e.classList.add('vis'))});
  if(s.act)await s.act(p);
  if(s.sel)await p.evaluate(sel=>{const e=document.querySelector(sel);scrollTo(0,e.getBoundingClientRect().top+scrollY-70)},s.sel);
  await p.waitForTimeout(1500);
  await p.screenshot({path:`anuncios/shots/${s.f}.png`});
  await p.close();
}
const p=await b.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1});
await p.goto('file://'+process.cwd()+'/anuncios/criativos.html',{waitUntil:'networkidle'});
await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1000);
for(let i=1;i<=10;i++){await p.locator('#c'+i).screenshot({path:`anuncios/png/criativo-${String(i).padStart(2,'0')}.png`});}
const m=await b.newPage({viewport:{width:1700,height:1800}});
await m.goto('file://'+process.cwd()+'/anuncios/marca.html',{waitUntil:'networkidle'});await m.waitForTimeout(800);
await m.locator('#logo').screenshot({path:'anuncios/png/helice-perfil.png'});await m.locator('#capa').screenshot({path:'anuncios/png/helice-capa.png'});
await b.close();
console.log('ok');
