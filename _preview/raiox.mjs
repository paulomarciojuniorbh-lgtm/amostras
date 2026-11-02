import { chromium } from 'playwright';
import fs from 'fs';
fs.rmSync('_preview/out', { recursive: true, force: true }); fs.mkdirSync('_preview/out', { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
await p.addInitScript(() => { try { localStorage.setItem('helice_eu', '1'); } catch (e) {} });
const shot = async n => { await p.waitForTimeout(900); await p.screenshot({ path: `_preview/out/raiox-${n}.jpg`, type: 'jpeg', quality: 72, fullPage: true }); };
p.on('console', m => console.log('console:', m.text()));
await p.goto('https://helicesites.com.br/raio-x/?utm_source=teste_claude', { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
await shot('1-inicio');
await p.fill('#q', 'Total Odonto');
await p.selectOption('#cid', 'São Luís');
await p.click('#b-busca');
await p.waitForSelector('#lista .item', { timeout: 15000 });
await shot('2-busca');
await p.click('#lista .item');
await p.waitForSelector('#s-quiz:not(.oculto)', { timeout: 15000 });
await shot('3-pergunta');
for (let i = 0; i < 8; i++) {
  if (!(await p.isVisible('#s-quiz'))) break;
  const ops = await p.$$('#q-ops .op'); await ops[Math.min(1, ops.length - 1)].click(); await p.waitForTimeout(250);
}
await p.waitForSelector('#s-res:not(.oculto)');
await shot('4-resultado');
await p.fill('#l-nome', 'Teste Claude');
await p.fill('#l-zap', '98900000000');
await p.check('#l-ok');
await p.click('#b-lead');
await p.waitForSelector('#r-liberado:not(.oculto)', { timeout: 15000 });
await shot('5-liberado');
// caminho "não achei"
await p.goto('https://helicesites.com.br/raio-x/?utm_source=teste_claude', { waitUntil: 'networkidle' });
await p.fill('#q', 'Padaria Teste Inexistente');
await p.click('#b-busca'); await p.waitForTimeout(3000);
await p.click('#b-naoachei');
await p.fill('#m-cid', 'Imperatriz'); await p.selectOption('#m-seg', 'Loja / comércio');
await p.click('#f-manual .btn');
for (let i = 0; i < 8; i++) { if (!(await p.isVisible('#s-quiz'))) break; const ops = await p.$$('#q-ops .op'); await ops[0].click(); await p.waitForTimeout(250); }
await shot('6-manual');
await b.close(); console.log('ok');
