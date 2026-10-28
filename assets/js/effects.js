/* Efeitos: brilho dos cards líquidos, destaque da conversa e animações ao rolar */

// Cards líquidos: o brilho segue o mouse
$$('.liquid').forEach(card => card.addEventListener('pointermove', e => {
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${e.clientX - r.left}px`);
  card.style.setProperty('--my', `${e.clientY - r.top}px`);
}));

// Passos do "Como funciona" destacam a parte da conversa correspondente
const phone = $('.phone');
$$('.how-steps li').forEach(li => {
  li.addEventListener('mouseenter', () => phone.classList.add('show-' + li.dataset.step));
  li.addEventListener('mouseleave', () => phone.classList.remove('show-' + li.dataset.step));
});

/* Animações ao rolar: só animam os elementos que estão abaixo da tela quando a página abre */
(function scrollReveal() {
  if (reduceMotion) return;
  $$('.hero-copy > *').forEach((el, i) => el.style.setProperty('--i', i));
  $$('.quick-item').forEach((el, i) => el.style.setProperty('--i', i));

  // [seletor, variação, atraso entre irmãos em ms, recomeça a contagem a cada: 'head' (título) ou 'row' (linha de cards)]
  const GROUPS = [
    ['main .sec-head > *', '', 90, 'head'], ['.ribbon-list li', '', 90], ['.shelf-list, .shelf-free'],
    ['.product', 'rv-zoom', 80, 'row'], ['.not-found'], ['.how-steps li', '', 120], ['.phone', 'rv-zoom'],
    ['.calc-input', 'rv-l'], ['.calc-result, .g-score, .proof .quote', 'rv-r'], ['.club-biz'], ['.claim', 'rv-l'], ['.reviews-more'],
    ['.map-panel', 'rv-zoom'], ['.radar-dot', 'rv-pop-l', 120], ['.wk-track i', 'rv-x', 70], ['.week-note, .chips, .fee-note', '', 90],
    ['.faq details', '', 80], ['.closing-top > *', '', 120], ['.closing-grid > div', '', 100], ['.footer-bottom']
  ];
  const below = el => el.getBoundingClientRect().top >= innerHeight * 0.92;
  const VARIANTS = ['rv', 'rv-in', 'rv-l', 'rv-r', 'rv-zoom', 'rv-x', 'rv-pop', 'rv-pop-l'];
  const done = el => { el.classList.remove(...VARIANTS); el.style.removeProperty('--d'); };
  const io = new IntersectionObserver(entries => entries.forEach(({ isIntersecting, target: el }) => {
    if (!isIntersecting) return;
    io.unobserve(el);
    el.classList.add('rv-in');
    setTimeout(() => done(el), 950 + parseFloat(el.style.getPropertyValue('--d')) * 1000);
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  GROUPS.forEach(([sel, variant, step = 0, by]) => {
    let i = 0, last;
    $$(sel).forEach(el => {
      if (!below(el)) return; // já visível ao abrir: fica como está
      const key = by === 'head' ? el.closest('.sec-head') : by === 'row' ? Math.round(el.getBoundingClientRect().top) : null;
      if (key !== last) { i = 0; last = key; }
      el.classList.add('rv', ...(variant ? [variant] : []));
      el.style.setProperty('--d', `${i++ * step / 1000}s`);
      io.observe(el);
    });
  });

  // Conversa do WhatsApp: a mensagem do cliente aparece, a loja "digita" e responde
  const chat = $('.chat');
  if (!below(chat)) return;
  const out = $('.bubble.out', chat), reply = $('.bubble.in', chat);
  out.classList.add('rv', 'rv-pop');
  reply.classList.add('rv', 'rv-pop-l');
  const cio = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    cio.disconnect();
    setTimeout(() => out.classList.add('rv-in'), 500);
    setTimeout(() => chat.classList.add('typing-on'), 1300);
    setTimeout(() => { chat.classList.remove('typing-on'); reply.classList.add('rv-in'); }, 2600);
    setTimeout(() => [out, reply].forEach(done), 3600);
  }, { threshold: 0.5 });
  cio.observe(chat);
})();
