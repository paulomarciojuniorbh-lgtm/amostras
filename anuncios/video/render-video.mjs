// Renderiza o vídeo vertical 1080x1920 quadro a quadro e junta com o áudio.
// node anuncios/video/render-video.mjs [--shots] [--preview]
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const D = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(D, 'out'); fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(D, 'shots'), { recursive: true });
const args = process.argv.slice(2);
const FPS = 30;
const b = await chromium.launch();

if (args.includes('--shots')) {
  const B = 'https://helicesites.com.br';
  const shots = [
    { f: 'v-geovanna', u: '/geovanna-marreiros/', sel: null },
    { f: 'v-anapaula', u: '/ana-paula-beauty-hair/', sel: '#agendar', act: async p => { await p.click('[data-pre="mechas"]'); await p.click('[data-sv="Morena iluminada"]'); await p.click('#segue'); await p.click('.dia:not([disabled])'); await p.click('.hr:not([disabled])'); } },
    { f: 'v-faby', u: '/faby-santos-hair/', sel: '#lojinha' },
  ];
  for (const s of shots) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    p.on('popup', x => x.close());
    await p.addInitScript(() => { try { localStorage.setItem('helice_eu', '1'); } catch (e) {} });
    await p.goto(B + s.u, { waitUntil: 'networkidle' });
    await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelectorAll('.rv').forEach(e => e.classList.add('vis')); });
    // rola a página toda para carregar imagens preguiçosas
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); });
    if (s.act) { try { await s.act(p); } catch (e) { console.log('act falhou', s.f, e.message); } }
    const top = s.sel ? await p.evaluate(sel => document.querySelector(sel).getBoundingClientRect().top + scrollY - 60, s.sel) : 0;
    await p.evaluate(() => document.querySelectorAll('header,.hd,#hd,nav').forEach(e => { if (getComputedStyle(e).position === 'fixed' || getComputedStyle(e).position === 'sticky') e.style.position = 'absolute'; }));
    await p.waitForTimeout(1200);
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    await p.screenshot({ path: path.join(D, 'shots', s.f + '.jpg'), type: 'jpeg', quality: 82, fullPage: true, clip: { x: 0, y: Math.max(0, top), width: 390, height: Math.min(2600, H - Math.max(0, top)) } });
    await p.close();
    console.log('shot', s.f);
  }
}

const tlFile = path.join(OUT, 'timeline.json');
const TL = fs.existsSync(tlFile) ? JSON.parse(fs.readFileSync(tlFile, 'utf8')) : null;
const page = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
if (TL) await page.addInitScript(tl => { window.TL = tl; }, TL);
await page.goto('file://' + path.join(D, 'video.html'), { waitUntil: 'networkidle' });
await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
const total = await page.evaluate(() => (window.TL || { total: 26 }).total) || 26;

if (args.includes('--preview')) {
  // quadros-chave para conferir layout
  const ts = await page.evaluate(() => TL.cenas.map(c => (c.ini + c.fim) / 2 + 0.3));
  for (const [i, t] of ts.entries()) { await page.evaluate(t => render(t), t); await page.screenshot({ path: path.join(OUT, `prev-${i + 1}.jpg`), type: 'jpeg', quality: 80 }); }
  await b.close(); console.log('preview ok'); process.exit(0);
}

const nFrames = Math.ceil(total * FPS);
const wav = path.join(OUT, 'final.wav');
const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  ...(fs.existsSync(wav) ? ['-i', wav, '-c:a', 'aac', '-b:a', '192k', '-shortest'] : []),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  path.join(OUT, 'helice-video.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
for (let f = 0; f < nFrames; f++) {
  await page.evaluate(t => render(t), f / FPS);
  const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % 150 === 0) console.log('frame', f, '/', nFrames);
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
// capa (frame do fim)
await page.evaluate(t => render(t), total - 0.4);
await page.screenshot({ path: path.join(OUT, 'helice-video-capa.jpg'), type: 'jpeg', quality: 88 });
await b.close();
console.log('video ok');
