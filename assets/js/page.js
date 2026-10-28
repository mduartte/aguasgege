/* Partes gerais da página: links, etiquetas do protótipo, aberto/fechado, horário, números, menu e copiar */

// Links do WhatsApp e do mapa vêm dos dados da loja; ícones do HTML ficam ocultos para leitores de tela
$$('[data-wa]').forEach(a => a.href = waLink(STORE.hello));
$$('[data-map]').forEach(a => a.href = STORE.maps);
$$('svg.ico').forEach(s => s.setAttribute('aria-hidden', 'true'));

/* Promessas da loja, cada uma com a avaliação que a comprova */
$('#proofs').innerHTML = REVIEWS.map(r => `<li class="proof">
  <div class="claim"><span class="claim-ico">${icon(r.icon)}</span><h3>${r.claim}</h3><p>${r.detail}</p></div>
  <figure class="quote"><div class="quote-top"><p class="stars" role="img" aria-label="5 de 5 estrelas">★★★★★</p><span class="g-badge"><i>G</i>Google</span></div><blockquote>${r.text}</blockquote><figcaption><span class="avatar" style="--a:var(--${r.color})" aria-hidden="true">${r.initials}</span><span class="who"><b>${r.name}</b><span>${r.note}</span></span></figcaption></figure>
</li>`).join('');

/* Modo de revisão: etiquetas das seções */
$$('[data-sec]').forEach(el => el.insertAdjacentHTML('afterbegin', `<span class="sec-tag">${el.dataset.sec}</span>`));
$('#proto-toggle').addEventListener('click', e => {
  const on = document.documentElement.classList.toggle('show-sec');
  e.currentTarget.setAttribute('aria-pressed', on);
  e.currentTarget.textContent = on ? 'Ocultar seções' : 'Mostrar seções';
});

/* Aberto/fechado e gráfico da semana, sempre no horário de São Paulo (feriados não são detectados) */
const DAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const WK = [6, 14]; // escala do gráfico: das 6h, por 14 horas
const pct = h => `${((h - WK[0]) / WK[1] * 100).toFixed(2)}%`;
$('#week').innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => {
  const h = STORE.hours[d];
  return `<div class="wk-row${h ? '' : ' closed'}" data-day="${d}"><span class="wk-day">${DAYS[d].slice(0, 3).replace(/^./, c => c.toUpperCase())}</span><span class="wk-track">${h ? `<i style="left:${pct(h[0])};width:${pct(h[1] - h[0] + WK[0])}"></i>` : ''}</span><span class="wk-hours">${h ? `${h[0]}h às ${h[1]}h` : 'Fechado'}</span></div>`;
}).join('') + `<div class="wk-axis" aria-hidden="true"><span></span><div>${[6, 9, 12, 15, 18].map(h => `<span style="left:${pct(h)}">${h}h</span>`).join('')}</div><span></span></div>`;

function spNow() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date()).map(x => [x.type, x.value]));
  return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), mins: p.hour % 24 * 60 + +p.minute };
}
function openStatus({ day, mins }) {
  const t = STORE.hours[day];
  if (t && mins >= t[0] * 60 && mins < t[1] * 60) return [true, `Aberto agora · até as ${t[1]}h`];
  if (t && mins < t[0] * 60) return [false, `Fechado agora · abre hoje às ${t[0]}h`];
  for (let k = 1; k <= 7; k++) {
    const n = STORE.hours[(day + k) % 7];
    if (n) return [false, `Fechado agora · abre ${k === 1 ? 'amanhã' : DAYS[(day + k) % 7]} às ${n[0]}h`];
  }
}
function updateStatus() {
  const now = spNow(), [open, text] = openStatus(now);
  $$('.wk-row').forEach(row => {
    const today = +row.dataset.day === now.day, m = now.mins - WK[0] * 60;
    row.classList.toggle('today', today);
    row.querySelector('.wk-now')?.remove();
    if (today && m >= 0 && m <= WK[1] * 60) row.querySelector('.wk-track').insertAdjacentHTML('beforeend', `<span class="wk-now" style="left:${m / (WK[1] * 60) * 100}%"></span>`);
  });
  $('#open-pill').classList.toggle('closed', !open);
  $('#open-text').textContent = text;
}
updateStatus();
setInterval(updateStatus, 30000);

/* Números do topo: sobem do zero sempre que entram na tela. No prazo, o relógio dá 2 voltas até 120 min */
function setCounter(el, v, turn) {
  const d = el.dataset, end = +d.count, dec = +(d.decimals || 0);
  (el.querySelector('.count-val') || el).textContent = d.mode === 'time'
    ? (v >= end ? d.final : `${Math.round(v)} min`)
    : (d.prefix || '') + v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (d.suffix || '');
  const hand = el.querySelector('.clock-hand');
  if (hand) hand.style.transform = `rotate(${turn * 720}deg)`;
}
const finishCounter = el => { setCounter(el, +el.dataset.count, 1); el.classList.add('done-' + el.dataset.done, 'pop'); };
function resetCounter(el) {
  cancelAnimationFrame(el._raf);
  el.classList.remove('done-' + el.dataset.done, 'pop');
  setCounter(el, 0, 0);
}
function runCounter(el) {
  resetCounter(el);
  const t0 = performance.now();
  const step = t => {
    const p = Math.min(1, (t - t0) / 1500), eased = 1 - (1 - p) ** 3;
    if (p < 1) { setCounter(el, el.dataset.count * eased, eased); el._raf = requestAnimationFrame(step); } else finishCounter(el);
  };
  el._raf = requestAnimationFrame(step);
}
if (reduceMotion) $$('[data-count]').forEach(finishCounter);
else {
  const io = new IntersectionObserver(es => es.forEach(e => (e.isIntersecting ? runCounter : resetCounter)(e.target)), { threshold: 0.6 });
  $$('[data-count]').forEach(el => io.observe(el));
}

/* Menu no celular */
const nav = $('#nav'), menuBtn = $('#menu-btn');
const setMenu = open => { nav.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open); };
menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.addEventListener('click', e => e.target.closest('a') && setMenu(false));

/* Copiar número */
$$('[data-copy]').forEach(b => b.addEventListener('click', () => {
  const target = document.getElementById(b.dataset.copy), label = $('span', b);
  const flash = t => { label.textContent = t; setTimeout(() => label.textContent = 'Copiar', 1600); };
  const select = () => { const r = document.createRange(); r.selectNodeContents(target); getSelection().removeAllRanges(); getSelection().addRange(r); flash('Selecionado'); };
  navigator.clipboard?.writeText ? navigator.clipboard.writeText(target.textContent.trim()).then(() => flash('Copiado'), select) : select();
}));
