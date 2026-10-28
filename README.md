# Gegê Águas

Site da Gegê Águas, distribuidora de água mineral e produtos naturais no Belenzinho, São Paulo.

Protótipo em análise: textos, preços e bairros atendidos ainda são exemplos.

## Como abrir

É uma página estática, sem instalação. Abra o `index.html` no navegador ou publique a pasta em qualquer hospedagem estática (GitHub Pages, Netlify).

## O que tem no site

- Pedido rápido no topo e catálogo com carrinho
- Finalização do pedido que abre o WhatsApp da loja com a mensagem pronta (itens, endereço, pagamento e troco)
- Consulta de CEP: até 2 km da loja confirma a entrega; mais longe, pede para consultar pelo WhatsApp
- Status de aberto/fechado pelo horário de São Paulo
- Calculadora do Clube de assinatura
- Avaliações reais do Google, área de entrega, dúvidas e contato

## Onde ajustar

- Produtos e preços: lista `PRODUCTS` no script do `index.html` (preços em centavos)
- Taxa de entrega: `FREE_FROM` e `FEE`
- Horário de atendimento: `HOURS`
- Número do WhatsApp: `WHATS`
- Raio de entrega e posição da loja: `RADIUS_KM` e `STORE` (coordenadas aproximadas; troque pelas exatas do Google Maps)
- Para ver de onde veio cada coordenada na consulta de CEP, abra o site com `?debug` no endereço
