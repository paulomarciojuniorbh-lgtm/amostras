/* Meridiano · aplicação. Depende de data.js (carregado antes). */
/* ===== util ===== */
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const li=(q)=>'https://www.linkedin.com/search/results/people/?keywords='+encodeURIComponent(q);
const gnews=(q)=>'https://www.google.com/search?tbm=nws&q='+encodeURIComponent(q);
const cnpj=(q)=>'https://www.google.com/search?q='+encodeURIComponent(q+' CNPJ razão social');
const toast=m=>{const t=$('toast');t.textContent=m;t.classList.add('on');clearTimeout(t._);t._=setTimeout(()=>t.classList.remove('on'),2000)};
const flag=p=>p&&P[p]?`<span class="flag" style="background:${P[p].c}22;color:${P[p].c}">${P[p].n.toUpperCase()}</span>`:'';
let LISTA;try{LISTA=new Set(JSON.parse(localStorage.getItem('meridiano_lista')||'[]'))}catch(e){LISTA=new Set()}
const salvar=()=>{try{localStorage.setItem('meridiano_lista',JSON.stringify([...LISTA]))}catch(e){}};
let FP='todos',FU='',SEL=null,Q='';
const norm=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const casa=e=>!Q||norm([e.n,e.set,e.st,UFN[e.st],e.tipo,e.end,P[e.p].n].join(' ')).includes(norm(Q));
const vis=()=>E.filter(e=>(FP=='todos'||e.p==FP)&&casa(e));        // país + busca (pinta o mapa)
const visU=()=>vis().filter(e=>!FU||e.st==FU);                      // + estado (listas)

/* ===== relógio e ticker ===== */
const relo=()=>{const h=z=>new Date().toLocaleTimeString('pt-BR',{timeZone:z,hour:'2-digit',minute:'2-digit'});
 const zs=FP!='todos'&&P[FP].tz&&P[FP].tz!='America/Sao_Paulo'?[[P[FP].n.toUpperCase(),P[FP].tz]]:[['NOVA YORK','America/New_York'],['LONDRES','Europe/London'],['PEQUIM','Asia/Shanghai'],['TÓQUIO','Asia/Tokyo']];
 $('relogio').textContent='SÃO PAULO '+h('America/Sao_Paulo')+zs.map(z=>' · '+z[0]+' '+h(z[1])).join('')};
relo();setInterval(relo,15000);
const TK=[['ESTOQUE IDP · EUA','US$ 244,7 bi','1º','up'],['PAÍSES BAIXOS','US$ 145,5 bi','2º','up'],['FRANÇA','US$ 63,3 bi','4º','up'],['ESPANHA','US$ 61,0 bi','5º','up'],['REINO UNIDO','US$ 31,0 bi','6º','up'],['JAPÃO','US$ 27,8 bi','7º','up'],['ALEMANHA','US$ 21,9 bi','8º','up'],['CANADÁ','US$ 21,1 bi','9º','up'],['INVEST. ESTRANGEIRO NO BR 2025','US$ 77 bi','3º destino do mundo','up'],['TARIFA EUA SOBRE O BR','25%','desde 22/07/26','dn'],['MERCOSUL–UE','vigência provisória','01/05/26','up'],['MERCOSUL–CANADÁ','em negociação','2026','up'],['EXPORT BR→CN JAN–SET/26','US$ 84,6 bi','+12,0%','up'],['CARNE BOVINA → CN SET/26','cota atingida','−93,5%','dn'],['COREIA: ACORDOS EM SEUL','10','23/02/26','up'],['UK: CRÉDITO À EXPORTAÇÃO','até £ 5,4 bi','2026–30','up']];
const tk=TK.map(x=>`<b>${x[0]}</b> ${x[1]} <span class="${x[3]}">${x[2]}</span>`).join('   ◆   ');
$('tick').innerHTML=tk+'   ◆   '+tk+'   ◆   ';

