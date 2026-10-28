/* CEP: endereço e distância em linha reta até a loja.
   Endereço: AwesomeAPI, BrasilAPI ou ViaCEP (nessa ordem). Coordenadas: AwesomeAPI ou, se faltar, OpenStreetMap pela rua.
   As coordenadas da BrasilAPI não são usadas: muitas vezes apontam para o centro da cidade.
   Para ver de onde veio cada coordenada, abra o site com ?debug no endereço. */
const DEBUG = /[?&]debug/.test(location.search);
const cepChecks = new Map();
const num = v => v === '' || v == null || isNaN(v) ? null : +v;
const okCoord = (lat, lng) => lat != null && lng != null && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && (lat || lng);
const fmtKm = km => km < 1 ? `${Math.max(100, Math.round(km * 10) * 100)} m` : `${km.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`;
function haversine(a, b) {
  const rad = x => x * Math.PI / 180, h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}
async function getJSON(url) {
  const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), 7000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
    if (res.status === 404 || res.status === 400) return { notFound: true };
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } finally { clearTimeout(t); }
}

// [nome, endereço da consulta, leitura da resposta (null = CEP não encontrado)]
const CEP_APIS = [
  ['AwesomeAPI', d => `https://cep.awesomeapi.com.br/json/${d}`, a => a.code ? null : { street: a.address, district: a.district, city: a.city, uf: a.state, lat: num(a.lat), lng: num(a.lng) }],
  ['BrasilAPI', d => `https://brasilapi.com.br/api/cep/v2/${d}`, b => ({ street: b.street, district: b.neighborhood, city: b.city, uf: b.state })],
  ['ViaCEP', d => `https://viacep.com.br/ws/${d}/json/`, v => v.erro ? null : { street: v.logradouro, district: v.bairro, city: v.localidade, uf: v.uf }]
];
async function lookupCep(d) {
  let info = null, notFound = 0;
  const log = [];
  for (const [name, url, read] of CEP_APIS) {
    try {
      const res = await getJSON(url(d)), r = res.notFound ? null : read(res);
      if (!r) { notFound++; log.push(`${name}: não encontrado`); continue; }
      info = r;
      if (okCoord(r.lat, r.lng)) info.src = name; else delete info.lat;
      log.push(`${name}: ${info.src ? 'com coordenadas' : 'endereço'}`);
      break;
    } catch (e) { log.push(`${name}: falhou`); }
  }
  if (!info) return { status: notFound ? 'notfound' : 'error', cep: d, log };
  if (info.lat == null && info.street && info.city) {
    try {
      const q = new URLSearchParams({ format: 'jsonv2', limit: '1', countrycodes: 'br', street: info.street, city: info.city, state: info.uf || '', country: 'Brasil' });
      const hit = [].concat(await getJSON(`https://nominatim.openstreetmap.org/search?${q}`)).find(x => x.category === 'highway' || ['road', 'street', 'residential'].includes(x.addresstype));
      if (hit && okCoord(num(hit.lat), num(hit.lon))) Object.assign(info, { lat: num(hit.lat), lng: num(hit.lon), src: 'OpenStreetMap' });
      log.push(`OpenStreetMap: ${hit ? 'rua encontrada' : 'rua não encontrada'}`);
    } catch (e) { log.push('OpenStreetMap: falhou'); }
  }
  return { ...info, cep: d, log, status: info.lat == null ? 'noloc' : 'ok' };
}
async function checkCep(d) {
  if (cepChecks.has(d)) return cepChecks.get(d);
  const r = await lookupCep(d);
  if (r.status === 'ok') r.km = haversine(STORE.pos, r);
  if (r.status !== 'error') cepChecks.set(d, r);
  return r;
}
const inRange = r => r.status === 'ok' && r.km <= STORE.radiusKm;
const debugLine = r => !DEBUG ? '' : `<br><small style="font-weight:500;color:var(--muted)">Teste · ${esc(r.log.join(' · '))}${r.lat != null ? ` · coordenadas ${r.lat.toFixed(5)}, ${r.lng.toFixed(5)} (${r.src})` : ''}${r.km != null ? ` · ${r.km.toFixed(2)} km` : ''}</small>`;

