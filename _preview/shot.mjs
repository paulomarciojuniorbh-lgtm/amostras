import { chromium } from 'playwright';
import fs from 'fs';
const urls = fs.readFileSync('_preview/urls.txt', 'utf8').split('\n').map(s => s.trim()).filter(Boolean);
fs.rmSync('_preview/out', { recursive: true, force: true }); fs.mkdirSync('_preview/out', { recursive: true });
const b = await chromium.launch();
for (const [i, u] of urls.entries()) {
  for (const [nm, w, h] of [['cel', 390, 844], ['pc', 1280, 800]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.addInitScript(() => { try { localStorage.setItem('helice_eu', '1'); } catch (e) {} });
    await p.goto(u, { waitUntil: 'networkidle' });
    await p.evaluate(async () => { document.querySelectorAll('.re,.rv').forEach(e => e.classList.add('vis')); for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); } scrollTo(0, 0); });
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `_preview/out/${i}-${nm}.jpg`, type: 'jpeg', quality: 70, fullPage: true });
    await p.close();
  }
}
await b.close(); console.log('ok');