/* ===== mapa por estado ===== */
const K=14.5,C=Math.cos(14*Math.PI/180);
const px=lng=>(lng+74)*K*C+20, py=lat=>(5.5-lat)*K+20;
const BANDS=[[0,0,'#0A1411','0'],[1,2,'#0F2C21','1–2'],[3,5,'#14492F','3–5'],[6,10,'#1B6E44','6–10'],[11,20,'#249A5C','11–20'],[21,1e9,'#35D07F','21+']];
const band=n=>BANDS.find(b=>n>=b[0]&&n<=b[1]);
let VB={x:0,y:0,w:600,h:610};const VB0={...VB};
const svg=$('map');
const setVB=()=>{svg.setAttribute('viewBox',`${VB.x} ${VB.y} ${VB.w} ${VB.h}`);svg.style.touchAction=VB.w>=599?'pan-y':'none';blips()};
function mapa(){
 const v=vis(),cnt={};v.forEach(e=>cnt[e.st]=(cnt[e.st]||0)+1);
 let s=`<defs><radialGradient id="sw" cx="0" cy="0" r="1"><stop offset="0" stop-color="#3CFFA0" stop-opacity=".22"/><stop offset="1" stop-color="#3CFFA0" stop-opacity="0"/></radialGradient></defs><g id="ufs">`;
 for(const u in UF){const n=cnt[u]||0,b=band(n);s+=`<path class="uf${FU==u?' sel':''}" data-uf="${u}" d="${UF[u].d}" fill="${b[2]}"/>`}
 mapa._cnt=cnt;
 s+=`</g><g id="lbl" pointer-events="none"></g>`;
 s+=`<g transform="translate(${px(-52)},${py(-14)})" pointer-events="none"><g id="sweep"><path d="M0 0 L420 0 A420 420 0 0 0 ${420*Math.cos(-0.5)} ${420*Math.sin(-0.5)} Z" fill="url(#sw)"/><line x1="0" y1="0" x2="420" y2="0" stroke="#3CFFA0" stroke-opacity=".35"/></g></g><g id="blips"></g>`;
 svg.innerHTML=s;setVB();
 const sw=$('sweep');let a=0;cancelAnimationFrame(mapa._r);(function rod(){a=(a+0.5)%360;sw&&sw.setAttribute('transform',`rotate(${a})`);mapa._r=requestAnimationFrame(rod)})();
 const est=Object.keys(cnt).length;
 $('hud').innerHTML=`ALVOS NO MAPA <b>${v.length}</b> · COM GATILHO <b>${v.filter(e=>e.g).length}</b><br>${FP=='todos'?`PAÍSES <b>${ORD.length}</b> · `:`${P[FP].n.toUpperCase()} · `}ESTADOS COM PRESENÇA <b>${est}</b>`;
 $('leg').innerHTML=`<div class="t">EMPRESAS POR ESTADO</div><div class="sw">${BANDS.map(b=>`<div><span style="background:${b[2]}"></span>${b[3]}</div>`).join('')}</div><div class="k"><s style="border-color:var(--am)"></s> ${innerWidth<900?'anel amarelo = gatilho · toque num estado para filtrar':'gatilho ativo · cor do ponto = país · clique num estado para filtrar'}</div>`;
 const ch=$('ufchip');ch.classList.toggle('on',!!FU);ch.textContent=FU?`ESTADO: ${UFN[FU].toUpperCase()} ✕`:'';
}
function blips(){
 const g=$('blips');if(!g)return;const k=VB.w/600,r0=Math.max(1.4,3.4*Math.pow(k,.75)*(svg.clientWidth<500?1.25:1)),c=r0*1.2;
 const v=vis(),pts=v.map(e=>({e,x:px(e.lng),y:py(e.lat)}));
 // agrupa pontos que se sobrepõem e espalha em girassol
 const used=new Set();
 pts.forEach((p,i)=>{if(used.has(i))return;const grp=[i];used.add(i);pts.forEach((q,j)=>{if(!used.has(j)&&Math.hypot(p.x-q.x,p.y-q.y)<r0*2.2){grp.push(j);used.add(j)}});
  if(grp.length>1){const mx=grp.reduce((s,j)=>s+pts[j].x,0)/grp.length,my=grp.reduce((s,j)=>s+pts[j].y,0)/grp.length;
   grp.sort((a,b)=>pts[b].e.sc-pts[a].e.sc).forEach((j,n)=>{const rr=c*Math.sqrt(n+.5),an=n*2.39996;pts[j].x=mx+rr*Math.cos(an);pts[j].y=my+rr*Math.sin(an)})}});
 const cnt=mapa._cnt||{},fk=Math.pow(k,.82)*(svg.clientWidth<500?1.45:1);let L='';
 for(const u in UF){const n=cnt[u]||0,[cx,cy]=UF[u].c,o=OFF[u],lx=o?cx+o[0]*k:cx,ly=o?cy+o[1]*k:cy,bright=n>=11;
  if(o&&(o[0]||o[1]))L+=`<line x1="${cx}" y1="${cy}" x2="${lx-5*k}" y2="${ly-3*k}" stroke="#2A4A3C" stroke-width="${.6*k}"/>`;
  L+=`<text class="ufl" x="${lx}" y="${ly}" text-anchor="${o&&o[0]?'start':'middle'}" font-size="${(o?7.5:9)*fk}" stroke-width="${2.4*k}" fill="${n?'#D6FBE7':'#3D5A4C'}" font-weight="600">${u}${n?`<tspan fill="${bright?'#FFFFFF':'#7CE8B0'}" font-weight="500"> ${n}</tspan>`:''}</text>`}
 $('lbl').innerHTML=L;
 let s='';
 pts.forEach(({e,x,y})=>{const r=r0*(.8+e.sc/250),on=SEL==e.id,dim=FU&&e.st!=FU;e._x=x;e._y=y;
  s+=`<g class="blip" data-id="${e.id}" style="cursor:pointer" opacity="${dim?.25:1}">${e.g&&!dim?`<circle cx="${x}" cy="${y}" r="${r+2*k}" fill="none" stroke="#FFC247" stroke-width="${1.1*k}" stroke-opacity=".8"><animate attributeName="r" values="${r+1*k};${r+7*k};${r+1*k}" dur="2.4s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values=".9;0;.9" dur="2.4s" repeatCount="indefinite"/></circle>`:''}<circle cx="${x}" cy="${y}" r="${on?r*1.5:r}" fill="${P[e.p].c}" stroke="${on?'#3CFFA0':'#05080D'}" stroke-width="${(on?2:1)*k}"/></g>`});
 const sel=v.find(e=>e.id==SEL);
 if(sel){const right=sel._x>VB.x+VB.w*.62,fs=12*k;s+=`<text x="${right?sel._x-9*k:sel._x+9*k}" y="${sel._y-7*k}" text-anchor="${right?'end':'start'}" font-size="${fs}" fill="#3CFFA0" font-family="IBM Plex Mono" style="paint-order:stroke" stroke="#05080D" stroke-width="${3*k}" pointer-events="none">${esc(sel.n)}</text>`}
 g.innerHTML=s;
}
/* zoom e arraste */
const toSvg=(cx,cy)=>{const r=svg.getBoundingClientRect(),sc=Math.max(VB.w/r.width,VB.h/r.height),ox=(r.width*sc-VB.w)/2,oy=(r.height*sc-VB.h)/2;return[VB.x+(cx-r.left)*sc-ox,VB.y+(cy-r.top)*sc-oy]};
function zoomAt(f,cx,cy){const nw=Math.min(600,Math.max(40,VB.w/f));const ff=VB.w/nw;if(cx==null){cx=VB.x+VB.w/2;cy=VB.y+VB.h/2}
 VB.x=cx-(cx-VB.x)/ff;VB.y=cy-(cy-VB.y)/ff;VB.w=nw;VB.h=nw*610/600;if(nw>=600){VB={...VB0}}setVB()}
function zoomUF(u){const p=svg.querySelector(`.uf[data-uf="${u}"]`);if(!p)return;const b=p.getBBox(),m=Math.max(b.width,b.height*600/610)*1.35,w=Math.max(70,m);
 VB={x:b.x+b.width/2-w/2,y:b.y+b.height/2-w*610/600/2,w,h:w*610/600};setVB()}
svg.addEventListener('wheel',ev=>{ev.preventDefault();const[x,y]=toSvg(ev.clientX,ev.clientY);zoomAt(ev.deltaY<0?1.25:1/1.25,x,y)},{passive:false});
const ptr=new Map();let drag=null,moved=false,pinch=null;
svg.addEventListener('pointerdown',ev=>{ptr.set(ev.pointerId,[ev.clientX,ev.clientY]);svg.setPointerCapture(ev.pointerId);moved=false;
 if(ptr.size==1)drag={x:ev.clientX,y:ev.clientY,vb:{...VB},t:ev.target};
 if(ptr.size==2){const[a,b]=[...ptr.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),vb:{...VB},c:toSvg((a[0]+b[0])/2,(a[1]+b[1])/2)};drag=null}});
svg.addEventListener('pointermove',ev=>{
 if(!ptr.has(ev.pointerId)){hover(ev);return}ptr.set(ev.pointerId,[ev.clientX,ev.clientY]);
 if(pinch&&ptr.size==2){const[a,b]=[...ptr.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);VB={...pinch.vb};zoomAt(d/pinch.d,pinch.c[0],pinch.c[1]);moved=true;return}
 if(drag){const dx=ev.clientX-drag.x,dy=ev.clientY-drag.y;if(Math.hypot(dx,dy)>5)moved=true;if(!moved)return;svg.classList.add('arr');$('tip').style.display='none';
  const r=svg.getBoundingClientRect(),sc=Math.max(drag.vb.w/r.width,drag.vb.h/r.height);VB.x=drag.vb.x-dx*sc;VB.y=drag.vb.y-dy*sc;svg.setAttribute('viewBox',`${VB.x} ${VB.y} ${VB.w} ${VB.h}`)}});
const fim=ev=>{ptr.delete(ev.pointerId);svg.classList.remove('arr');if(ptr.size<2)pinch=null;
 if(drag&&!moved&&ptr.size==0){const t=document.elementFromPoint(ev.clientX,ev.clientY)||drag.t,b=t.closest&&t.closest('.blip'),u=t.closest&&t.closest('.uf');
  if(b)abrir(b.dataset.id);else if(u){const uf=u.dataset.uf;if(FU==uf){FU='';VB={...VB0};tudo()}else{FU=uf;tudo();zoomUF(uf);aba('base');const n=visU().length;toast(`${n} empresa${n==1?'':'s'} em ${UFN[uf]}${innerWidth<900?' · lista abaixo':''}`)}}}
 if(ptr.size==0)drag=null};
svg.addEventListener('pointerup',fim);svg.addEventListener('pointercancel',fim);
svg.addEventListener('pointerleave',()=>{$('tip').style.display='none';svg.querySelectorAll('.uf.hv').forEach(x=>x.classList.remove('hv'))});
function hover(ev){const tip=$('tip'),t=ev.target,b=t.closest('.blip'),u=t.closest('.uf'),R=$('radar').getBoundingClientRect();
 let h='';
 if(b){const e=E.find(x=>x.id==b.dataset.id);h=`<b>${esc(e.n)}</b><div class="m">${P[e.p].n.toUpperCase()} · ${esc(e.set)} · ${e.st}</div>${e.g?'<div style="color:var(--am);font-size:11px">▲ tem gatilho ativo</div>':''}<div style="color:var(--mu);font-size:11px">clique para abrir o dossiê</div>`}
 else if(u){const uf=u.dataset.uf,l=vis().filter(e=>e.st==uf).sort((a,b)=>b.sc-a.sc),pc={};l.forEach(e=>pc[e.p]=(pc[e.p]||0)+1);
  h=`<b>${UFN[uf]}</b><div class="m">${l.length} EMPRESA${l.length==1?'':'S'}${l.length?' · '+Object.entries(pc).sort((a,b)=>b[1]-a[1]).map(([p,n])=>P[p].n+' '+n).join(', '):''}</div>${l.length?`<ul>${l.slice(0,4).map(e=>`<li>${esc(e.n)}</li>`).join('')}</ul>${l.length>4?`<div class="m">+ ${l.length-4} · clique para ver todas</div>`:''}`:'<div style="color:var(--mu);font-size:11px">nenhuma empresa deste filtro aqui</div>'}`;
  svg.querySelectorAll('.uf.hv').forEach(x=>x!==u&&x.classList.remove('hv'));u.classList.add('hv')}
 if(!h){tip.style.display='none';return}
 tip.innerHTML=h;tip.style.display='block';const x=ev.clientX-R.left,y=ev.clientY-R.top,w=tip.offsetWidth,hh=tip.offsetHeight;
 tip.style.left=Math.min(R.width-w-8,x+14)+'px';tip.style.top=(y+hh+20>R.height?y-hh-12:y+14)+'px'}
$('zin').onclick=()=>zoomAt(1.5);$('zout').onclick=()=>zoomAt(1/1.5);$('zres').onclick=()=>{VB={...VB0};setVB()};
$('vermais').onclick=()=>$('side').scrollIntoView({behavior:'smooth'});
$('ufchip').onclick=()=>{FU='';VB={...VB0};setVB();tudo()};

/* ===== filtros por país ===== */
function filtros(){const v=E.filter(casa);
 $('filtros').innerHTML=[['todos','TODOS OS PAÍSES',v.length,'#3CFFA0'],...ORD.map(p=>[p,P[p].n.toUpperCase(),v.filter(e=>e.p==p).length,P[p].c])].map(([k,n,c,cor])=>`<button class="f ${FP==k?'on':''}" data-p="${k}" aria-pressed="${FP==k}"><i style="background:${cor}"></i>${n} <small>${c}</small></button>`).join('')}
$('filtros').addEventListener('click',e=>{const b=e.target.closest('.f');if(!b)return;FP=b.dataset.p;FU='';VB={...VB0};if(SEL&&FP!='todos'&&E.find(x=>x.id==SEL).p!=FP)SEL=null;relo();tudo()});

/* ===== busca ===== */
$('q').addEventListener('input',()=>{Q=$('q').value.trim();tudo();if(Q){const r=visU();if(r.length==1)abrir(r[0].id);else aba('base')}});
document.addEventListener('keydown',e=>{if(e.key=='Enter'){const r=e.target.closest&&e.target.closest('tr[data-abrir],th[data-ord]');if(r){r.click();return}}if(e.key=='/'&&document.activeElement!=$('q')){e.preventDefault();$('q').focus()}});

/* ===== dossiê ===== */
function abrir(id){SEL=id;aba('dossie');dossie();blips();if(innerWidth<900)$('dossie').scrollIntoView({behavior:'smooth'})}
function dossie(){
 const e=E.find(x=>x.id==SEL);
 if(!e){$('dossie').innerHTML=`<div class="vazio">CLIQUE EM UM PONTO DO MAPA<br>OU ESCOLHA UMA EMPRESA NAS ABAS AO LADO.<br><br>A cor do estado mostra quantas empresas há ali.<br>Clique no estado para filtrar e aproximar.<br>Pontos com anel amarelo têm gatilho ativo:<br>um motivo concreto para procurar a empresa agora.</div>`;return}
 const fonte=e.gs&&S[e.gs], nomeBase=e.n.replace(/\s*\(.*\)/,''),pa=P[e.p];
 $('dossie').innerHTML=`<div class="dos">
  <h2>${esc(e.n)}</h2>
  <div class="meta">${flag(e.p)}<span>${esc(e.set)}</span><span>${esc(e.tipo)} · ${UFN[e.st]}</span><span>NOTA ${e.sc}</span><span>PRIORIDADE</span>${ubadge(e)}</div>
  ${e.g?`<div class="sec gat"><h4>▲ Gatilho: por que procurar agora</h4><p>${esc(e.g)}</p>${fonte?`<div class="lnk" style="margin-top:6px">Fonte: <a href="${fonte[1]}" target="_blank" rel="noopener">${esc(fonte[0])}</a></div>`:''}</div>`:`<div class="sec"><h4>Gatilho</h4><p style="color:var(--mu)">Nenhum fato novo nesta edição. A empresa segue na base e o radar avisa quando aparecer um.</p></div>`}
  <div class="sec"><h4>Ângulo jurídico</h4><p>${ANG[e.ang]}</p></div>
  <div class="sec"><h4>Onde está</h4><div class="kv"><span>ENDEREÇO</span><div>${esc(e.end)}</div><span>TELEFONE</span><div>${e.tel?`<a href="tel:${e.tel.replace(/\D/g,'')}">${esc(e.tel)}</a>`:'<span style="color:var(--mu)">não publicado no Google</span>'}</div><span>SITE</span><div>${e.site?`<a href="${e.site}" target="_blank" rel="noopener">${esc(e.site.replace(/^https?:\/\//,'').replace(/\/$/,''))}</a>`:'<span style="color:var(--mu)">—</span>'}</div></div>
   <div class="acts"><a class="a" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.end)}">Ver no Google Maps</a><a class="a" target="_blank" rel="noopener" href="${cnpj(nomeBase)}">Buscar CNPJ</a><a class="a" target="_blank" rel="noopener" href="${gnews(nomeBase+' Brasil')}">Notícias recentes</a></div></div>
  <div class="sec"><h4>Caminho até quem decide</h4><p style="color:var(--mu);font-size:13px;margin-bottom:6px">Buscas prontas no LinkedIn: quem contrata escritório externo costuma ser o jurídico interno.</p>
   <div class="acts"><a class="a hot" target="_blank" rel="noopener" href="${li('diretor jurídico '+nomeBase)}">Diretor(a) jurídico(a)</a><a class="a" target="_blank" rel="noopener" href="${li('general counsel '+nomeBase+' Brazil')}">General counsel</a><a class="a" target="_blank" rel="noopener" href="${li('CEO '+nomeBase+' Brasil')}">CEO / country manager</a><a class="a" target="_blank" rel="noopener" href="${li('compliance '+nomeBase+' Brasil')}">Compliance</a></div></div>
  <div class="sec" style="border-left:3px solid ${pa.c}"><h4>Contexto: ${esc(pa.n)}</h4><p style="font-size:13px">${esc(pa.a)}</p></div>
  ${e.rede&&e.rede.length?`<div class="sec"><h4>Ligações</h4><div class="acts">${e.rede.map(r=>`<span class="pill">${esc(r)}</span>`).join('')}</div></div>`:''}
  <div class="acts"><button class="a ${LISTA.has(e.id)?'hot':''}" data-lista="${e.id}">${LISTA.has(e.id)?'✓ Na minha lista':'+ Adicionar à minha lista'}</button></div>
 </div>`;
}
/* ===== prioridade comercial: alta = gatilho + operação grande; média = gatilho ou operação grande; baixa = só base ===== */
const urg=e=>e.g&&e.sc>=80?'alta':(e.g||e.sc>=75?'media':'baixa');
const UL={alta:'ALTA',media:'MÉDIA',baixa:'BAIXA'};
const ubadge=e=>{const u=urg(e);return `<span class="u ${u}" title="Prioridade ${UL[u].toLowerCase()}">${UL[u]}</span>`};
let FUR='',MODO='lista',ORDEM={k:'sc',d:-1};
try{MODO=localStorage.getItem('meridiano_modo')||'lista'}catch(e){}
/* ===== abas ===== */
function linha(e){return `<div class="row" data-abrir="${e.id}"><div><div class="nm">${esc(e.n)} ${ubadge(e)}</div><div class="sub">${flag(e.p)} ${esc(e.set)} · ${esc(e.tipo)} · ${e.st}${e.tel?' · '+esc(e.tel):''}</div></div><div class="score">${e.sc}</div></div>`}
function paises(){const v=E.filter(casa);$('nPa').textContent=ORD.length;
 $('paises').innerHTML=`<p style="color:var(--mu);margin:0 0 10px;font-size:13px">Os 14 países foram escolhidos pelo mesmo critério de China e Dinamarca: muito capital já instalado no Brasil (censo do Banco Central) ou anúncios e acordos recentes. Ficaram de fora Luxemburgo (3º) e Ilhas Cayman (10º), porque o dinheiro passa por lá em holdings, sem empresa operando a partir desses países. <a href="${S.bc[1]}" target="_blank" rel="noopener">Fonte do ranking</a>.</p>`+
 ORD.map(p=>{const x=P[p],n=v.filter(e=>e.p==p),g=n.filter(e=>e.g).length,ch=CH.filter(c=>c.p==p).length,uf=[...new Set(n.map(e=>e.st))];
  return `<div class="pais" style="border-left-color:${x.c}"><div class="hd"><b>${esc(x.n)}</b><span class="pill">${n.length} empresas · ${uf.length} estados</span></div><div class="rk">${esc(x.k)}</div><p>${esc(x.r)}</p><p class="ac">▸ ${esc(x.a)}</p>
  <div class="acts"><button class="a hot" data-pais="${p}">Ver no mapa</button>${g?`<span class="pill g">${g} com gatilho</span>`:''}${ch?`<span class="pill">${ch} chegando</span>`:''}<a class="a" target="_blank" rel="noopener" href="${S[x.s][1]}">Fonte: ${esc(S[x.s][0])}</a></div></div>`}).join('')}
const COLS=[['n','EMPRESA'],['p','PAÍS'],['set','SETOR'],['st','UF'],['u','PRIORIDADE'],['sc','NOTA'],['tel','TELEFONE']];
const val=(e,k)=>k=='u'?{alta:3,media:2,baixa:1}[urg(e)]:k=='p'?P[e.p].n:(e[k]??'');
const filtrada=()=>visU().filter(e=>!FUR||urg(e)==FUR);
function vazioHTML(){return `<div class="vazio" role="status">NENHUMA EMPRESA COM ESSES FILTROS.<br>${Q?`Busca: “${esc(Q)}”<br>`:''}<button class="a hot" data-limpar="1">Limpar filtros</button></div>`}
function base(){const v=filtrada().sort((a,b)=>{const x=val(a,ORDEM.k),y=val(b,ORDEM.k);return (typeof x=='number'?x-y:String(x).localeCompare(String(y),'pt'))*ORDEM.d||b.sc-a.sc});$('nBase').textContent=v.length;
 const nu=k=>visU().filter(e=>urg(e)==k).length;
 const fer=`<div class="ferr">
  <div class="seg" role="group" aria-label="Filtrar por prioridade">${[['','TODAS',visU().length],['alta','ALTA',nu('alta')],['media','MÉDIA',nu('media')],['baixa','BAIXA',nu('baixa')]].map(([k,t,n])=>`<button data-urg="${k}" aria-pressed="${FUR==k}">${t} ${n}</button>`).join('')}</div>
  <div class="seg" role="group" aria-label="Modo de visualização"><button data-modo="lista" aria-pressed="${MODO=='lista'}">☰ LISTA</button><button data-modo="tabela" aria-pressed="${MODO=='tabela'}">▦ TABELA</button></div>
 </div><div class="ferr"><span class="sub" style="font-family:var(--mono);font-size:11px">EXPORTAR RELATÓRIO (${v.length}):</span><button class="a" data-exp="csv" aria-label="Exportar empresas filtradas em CSV">CSV para Excel/CRM</button><button class="a" data-exp="json" aria-label="Exportar empresas filtradas em JSON">JSON</button>${FU?`<span class="pill g">${UFN[FU]}</span>`:''}${FP!='todos'?flag(FP):''}</div>`;
 let corpo;
 if(!v.length)corpo=vazioHTML();
 else if(MODO=='tabela')corpo=`<div class="tbw"><table class="tb"><caption class="sr" style="position:absolute;left:-9999px">Empresas filtradas</caption><thead><tr>${COLS.map(([k,t])=>`<th scope="col" data-ord="${k}" tabindex="0" aria-sort="${ORDEM.k==k?(ORDEM.d>0?'ascending':'descending'):'none'}">${t}</th>`).join('')}</tr></thead><tbody>${v.map(e=>`<tr data-abrir="${e.id}" tabindex="0"><td><b>${esc(e.n)}</b></td><td>${flag(e.p)}</td><td>${esc(e.set)}</td><td>${e.st}</td><td>${ubadge(e)}</td><td class="num">${e.sc}</td><td style="white-space:nowrap">${esc(e.tel||'—')}</td></tr>`).join('')}</tbody></table></div>`;
 else corpo=v.map(linha).join('');
 $('base').innerHTML=fer+corpo+`<div class="nota">Endereços e telefones: Google Maps, consulta de 24/10/2026. A nota (0–100) combina tamanho da operação no Brasil, gatilho recente e volume de trabalho jurídico típico do setor. Prioridade ALTA = tem gatilho e nota 80+; MÉDIA = tem gatilho ou nota 75+; BAIXA = segue na base sem fato novo.</div>`}
function json(rows,nome){const d={gerado:new Date().toISOString(),fonte:'Meridiano · Hélice Sites & Sistemas',filtros:{pais:FP=='todos'?null:P[FP].n,estado:FU||null,prioridade:FUR||null,busca:Q||null},total:rows.length,
 empresas:rows.map(e=>({nome:e.n,pais:P[e.p].n,setor:e.set,estado:e.st,tipo:e.tipo,endereco:e.end,telefone:e.tel||null,site:e.site||null,lat:e.lat,lng:e.lng,nota:e.sc,prioridade:UL[urg(e)].toLowerCase(),gatilho:e.g||null,fonte_gatilho:e.gs&&S[e.gs]?{titulo:S[e.gs][0],url:S[e.gs][1]}:null,angulo_juridico:ANG[e.ang],ligacoes:e.rede||[]}))};
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));a.download=nome;a.click();toast('Relatório JSON baixado')}
function chegando(){const v=CH.filter(c=>FP=='todos'||c.p==FP);$('nCh').textContent=v.length;
 $('chegando').innerHTML=`<p style="color:var(--mu);margin:0 0 10px">Empresas que anunciaram dinheiro no Brasil e ainda não têm estrutura confirmada aqui. É o momento em que mais precisam de escritório local: abrir empresa, escolher estado, negociar incentivos, contratar.</p>`+
 (v.map(c=>`<div class="chega"><div class="t"><div class="nm">${esc(c.n)}</div><div class="v">${esc(c.v)}</div></div><div class="sub" style="margin:2px 0 6px">${flag(c.p)} ${esc(c.set)}</div><p style="margin:0 0 6px">${esc(c.o)}</p><div class="sec" style="margin:0 0 6px"><h4>Ângulo jurídico</h4><p>${esc(c.ang)}</p></div><div class="acts"><a class="a hot" target="_blank" rel="noopener" href="${li(c.n.replace(/\s*\(.*\)/,'')+' Brazil')}">Quem cuida do Brasil (LinkedIn)</a><a class="a" target="_blank" rel="noopener" href="${gnews(c.n.replace(/\s*\(.*\)/,'')+' Brasil')}">Notícias</a><a class="a" target="_blank" rel="noopener" href="${S[c.s][1]}">Fonte: ${esc(S[c.s][0])}</a></div></div>`).join('')||'<div class="vazio">NENHUM ANÚNCIO SEM ESTRUTURA PARA ESSE PAÍS NESTA EDIÇÃO</div>')}
function sinais(){const v=SIN.filter(x=>FP=='todos'||x.p==FP||!x.p);$('nSi').textContent=v.length;
 $('sinais').innerHTML=v.map(x=>`<div class="sinal"><div class="d">${x.d} ${flag(x.p)}</div><div>${esc(x.t)}</div><div class="acts" style="margin-top:4px"><a class="a" target="_blank" rel="noopener" href="${S[x.s][1]}">Fonte: ${esc(S[x.s][0])}</a>${x.e?`<button class="a" data-abrir="${x.e}">Ver empresa</button>`:''}</div></div>`).join('')}
function lista(){const v=E.filter(e=>LISTA.has(e.id));$('nLista').textContent=v.length;
 $('lista').innerHTML=v.length?`<div class="ferr"><button class="a" id="csvLista">Baixar minha lista (CSV)</button></div>`+v.map(linha).join(''):'<div class="vazio">ABRA UM DOSSIÊ E TOQUE EM<br>"ADICIONAR À MINHA LISTA".</div>'}
function csv(rows,nome){const cab=['Empresa','País','Setor','Estado','Tipo','Endereço','Telefone','Site','Nota','Prioridade','Gatilho','Fonte do gatilho','Ângulo jurídico'];
 const L=[cab,...rows.map(e=>[e.n,P[e.p].n,e.set,e.st,e.tipo,e.end,e.tel,e.site,e.sc,UL[urg(e)],e.g||'',e.gs&&S[e.gs]?S[e.gs][1]:'',ANG[e.ang]])].map(r=>r.map(c=>'"'+String(c??'').replace(/"/g,'""')+'"').join(';')).join('\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+L],{type:'text/csv'}));a.download=nome;a.click();toast('Planilha baixada')}
document.addEventListener('click',ev=>{const t=ev.target.closest('[data-abrir],[data-lista],[data-pais],[data-urg],[data-modo],[data-exp],[data-ord],[data-limpar],#csvLista,.tabs button');if(!t)return;
 if(t.dataset.urg!=null){FUR=t.dataset.urg;base();return}
 if(t.dataset.modo){MODO=t.dataset.modo;try{localStorage.setItem('meridiano_modo',MODO)}catch(e){}base();return}
 if(t.dataset.exp){const r=filtrada(),n='meridiano-relatorio-'+new Date().toISOString().slice(0,10);t.dataset.exp=='csv'?csv(r,n+'.csv'):json(r,n+'.json');return}
 if(t.dataset.ord){const k=t.dataset.ord;ORDEM=ORDEM.k==k?{k,d:-ORDEM.d}:{k,d:k=='sc'||k=='u'?-1:1};base();return}
 if(t.dataset.limpar){Q='';$('q').value='';FP='todos';FU='';FUR='';VB={...VB0};relo();tudo();return}
 if(t.matches('.tabs button'))return aba(t.dataset.t);
 if(t.dataset.abrir)return abrir(t.dataset.abrir);
 if(t.dataset.pais){FP=t.dataset.pais;FU='';VB={...VB0};relo();tudo();aba('base');$('radar').scrollIntoView({behavior:'smooth',block:'start'});return}
 if(t.dataset.lista){const id=t.dataset.lista;LISTA.has(id)?LISTA.delete(id):LISTA.add(id);salvar();dossie();lista();toast(LISTA.has(id)?'Adicionada à sua lista':'Removida da lista');return}
 if(t.id=='csvLista')csv(E.filter(e=>LISTA.has(e.id)),'meridiano-minha-lista.csv')});
function aba(t){document.querySelectorAll('.tabs button').forEach(b=>{b.classList.toggle('on',b.dataset.t==t);b.setAttribute('aria-selected',b.dataset.t==t)});document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('on',p.id==t))}
function para(){const g=E.filter(e=>e.g).length;$('para').innerHTML=`<span>▸ EDIÇÃO PREPARADA PARA DANIEL MANUCCI</span><span>▸ ${ORD.length} PAÍSES · ${E.length} EMPRESAS COM ENDEREÇO E TELEFONE (GOOGLE, 24/10/2026)</span><span>▸ ${g} COM GATILHO ATIVO · ${CH.length} CHEGANDO SEM ESTRUTURA</span>`}
function tudo(){filtros();mapa();paises();base();chegando();sinais();lista();dossie();para()}
SEL='byd';tudo();
