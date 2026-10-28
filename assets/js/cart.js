/* Catálogo, pedido rápido, carrinho e finalização do pedido pelo WhatsApp */
const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
const cart = new Map();
let step = 1;

/* Catálogo e pedido rápido */
function silhouette(p) {
  const [y, fs, sub] = SHAPES[p.shape];
  return `<svg class="sil" viewBox="0 0 100 140" aria-hidden="true"><use href="#s-${p.shape}"/><text x="50" y="${y}" font-size="${fs}">${p.size}</text>${p.x ? `<text class="sub" x="50" y="${y + fs * 0.8}" font-size="${sub}">${p.x}</text>` : ''}</svg>`;
}
const catVars = c => `--c:${c.c};--tint:${c.tint}`;
$('#product-grid').innerHTML = PRODUCTS.map(p => {
  const c = CATS[p.cat];
  return `<article class="product" data-cat="${p.cat}" style="${catVars(c)};--ct:${c.ct}">
    <div class="product-tile">${p.tag ? `<span class="tag">${p.tag}</span>` : ''}${silhouette(p)}<span class="tile-note">foto do produto</span><p class="glass-price"><small>R$</small>${fmt(p.price)}</p></div>
    <div class="product-body"><p class="product-cat">${c.label}</p><h3>${p.name}</h3><p class="product-desc">${p.desc}</p><div class="product-foot"><div class="buy" data-buy="${p.id}"></div></div></div>
  </article>`;
}).join('');
$('#quick-list').innerHTML = QUICK.map(id => {
  const p = byId[id];
  return `<li class="quick-item" style="${catVars(CATS[p.cat])}"><span class="quick-art">${silhouette(p)}</span><span class="quick-info"><b>${p.name}</b><span>${p.desc}</span><span class="q-price">R$ ${fmt(p.price)}</span></span><div class="buy" data-buy="${p.id}"></div></li>`;
}).join('');

/* Filtro por categoria */
const shelf = $$('.shelf-item');
shelf.forEach(b => {
  const f = b.dataset.filter;
  $('small', b).textContent = `${PRODUCTS.filter(p => f === 'todos' || p.cat === f).length} itens`;
  b.addEventListener('click', () => {
    shelf.forEach(t => t.setAttribute('aria-pressed', t === b));
    $$('.product').forEach(el => el.hidden = f !== 'todos' && el.dataset.cat !== f);
  });
});

/* Carrinho */
const form = $('#step-checkout');
const val = id => $('#' + id).value.trim();
const radio = name => $(`input[name="${name}"]:checked`, form)?.value || '';
const isPickup = () => radio('mode') === 'retirada';
const subtotal = () => [...cart].reduce((s, [id, q]) => s + byId[id].price * q, 0); // entrega grátis até 2 km
const setText = (sel, t) => $(sel).textContent = t;

function renderCart() {
  const count = [...cart.values()].reduce((a, b) => a + b, 0), sub = subtotal(), pickup = isPickup();
  $('#cart-count').textContent = count;
  $('#cart-count').hidden = !count;
  $('#cart-list').innerHTML = count ? [...cart].map(([id, q]) => {
    const p = byId[id];
    return `<div class="cart-item"><b>${p.name}</b><span class="line-total">R$ ${fmt(p.price * q)}</span><span class="unit">R$ ${fmt(p.price)} por unidade</span><div class="qty"><button type="button" data-id="${id}" data-q="-1" aria-label="Diminuir ${p.name}">−</button><output>${q}</output><button type="button" data-id="${id}" data-q="1" aria-label="Aumentar ${p.name}">+</button></div></div>`;
  }).join('') : '<p class="cart-empty">Seu pedido está vazio.<br>Adicione produtos do catálogo para ver o resumo aqui.</p>';
  setText('#sum-sub', `R$ ${fmt(sub)}`);
  setText('#sum-fee-label', pickup ? 'Retirada na loja' : 'Entrega');
  setText('#sum-fee', !sub ? '–' : pickup ? 'Na loja' : 'Grátis');
  setText('#sum-total', `R$ ${fmt(sub)}`);
  setText('#quick-total', `R$ ${fmt(sub)}`);
  setText('#free-text', pickup ? `Retirada na ${STORE.address.split(' · ')[0]}, no horário de atendimento.` : 'Entrega grátis até 2 km da loja. Mais longe, a loja confirma a disponibilidade.');
  setText('#quick-go', count ? `Ver pedido (${count})` : 'Ver pedido');
  setText('#checkout-note', '');
  $('#checkout').disabled = $('#quick-go').disabled = !count;
  syncCards();
  if (!count && step === 2) showStep(1);
  if (step === 2) updateSendLink();
}

