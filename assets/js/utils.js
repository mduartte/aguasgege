/* Funções curtas usadas pelos outros scripts */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const fmt = c => (c / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const icon = id => `<svg class="ico" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const waLink = text => `https://wa.me/${STORE.whats}${text ? '?text=' + encodeURIComponent(text) : ''}`;
const esc = t => String(t || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const digits = v => String(v).replace(/\D/g, '');
const fmtCep = d => `${String(d).slice(0, 5)}-${String(d).slice(5)}`;
const plural = (n, one, many) => n === 1 ? one : many;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window);

// Formata o campo de CEP enquanto a pessoa digita e devolve só os números
function maskCep(input) {
  const d = digits(input.value).slice(0, 8);
  input.value = d.length > 5 ? fmtCep(d) : d;
  return d;
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
