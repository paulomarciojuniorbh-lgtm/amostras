import { chromium } from 'playwright';
import fs from 'fs';
fs.mkdirSync('_preview/reel', { recursive: true });
const troca = async (p, pares) => p.evaluate(pares => { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { for (const [a, b] of pares) n.nodeValue = n.nodeValue.split(a).join(b); } document.title = ''; }, pares);
const S = [
  { f: 'fleet-cel', u: 'https://paulomarciojuniorbh-lgtm.github.io/fleetmanager-pro/', w: 390, h: 844, act: async p => { await p.click('text=Ver a frota de exemplo'); await p.waitForTimeout(2500); } },
  { f: 'fleet-pc', u: 'https://paulomarciojuniorbh-lgtm.github.io/fleetmanager-pro/', w: 1280, h: 800, act: async p => { await p.click('text=Ver a frota de exemplo'); await p.waitForTimeout(2500); } },
  { f: 'salao', u: 'https://helicesites.com.br/ana-paula-beauty-hair/', w: 390, h: 844, sel: '#agendar', act: async p => { await p.click('[data-pre="mechas"]'); await p.click('[data-sv="Morena iluminada"]'); await p.click('#segue'); await p.click('.dia:not([disabled])'); await p.click('.hr:not([disabled])'); await troca(p, [['Ana Paula Santos','Studio Bella'],['Ana Paula','a Bella'],['AP','SB']]); } },
  { f: 'tattoo', u: 'https://helicesites.com.br/pulsar-art-tattoo/', w: 390, h: 844, sel: '#res', act: async p => { for (const s of ['[data-q=tam] .op[data-v="3"]','[data-q=cor] .op[data-v="3"]','[data-q=ida] .op[data-v="0"]','[data-q=loc] .op[data-v="0.5"]']) await p.click(s); await troca(p, [['Hugo','Rafa'],['Pulsar','Inkfire']]); } },
  { f: 'tattoo-hero', u: 'https://helicesites.com.br/pulsar-art-tattoo/', w: 390, h: 844, act: async p => { await troca(p, [['Hugo Oliveira','Rafa Lima'],['Hugo','Rafa'],['Pulsar','Inkfire'],['Barreiro, BH','Centro']]); } },
  { f: 'advogado', u: 'https://helicesites.com.br/lote1/ricardo-aragao-advogado/', w: 390, h: 844, act: async p => { await troca(p, [['Ricardo Pinto Aragão','Marcos Lima'],['Ricardo','Marcos'],['RA','ML'],['São Luís','sua cidade']]); await p.evaluate(() => { const b = [...document.querySelectorAll('body *')].find(e => /Modelo de demonstração/.test(e.textContent) && e.children.length < 4); if (b) b.style.display = 'none'; }); } },
  
];
const b = await chromium.launch();
for (const s of S) {
  const p = await b.newPage({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 2 });
  p.on('popup', x => x.close());
  await p.addInitScript(() => { try { localStorage.setItem('helice_eu', '1'); } catch (e) {} });
  try {
    await p.goto(s.u, { waitUntil: 'networkidle', timeout: 60000 });
    await p.evaluate(async () => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelectorAll('.re,.rv').forEach(e => e.classList.add('vis')); for (let y = 0; y < Math.min(6000, document.body.scrollHeight); y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); });
    if (s.act) { try { await s.act(p); } catch (e) { console.log('act', s.f, e.message); } }
    if (s.sel) await p.evaluate(sel => { const e = document.querySelector(sel); if (e) scrollTo(0, e.getBoundingClientRect().top + scrollY - 80); }, s.sel);
    await p.waitForTimeout(1800);
    await p.screenshot({ path: `_preview/reel/${s.f}.jpg`, type: 'jpeg', quality: 85 });
    if (s.f === 'fleet-pc' || s.f === 'fleet-cel') console.log(s.f, (await p.evaluate(() => document.body.innerText)).slice(0, 600).replace(/\n+/g, ' | '));
  } catch (e) { console.log('fail', s.f, e.message); }
  await p.close();
}
await b.close(); console.log('ok');