// Botão "+" vira o seletor "− 1 +" em cada card e no pedido rápido
function syncCards() {
  $$('[data-buy]').forEach(box => {
    const p = byId[box.dataset.buy], q = cart.get(p.id) || 0, card = box.closest('.product, .quick-item'), out = $('output', box);
    card.classList.toggle('in-cart', q > 0);
    if (q && out) return out.textContent = q;
    if (!q && $('.add', box)) return;
    const focus = box.contains(document.activeElement);
    box.innerHTML = q
      ? `<div class="stepper" role="group" aria-label="Quantidade de ${p.name}"><button type="button" data-step="-1" aria-label="Diminuir ${p.name}">${icon('minus')}</button><output aria-live="polite">${q}</output><button type="button" data-step="1" aria-label="Aumentar ${p.name}">${icon('plus')}</button></div>`
      : `<button class="add" type="button" aria-label="Adicionar ${p.name} ao pedido">${icon('plus')}${card.classList.contains('product') ? '<span>Adicionar</span>' : ''}</button>`;
    if (focus) $(q ? '[data-step="1"]' : '.add', box).focus();
  });
}
function changeQty(id, d) {
  const q = (cart.get(id) || 0) + d;
  q > 0 ? cart.set(id, q) : cart.delete(id);
  renderCart();
}
document.addEventListener('click', e => {
  const box = e.target.closest('[data-buy]'), qty = e.target.closest('[data-q]'), st = e.target.closest('[data-step]');
  if (qty) return changeQty(qty.dataset.id, +qty.dataset.q);
  if (!box) return;
  const p = byId[box.dataset.buy];
  if (e.target.closest('.add')) { changeQty(p.id, 1); toast(`${p.name} adicionado ao pedido`); }
  else if (st) changeQty(p.id, +st.dataset.step);
});

/* Gaveta do pedido: etapa 1 (carrinho) e etapa 2 (entrega ou retirada) */
const drawer = $('#drawer'), scrim = $('#scrim'), cartBtn = $('#cart-btn');
function openDrawer() { drawer.classList.add('open'); scrim.classList.add('open'); $('#drawer-close').focus(); }
function closeDrawer() { drawer.classList.remove('open'); scrim.classList.remove('open'); cartBtn.focus(); }
function showStep(n) {
  step = n;
  $('#cart-list').hidden = $('#checkout').hidden = n !== 1;
  form.hidden = $('#back-btn').hidden = $('#send-order').hidden = n !== 2;
  setText('#drawer-title', n === 1 ? 'Seu pedido' : 'Finalizar pedido');
  $('#co-step-1').classList.toggle('on', n === 1);
  $('#co-step-2').classList.toggle('on', n === 2);
  drawer.classList.toggle('step-2', n === 2);
  setText('#checkout-note', '');
  $('.drawer-body').scrollTop = 0;
  if (n === 2) { updateSendLink(); setTimeout(() => $('#co-name').focus(), 50); }
}
cartBtn.addEventListener('click', openDrawer);
$('#quick-go').addEventListener('click', openDrawer);
$('#drawer-close').addEventListener('click', closeDrawer);
scrim.addEventListener('click', closeDrawer);
document.addEventListener('keydown', e => e.key === 'Escape' && drawer.classList.contains('open') && closeDrawer());
$('#checkout').addEventListener('click', () => showStep(2));
$('#back-btn').addEventListener('click', () => showStep(1));
// "Fazer pedido" do cabeçalho: com itens no carrinho abre o pedido; sem itens, leva aos produtos
$('.header-cta').addEventListener('click', e => { if (cart.size) { e.preventDefault(); openDrawer(); } });

// Campos que aparecem só quando fazem sentido
function syncConditional() {
  const pickup = isPickup(), cash = radio('pay') === 'Dinheiro';
  $('#apt-fields').hidden = radio('place') !== 'Apartamento';
  $('#delivery-fields').hidden = pickup;
  $('#pickup-fields').hidden = !pickup;
  setText('#pay-legend', pickup ? 'Pagamento na retirada' : 'Pagamento na entrega');
  $('#co-notes').placeholder = pickup ? 'Ex.: vou mandar outra pessoa buscar' : 'Ex.: entregar após as 14h, interfone quebrado';
  $('#cash-fields').hidden = !cash;
  $('#change-field').hidden = !(cash && $('#co-need-change').checked);
}

