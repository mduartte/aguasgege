# Regras do projeto

Site estático da Gegê Águas, sem build. Mantenha a organização e o código enxuto em toda mudança.

- **Estrutura:** conteúdo em `index.html`, estilos em `assets/css/`, scripts em `assets/js/`, imagens em `assets/img/`. Não volte a colocar CSS ou JS dentro do HTML.
- **Dados num lugar só:** preços, produtos, horário, contato, raio de entrega, planos e avaliações ficam em `assets/js/data.js`. Os outros arquivos leem dali, sem repetir valores.
- **Ícones:** use a folha de ícones do topo do `index.html` (`<svg class="ico"><use href="#i-nome"/></svg>`; no JS, `icon('nome')`). Ícone novo vira um `<symbol>` lá.
- **Scripts:** arquivos clássicos com `defer`, carregados na ordem do `<head>` (data → utils → page → cart → cep → club → effects) e compartilhando funções globais. Sem bibliotecas externas.
- **Enxuto:** reaproveite classes e funções existentes antes de criar novas; junte regras repetidas; apague o que deixar de ser usado na mesma mudança.
- **Fluxo:** mostre as mudanças numa prévia e só envie ao GitHub depois que o dono aprovar.
- **Conferência:** antes de enviar, sirva a pasta localmente e confira no celular e no computador que nada quebrou (carrinho, pedido pelo WhatsApp, consulta de CEP, calculadora e animações).
