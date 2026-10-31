/* Hélice · contador de visitas (sem cookies, sem dados pessoais) */
(function () {
  try {
    var ua = navigator.userAgent || '';
    if (navigator.webdriver || /bot|crawl|spider|slurp|facebookexternalhit|preview|lighthouse|headless/i.test(ua)) return;
    var ls = null; try { ls = window.localStorage; } catch (e) {}
    if (ls && ls.getItem('helice_eu') === '1') return;            // visitas do próprio dono não contam
    if (window.top !== window.self) return;                       // dentro de moldura (_celular) não conta
    var path = location.pathname.replace(/index\.html$/, '');
    if (/\/(painel|visitas)(\/|$)/.test(path)) return;

    var rid = function () { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); };
    var vis = null, ses = null;
    try { vis = ls.getItem('helice_vid'); if (!vis) { vis = rid(); ls.setItem('helice_vid', vis); } } catch (e) { vis = rid(); }
    try { ses = sessionStorage.getItem('helice_sid'); if (!ses) { ses = rid(); sessionStorage.setItem('helice_sid', ses); } } catch (e) { ses = rid(); }

    var q = new URLSearchParams(location.search);
    var ref = document.referrer || '';
    var refHost = '';
    try { refHost = ref ? new URL(ref).hostname.replace(/^www\./, '') : ''; } catch (e) {}
    if (refHost === location.hostname.replace(/^www\./, '') || /github\.io$/.test(refHost)) refHost = '';

    var origem = (q.get('utm_source') || '').toLowerCase();
    if (!origem) {
      if (/Instagram/i.test(ua)) origem = 'instagram';
      else if (/FBAN|FBAV|FB_IAB/i.test(ua)) origem = 'facebook';
      else if (/instagram/.test(refHost)) origem = 'instagram';
      else if (/facebook|fb\.com|fb\.me/.test(refHost)) origem = 'facebook';
      else if (/whatsapp|wa\.me/.test(refHost)) origem = 'whatsapp';
      else if (/google\./.test(refHost)) origem = 'google';
      else if (/bing\.|duckduckgo|yahoo/.test(refHost)) origem = 'busca';
      else if (refHost) origem = refHost;
      else origem = null;                                          // direto (inclui link aberto do WhatsApp)
    }

    var w = Math.min(screen.width || 0, screen.height || 0) || window.innerWidth;
    var dev = /iPad|Tablet/i.test(ua) ? 'tablet' : (/Mobi|Android|iPhone/i.test(ua) || w < 600 ? 'celular' : 'computador');

    var body = {
      p_path: path || '/', p_ref: ref ? ref.slice(0, 200) : null, p_origem: origem,
      p_us: q.get('utm_source'), p_um: q.get('utm_medium'), p_uc: q.get('utm_campaign'),
      p_vis: vis, p_ses: ses, p_dev: dev, p_tela: (screen.width || 0) + 'x' + (screen.height || 0)
    };
    var K = 'sb_publishable_Ji31DC1ihqZTR7gmLeYTLw_GHgBjWN0';
    fetch('https://ryhyvzwqtktaaonznizn.supabase.co/rest/v1/rpc/registrar_visita', {
      method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'application/json', apikey: K },
      body: JSON.stringify(body)
    }).catch(function () {});
  } catch (e) {}
})();