/* Mensagem do pedido */
const toCents = txt => {
  const c = String(txt).replace(/[^\d,.]/g, '');
  return c ? Math.round((c.includes(',') ? +c.replace(/\./g, '').replace(',', '.') : +c) * 100) : NaN;
};
function buildMessage() {
  const total = subtotal(), pickup = isPickup(), pay = radio('pay'), opt = (label, id) => val(id) && L.push(`${label}: ${val(id)}`);
  const L = [STORE.hello, '', '*Itens do pedido*', ...[...cart].map(([id, q]) => `${q}x ${byId[id].name} – R$ ${fmt(byId[id].price * q)}`),
    '', `Subtotal: R$ ${fmt(total)}`, pickup ? 'Retirada na loja' : 'Entrega: grátis', `*Total: R$ ${fmt(total)}*`, ''];
  if (pickup) {
    L.push('*Retirada na loja*', `Nome: ${val('co-name')}`, `Loja: ${STORE.address}`);
    opt('Quando vou retirar', 'co-pickup');
  } else {
    L.push('*Entrega*', `Nome: ${val('co-name')}`, `Endereço: ${val('co-street')}, ${val('co-number')}`,
      radio('place') === 'Apartamento' ? `Apartamento: ${val('co-apt')}${val('co-block') ? ' · Bloco/Torre ' + val('co-block') : ''}` : `Tipo: ${radio('place')}`);
    opt('Complemento', 'co-complement');
    L.push(`Bairro: ${val('co-district')}`);
    opt('CEP', 'co-cep');
    const chk = cepChecks.get(digits(val('co-cep')));
    if (chk?.status === 'ok') L.push(`Distância da loja: ~${fmtKm(chk.km)}${chk.km > STORE.radiusKm ? ' (fora do raio de 2 km, consultar disponibilidade)' : ''}`);
    opt('Referência', 'co-ref');
  }
  L.push('', pickup ? '*Pagamento na retirada*' : '*Pagamento*', pay || '(não informado)');
  if (pay === 'Dinheiro') {
    const c = toCents(val('co-change'));
    L.push($('#co-need-change').checked && c > 0 ? `Troco para R$ ${fmt(c)} (${pickup ? 'separar' : 'levar'} R$ ${fmt(c - total)} de troco)` : 'Não precisa de troco');
  }
  if (val('co-notes')) L.push('', `*Observações:* ${val('co-notes')}`);
  return L.join('\n');
}
const updateSendLink = () => $('#send-order').href = waLink(buildMessage());

function validate() {
  const pickup = isPickup(), bad = [];
  const rules = {
    name: val('co-name'), pay: radio('pay'),
    street: pickup || val('co-street'), number: pickup || val('co-number'), district: pickup || val('co-district'),
    apt: pickup || radio('place') !== 'Apartamento' || val('co-apt'),
    change: !(radio('pay') === 'Dinheiro' && $('#co-need-change').checked) || toCents(val('co-change')) > subtotal()
  };
  $$('[data-field]', form).forEach(f => { const ok = !!rules[f.dataset.field]; f.classList.toggle('invalid', !ok); if (!ok) bad.push(f); });
  return bad;
}
const clearInvalid = () => $$('.invalid', form).forEach(f => f.classList.remove('invalid'));
form.addEventListener('input', () => { syncConditional(); updateSendLink(); clearInvalid(); });
form.addEventListener('change', e => { syncConditional(); updateSendLink(); if (e.target.name === 'mode') { renderCart(); clearInvalid(); } });
form.addEventListener('submit', e => e.preventDefault());

// Lembra os dados de entrega neste aparelho para o próximo pedido
const SAVE_KEY = 'gege-entrega', SAVED = ['co-name', 'co-cep', 'co-street', 'co-number', 'co-district', 'co-apt', 'co-block', 'co-complement', 'co-ref'];
try {
  const data = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
  if (data) {
    SAVED.forEach(id => { if (data[id]) $('#' + id).value = data[id]; });
    ['place', 'mode'].forEach(n => { const r = data[n] && $(`input[name="${n}"][value="${data[n]}"]`, form); if (r) r.checked = true; });
  }
} catch (e) { /* armazenamento indisponível: segue sem lembrar */ }
syncConditional();

$('#send-order').addEventListener('click', e => {
  const bad = validate();
  if (bad.length) {
    e.preventDefault();
    setText('#checkout-note', 'Preencha os campos destacados para enviar o pedido.');
    bad[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
    $('input', bad[0])?.focus({ preventScroll: true });
    return;
  }
  updateSendLink();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(Object.fromEntries([['place', radio('place')], ['mode', radio('mode')], ...SAVED.map(id => [id, val(id)])]))); } catch (err) { /* sem armazenamento */ }
  setText('#checkout-note', 'Abrimos o WhatsApp com o seu pedido pronto. É só tocar em enviar.');
});

// "Retirar na loja": marca a retirada no pedido e abre o carrinho (ou leva ao catálogo, se estiver vazio)
function choosePickup() {
  $('input[name="mode"][value="retirada"]', form).checked = true;
  syncConditional();
  renderCart();
  if (cart.size) { openDrawer(); showStep(2); }
  else { $('#produtos').scrollIntoView({ block: 'start' }); toast('Escolha os produtos. A retirada na loja já está marcada no pedido.'); }
}
document.addEventListener('click', e => e.target.closest('[data-pickup]') && choosePickup());

renderCart();