// Preenche CEP, rua e bairro do pedido com o resultado, sem apagar o que a pessoa já digitou
function prefillAddress(r) {
  const co = $('#co-cep');
  if (!digits(co.value)) co.value = fmtCep(r.cep);
  if (digits(co.value) !== r.cep) return;
  if (r.street && !$('#co-street').value) $('#co-street').value = r.street;
  if (r.district && !$('#co-district').value) $('#co-district').value = r.district;
}

/* Consulta pelo topo do site */
const cep = $('#cep'), cepRes = $('#cep-result');
const askLink = (r, label) => {
  const where = [r.street, r.district, r.city && `${r.city}${r.uf ? '/' + r.uf : ''}`].filter(Boolean).join(', ');
  return `<a class="cep-action" href="${waLink(`Olá, vim pelo site! Meu CEP é ${fmtCep(r.cep)}${where ? ` (${where})` : ''}. Vocês entregam no meu endereço?`)}" target="_blank" rel="noopener">${icon('chat')}${label}</a>`;
};
const showResult = (cls, html) => { cepRes.className = 'cep-result ' + cls; cepRes.innerHTML = html; };
cep.addEventListener('input', () => maskCep(cep));
$('#cep-form').addEventListener('submit', async e => {
  e.preventDefault();
  const d = digits(cep.value), btn = $('button', e.currentTarget);
  if (d.length !== 8) { cep.focus(); return showResult('err', 'Digite os 8 números do CEP, por exemplo 03057-010.'); }
  btn.disabled = true;
  showResult('loading', 'Consultando o CEP…');
  const r = await checkCep(d);
  btn.disabled = false;
  if (inRange(r)) showResult('ok', `Entregamos em <b>${esc([r.street, r.district].filter(Boolean).join(', ') || `CEP ${fmtCep(r.cep)}`)}</b> em até 2 horas.${debugLine(r)}`);
  else if (r.status === 'notfound') showResult('err', `Não encontramos o CEP ${fmtCep(d)}. Confira os números e tente de novo.`);
  else if (r.status === 'error') showResult('warn', `Não conseguimos consultar o CEP agora. Fale com a gente para confirmar a entrega.<br>${askLink(r, 'Consultar pelo WhatsApp')}${debugLine(r)}`);
  else showResult('warn', `Para essa localização, é necessário consultar a possibilidade de entrega.<br><span class="cep-actions">${askLink(r, 'Consultar disponibilidade')}<button type="button" class="cep-pickup" data-pickup>${icon('pin')}Retirar na loja</button></span>${debugLine(r)}`);
  if (r.status === 'ok' || r.status === 'noloc') prefillAddress(r);
});
$('#go-cep').addEventListener('click', () => setTimeout(() => cep.focus({ preventScroll: true }), 400));

/* CEP digitado no pedido */
$('#co-cep').addEventListener('input', e => {
  const d = maskCep(e.target), note = $('#co-cep-note'), say = (cls, t) => { note.className = 'cep-note ' + cls; note.textContent = t; };
  if (d.length < 8) return say('', '');
  say('', 'Consultando o CEP…');
  checkCep(d).then(r => {
    if (digits(e.target.value) !== d) return;
    if (r.status === 'ok' || r.status === 'noloc') prefillAddress(r);
    if (inRange(r)) say('ok', 'Entregamos nesse endereço em até 2 horas.');
    else if (r.status === 'ok') say('warn', 'Para essa localização, é necessário consultar a possibilidade de entrega. Você pode enviar o pedido e a loja confirma.');
    else say(r.status === 'notfound' ? 'err' : '', r.status === 'notfound' ? 'CEP não encontrado. Confira os números.' : '');
    if (step === 2) updateSendLink();
  });
});
