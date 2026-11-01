"""Gera a narração (Piper, pt-BR), a trilha original e a mixagem final.
Uso:
  python audio.py voz     -> out/voz_*.wav + out/timeline.json
  python audio.py mix     -> out/final.wav  (precisa da timeline)
"""
import json, os, subprocess, sys, wave
import numpy as np

D = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(D, 'out'); os.makedirs(OUT, exist_ok=True)
SR = 44100
MODEL = os.environ.get('PIPER_MODEL', os.path.join(D, 'pt_BR-faber-medium.onnx'))


def ler_wav(p):
    with wave.open(p) as w:
        sr, n, ch = w.getframerate(), w.getnframes(), w.getnchannels()
        a = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32) / 32768
    if ch > 1: a = a.reshape(-1, ch).mean(1)
    if sr != SR:
        t = np.arange(int(len(a) * SR / sr)) / SR
        a = np.interp(t, np.arange(len(a)) / sr, a)
    return a


def gravar(p, a):
    a = np.clip(a, -1, 1)
    st = (np.stack([a, a], 1) * 32767).astype(np.int16) if a.ndim == 1 else (a * 32767).astype(np.int16)
    with wave.open(p, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())


def aparar(a, lim=0.01):
    idx = np.where(np.abs(a) > lim)[0]
    return a[max(0, idx[0] - 400): idx[-1] + 2000] if len(idx) else a


def voz():
    rot = json.load(open(os.path.join(D, 'roteiro.json'), encoding='utf-8'))
    t = 0.35; cenas = []
    for c in rot:
        f = os.path.join(OUT, f"voz_{c['id']}.wav")
        gravada = os.path.join(D, 'gravacao', f"voz_{c['id']}.wav")
        if os.path.exists(gravada):  # voz gravada pelo Paulo tem prioridade
            tmp = f + '.tmp.wav'  # acelera ~9% sem mudar o tom
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', gravada, '-af', 'atempo=1.09', tmp], check=True)
            gravar(f, ler_wav(tmp)); os.remove(tmp)
        else:
          subprocess.run(['piper', '--model', MODEL, '--output_file', f, '--length_scale', '0.93',
                        '--noise_scale', '0.6', '--noise_w', '0.75'],
                       input=c['fala'].encode('utf-8'), check=True)
        a = aparar(ler_wav(f)); gravar(f, a)
        dur = len(a) / SR
        cena = dict(id=c['id'], ini=round(t, 3), voz=round(t + 0.12, 3), dvoz=round(dur, 3))
        t += 0.12 + dur + c.get('cauda', 0.16)
        cena['fim'] = round(t, 3); cenas.append(cena)
    json.dump(dict(total=round(t, 3), cenas=cenas), open(os.path.join(OUT, 'timeline.json'), 'w'), indent=1)
    print('timeline', round(t, 2), 's')


# ---------- trilha original (sintetizada aqui, sem direitos de terceiros) ----------
def nota(m): return 440 * 2 ** ((m - 69) / 12)

def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); z = 0.0
    for i in range(len(x)): z = (1 - a) * x[i] + a * z; y[i] = z
    return y

