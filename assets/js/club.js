/* Clube: calculadora de galões por mês */
const range = $('#calc-range'), galoes = $('#galoes');
galoes.innerHTML = '<i></i>'.repeat(+range.max);

function updateCalc() {
  const n = +range.value, plan = PLANS.find(p => n <= p.max), word = plural(n, 'galão', 'galões'), price = $('#calc-price');
  $('#calc-out').textContent = n;
  $('#calc-word').textContent = word;
  [...galoes.children].forEach((g, i) => g.classList.toggle('on', i < n));
  $('#calc-plan').textContent = plan.name;
  $('#calc-perks').innerHTML = [`${n} ${word} de 20L por mês`, ...plan.perks].map(t => `<li>${icon('check')}${t}</li>`).join('');
  price.classList.toggle('text', !plan.unit);
  price.innerHTML = plan.unit ? `<small>R$</small>${fmt(n * plan.unit)}<small>/mês</small>` : 'Sob consulta';
  $('#calc-unit').textContent = plan.unit ? `R$ ${fmt(plan.unit)} por galão · economia de R$ ${fmt(n * (AVULSO - plan.unit))} por mês` : 'A partir de 10 galões por mês, o preço é combinado com você.';
  $('#calc-cta').textContent = plan.unit ? `Assinar o ${plan.name} pelo WhatsApp` : 'Pedir proposta pelo WhatsApp';
  $('#calc-cta').href = waLink(plan.unit ? `Olá, vim pelo site! Tenho interesse no plano ${plan.name} do Clube Gegê, com ${n} ${word} por mês.` : `Olá, vim pelo site! Gostaria de uma proposta para ${n} ou mais galões por mês.`);
}
range.addEventListener('input', updateCalc);
updateCalc();

// Galões: passar o mouse mostra a quantidade, clicar escolhe
const galaoIndex = e => [...galoes.children].indexOf(e.target.closest('i'));
galoes.addEventListener('mouseover', e => { const k = galaoIndex(e); if (k >= 0) [...galoes.children].forEach((g, i) => g.classList.toggle('preview', i <= k)); });
galoes.addEventListener('mouseleave', () => [...galoes.children].forEach(g => g.classList.remove('preview')));
galoes.addEventListener('click', e => { const k = galaoIndex(e); if (k >= 0) { range.value = k + 1; updateCalc(); } });
