# Gegê Águas

Site da Gegê Águas, distribuidora de água mineral e produtos naturais no Belenzinho, São Paulo.

Protótipo em análise: textos, preços e bairros atendidos ainda são exemplos.

## Como abrir

É uma página estática, sem instalação nem etapa de build. Publique a pasta em qualquer hospedagem estática (GitHub Pages, Netlify). Para testar no computador, sirva a pasta com um servidor local, por exemplo `python3 -m http.server`, e abra `http://localhost:8000`.

## Estrutura

```
index.html            conteúdo da página (textos, seções e formulário)
assets/
  css/
    base.css          cores, tipografia, botões e cabeçalho
    sections.css      seções da página, na ordem em que aparecem
    order.css         carrinho, finalização do pedido e aviso
    effects.css       vidro líquido, efeitos do mouse e animações
  js/
    data.js           dados da loja: contato, horário, raio, produtos, planos e avaliações
    utils.js          funções curtas usadas pelos outros scripts
    page.js           avaliações, aberto/fechado, horário, números, menu e copiar
    cart.js           catálogo, carrinho e mensagem do pedido no WhatsApp
    cep.js            consulta de CEP e distância até a loja
    club.js           calculadora do Clube
    effects.js        efeitos do mouse e animações ao rolar
  img/                logo (o arquivo em alta resolução não é carregado pelo site)
```

## O que tem no site

- Pedido rápido no topo e catálogo com carrinho
- Finalização do pedido com entrega ou retirada na loja, que abre o WhatsApp da loja com a mensagem pronta (itens, endereço, pagamento e troco)
- Consulta de CEP: até 2 km da loja confirma a entrega; mais longe, pede para consultar pelo WhatsApp
- Status de aberto/fechado pelo horário de São Paulo
- Calculadora do Clube de assinatura
- Avaliações reais do Google, área de entrega, dúvidas e contato

## Onde ajustar

Quase tudo fica em `assets/js/data.js`:

- `STORE`: WhatsApp, endereço, link do mapa, coordenadas da porta da loja, raio de entrega e horário
- `PRODUCTS`: produtos e preços (em centavos); `QUICK`: itens do pedido rápido
- `PLANS` e `AVULSO`: planos do Clube
- `REVIEWS`: avaliações exibidas

Para ver de onde veio cada coordenada na consulta de CEP, abra o site com `?debug` no endereço.