def trilha(total):
    n = int(total * SR) + SR; t = np.arange(n) / SR
    bpm = 104; beat = 60 / bpm; bar = beat * 4
    prog = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
    pad = np.zeros(n); bass = np.zeros(n); kick = np.zeros(n); hat = np.zeros(n); pluck = np.zeros(n)
    rng = np.random.default_rng(7)
    nbars = int(total / bar) + 2
    for b in range(nbars):
        ch = prog[b % 4]; s = int(b * bar * SR); e = min(n, int((b + 1) * bar * SR) + 2000)
        if s >= n: break
        tt = t[s:e] - t[s]
        env = np.minimum(1, tt / 0.25) * np.exp(-tt * 0.15)
        for m in ch:
            for det in (-0.08, 0.08):
                f = nota(m + det / 12)
                pad[s:e] += env * (2 * ((tt * f) % 1) - 1) * 0.05
        # baixo
        for k in (0, 2):
            s2 = int((b * bar + k * beat) * SR); e2 = min(n, s2 + int(beat * 1.6 * SR))
            if s2 >= n: continue
            t2 = t[s2:e2] - t[s2]; f = nota(ch[0] - 24)
            bass[s2:e2] += np.sin(2 * np.pi * f * t2) * np.exp(-t2 * 2.2) * 0.35
        # arpejo leve (colcheias)
        for k in range(8):
            s3 = int((b * bar + k * beat / 2) * SR); e3 = min(n, s3 + int(0.35 * SR))
            if s3 >= n: continue
            t3 = t[s3:e3] - t[s3]; m = ch[[0, 1, 2, 1][k % 4]] + 12
            pluck[s3:e3] += np.sin(2 * np.pi * nota(m) * t3) * np.exp(-t3 * 9) * 0.06
    pad = lowpass(pad, 1400)
    for i in range(int(total / beat) + 2):
        s = int(i * beat * SR); e = min(n, s + int(0.3 * SR))
        if s >= n: break
        tt = t[s:e] - t[s]
        if i >= 4:  # bateria entra depois do 1º compasso
            f = 50 + 70 * np.exp(-tt * 30)
            kick[s:e] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9) * 0.55
            s2 = int((i + 0.5) * beat * SR); e2 = min(n, s2 + int(0.05 * SR))
            if s2 < n:
                hat[s2:e2] += rng.standard_normal(e2 - s2) * np.exp(-np.arange(e2 - s2) / SR * 80) * 0.05
    hat = hat - lowpass(hat, 6000)
    # "pump" no pad seguindo o bumbo
    ph = (t % beat) / beat; pump = 0.55 + 0.45 * np.minimum(1, ph * 3)
    mus = pad * pump + bass + kick + hat + pluck
    fade = np.minimum(1, t / 0.8) * np.clip((total + 0.5 - t) / 1.6, 0, 1)
    return (mus * fade)[: int(total * SR)]


def transicao():
    # 'pop' suave de interface: seno curto subindo de tom, com brilho leve
    m = int(0.16 * SR); tt = np.arange(m) / SR
    f = 520 + 380 * (1 - np.exp(-tt * 40))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.25 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    env = np.minimum(1, tt / 0.006) * np.exp(-tt * 28)
    return s * env * 0.18

def whoosh(dur=0.6):
    m = int(dur * SR); x = np.random.default_rng(3).standard_normal(m)
    tt = np.arange(m) / m; env = np.sin(np.pi * tt) ** 2
    a = np.exp(-2 * np.pi * (300 + 5000 * env) / SR); y = np.empty(m); z = 0.0
    for i in range(m): z = (1 - a[i]) * x[i] + a[i] * z; y[i] = z
    return y * env * 0.5

def ding():
    m = int(0.5 * SR); tt = np.arange(m) / SR
    a = np.sin(2 * np.pi * 1318.5 * tt) * np.exp(-tt * 9)
    b = np.where(tt > 0.09, np.sin(2 * np.pi * 1760 * (tt - 0.09)) * np.exp(-(tt - 0.09) * 8), 0)
    return (a + b) * 0.22


def mix():
    tl = json.load(open(os.path.join(OUT, 'timeline.json')))
    total = tl['total']; n = int(total * SR)
    voz = np.zeros(n); sfx = np.zeros(n)
    def pos(arr, sig, t0):
        s = int(t0 * SR); e = min(len(arr), s + len(sig)); arr[s:e] += sig[: e - s]
    for c in tl['cenas']:
        pos(voz, ler_wav(os.path.join(OUT, f"voz_{c['id']}.wav")), c['voz'])
        if c['id'] not in ('google',):
            pos(sfx, transicao(), max(0, c['ini'] - 0.04))
        if c['id'] == 'zap':
            pos(sfx, ding(), c['ini'] + 0.35); pos(sfx, ding(), c['ini'] + 0.35 + c['dvoz'] * 0.5)
    mus = trilha(total)
    # ducking: trilha abaixa enquanto a voz fala
    env = np.convolve(np.abs(voz), np.ones(2205) / 2205, 'same')
    act = (env > 0.01).astype(float)
    act = np.convolve(act, np.ones(8820) / 8820, 'same')
    g = 0.42 - 0.27 * np.clip(act * 1.5, 0, 1)
    final = voz * 1.0 + mus * g + sfx * 0.6
    final = final / max(1e-6, np.max(np.abs(final))) * 0.92
    gravar(os.path.join(OUT, 'final.wav'), final)
    print('mix ok', round(total, 2), 's')


if __name__ == '__main__':
    {'voz': voz, 'mix': mix}[sys.argv[1]]()
