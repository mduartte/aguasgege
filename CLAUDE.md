# Gegê Águas · regras do projeto

Site estático da Gegê Águas, distribuidora de água mineral, produtos naturais, ovos e acessórios no Belenzinho, São Paulo. Pedidos não têm sistema próprio: o site monta a mensagem e abre o WhatsApp da loja. Escreva sempre em português do Brasil, com linguagem simples.

## Organização do código

- **Estrutura:** conteúdo em `index.html`, estilos em `assets/css/`, scripts em `assets/js/`, imagens em `assets/img/`. Não volte a colocar CSS ou JS dentro do HTML.
  - CSS: `base` (cores, tipografia, botões, cabeçalho) · `sections` (seções na ordem da página) · `order` (carrinho e finalização) · `effects` (vidro líquido, mouse, animações).
  - JS: `data` → `utils` → `page` → `cart` → `cep` → `club` → `effects`, arquivos clássicos com `defer` na ordem do `<head>`, compartilhando funções globais. Sem bibliotecas externas e sem build.
- **Dados num lugar só:** preços (em centavos), produtos, pedido rápido, horário, contato, endereço, mapa, coordenadas da loja, raio de entrega, planos e avaliações ficam em `assets/js/data.js`. Os outros arquivos leem dali, sem repetir valores.
- **Ícones:** use a folha de ícones do topo do `index.html` (`<svg class="ico"><use href="#i-nome"/></svg>`; no JS, `icon('nome')`). Ícone novo vira um `<symbol>` lá.
- **Enxuto:** reaproveite classes e funções existentes antes de criar novas; junte regras repetidas; apague o que deixar de ser usado na mesma mudança.

## Regras do negócio que o site segue

- **Loja:** R. Belém, 166 · Belenzinho, São Paulo - SP, 03057-010. WhatsApp e telefone (11) 99332-2468. Sem e-mail.
- **Horário:** segunda a sexta 9h às 18h, sábado 9h às 12h, domingo fechado; feriados podem mudar. O selo "Aberto agora / Fechado agora" usa o horário de São Paulo.
- **Entrega:** grátis para endereços a até 2 km da loja (linha reta até a porta, coordenadas do Google Maps). Acima de 2 km, ou sem como calcular, a resposta é "Para essa localização, é necessário consultar a possibilidade de entrega", com os botões "Consultar disponibilidade" (WhatsApp) e "Retirar na loja". Resposta positiva: só o endereço e "em até 2 horas".
- **Retirada na loja:** opção no pedido, sem endereço; o cliente diz quando vai buscar.
- **Consulta de CEP:** endereço pela AwesomeAPI, BrasilAPI ou ViaCEP; coordenadas pela AwesomeAPI ou pelo OpenStreetMap (só no nível da rua). Não use as coordenadas da BrasilAPI: costumam ser o centro da cidade. `?debug` no endereço mostra de onde veio cada coordenada.
- **Avaliações:** só as reais do Google (nota 5,0, "+200 avaliações"). Não invente depoimentos.
- Preços, produtos, planos do Clube e bairros ainda são exemplos até o dono responder o questionário.

## Visual

Visual limpo de marcas conhecidas, cores da marca (azul `#0A6CC2`, verde do WhatsApp), fonte Plus Jakarta Sans, tema claro. O dono não gosta de visual com cara de IA, de fontes infantis nem de estrutura genérica. Efeitos aprovados: preços em vidro, cards líquidos no Clube, efeitos de mouse em poucos pontos e animações ao rolar (respeitando quem desativa animações). A imagem do produto não se mexe ao passar o mouse; só o card.

## Fluxo de trabalho

1. Faça a mudança e mostre numa prévia do Claude (artifact privado). O link que o cliente vê e o GitHub só mudam depois que o dono aprovar.
2. **Conferência:** sirva a pasta localmente (`python3 -m http.server`) e confira no celular (390 px) e no computador (1280 px), sem rolagem lateral nem erros: carrinho, pedido pelo WhatsApp (entrega e retirada), consulta de CEP, calculadora e animações. Em mudanças de organização do código, compare com a versão anterior para garantir que nada mudou.
3. Aprovado: commit em português no `main` e push. O GitHub Pages publica a raiz do `main` em https://mduartte.github.io/aguasgege/ em cerca de 1 minuto; se parecer desatualizado, é cache do navegador (`?v=N` no endereço).
4. Na prévia do Claude, a consulta de CEP não funciona (o Claude bloqueia sites externos); para testar CEPs de verdade, use o GitHub Pages.
