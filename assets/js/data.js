/* Dados da loja. Para mudar preços, produtos, horário, raio de entrega ou contato, edite só este arquivo. */
const STORE = {
  whats: '5511993322468',
  hello: 'Olá, vim pelo site e gostaria de fazer um pedido!',
  address: 'R. Belém, 166 · Belenzinho',
  maps: 'https://www.google.com/maps/search/?api=1&query=R.+Bel%C3%A9m%2C+166+-+Belenzinho%2C+S%C3%A3o+Paulo+-+SP%2C+03057-010',
  pos: { lat: -23.5389962, lng: -46.5971569 }, // porta da loja (Google Maps)
  radiusKm: 2,
  // Horário por dia da semana, de domingo (0) a sábado (6): [abre, fecha] ou null (fechado)
  hours: [null, [9, 18], [9, 18], [9, 18], [9, 18], [9, 18], [9, 12]]
};

// c: cor da silhueta · tint: fundo do bloco · ct: cor do texto da categoria
const CATS = {
  agua:       { label: 'Água mineral',      c: 'var(--brand)',  tint: 'var(--brand-tint)',  ct: 'var(--brand)' },
  naturais:   { label: 'Produtos naturais', c: 'var(--green)',  tint: 'var(--green-tint)',  ct: 'var(--green-text)' },
  acessorios: { label: 'Acessórios',        c: 'var(--orange)', tint: 'var(--orange-tint)', ct: 'var(--orange-text)' }
};

// Posição do rótulo dentro de cada silhueta (viewBox 0 0 100 140): [y, tamanho, tamanho do subtítulo]
const SHAPES = { galao: [90, 22, 10], fardo: [92, 19, 11], garrafa: [98, 15, 9], saco: [90, 19, 10], pote: [98, 20, 10], caixa: [88, 22, 10], aparelho: [96, 17, 10] };

// Preços em centavos (valores de exemplo)
const PRODUCTS = [
  { id: 'g20',   cat: 'agua',       name: 'Água Mineral 20L',          desc: 'Recarga com troca do galão vazio',     shape: 'galao',    size: '20L',   tag: 'Mais pedido', price: 1490 },
  { id: 'g20c',  cat: 'agua',       name: 'Galão 20L com Água',        desc: 'Casco retornável novo + água',         shape: 'galao',    size: '20L',   tag: 'Casco novo',  price: 3990 },
  { id: 'a15',   cat: 'agua',       name: 'Água Mineral 1,5L',         desc: 'Fardo com 6 garrafas',                 shape: 'fardo',    size: '1,5L',  x: '×6',            price: 1790 },
  { id: 'gas',   cat: 'agua',       name: 'Água com Gás 500ml',        desc: 'Fardo com 12 garrafas',                shape: 'fardo',    size: '500ml', x: '×12', tag: 'Com gás', price: 2690 },
  { id: 'coco',  cat: 'naturais',   name: 'Água de Coco Integral',     desc: 'Garrafa de 1 litro, sem conservantes', shape: 'garrafa',  size: '1L',                       price: 1290 },
  { id: 'cast',  cat: 'naturais',   name: 'Mix de Castanhas',          desc: 'Castanha-do-pará, caju e amêndoas',    shape: 'saco',     size: '200g',  tag: 'Sem sal',     price: 2490 },
  { id: 'gran',  cat: 'naturais',   name: 'Granola Sem Açúcar',        desc: 'Aveia, coco e sementes',               shape: 'saco',     size: '400g',                       price: 1990 },
  { id: 'mel',   cat: 'naturais',   name: 'Mel Silvestre',             desc: 'Pote de vidro, florada silvestre',     shape: 'pote',     size: '500g',  tag: 'Orgânico',    price: 3200 },
  { id: 'cha',   cat: 'naturais',   name: 'Chá Verde Orgânico',        desc: 'Caixa com 20 sachês',                  shape: 'caixa',    size: '20',    x: 'sachês',        price: 1590 },
  { id: 'bomba', cat: 'acessorios', name: 'Bomba Elétrica para Galão', desc: 'Recarregável via USB',                 shape: 'aparelho', size: 'USB',                        price: 3490 },
  { id: 'sup',   cat: 'acessorios', name: 'Suporte Giratório',         desc: 'Para galões de 10L e 20L',             shape: 'aparelho', size: '360°',                       price: 4990 },
  { id: 'beb',   cat: 'acessorios', name: 'Bebedouro de Mesa',         desc: 'Água gelada e natural',                shape: 'aparelho', size: '10°C',  tag: 'Novo',        price: 28900 }
];
const QUICK = ['g20', 'g20c', 'a15']; // itens do "Pedido rápido" no topo

// Clube: preço do galão avulso e planos por quantidade de galões por mês
const AVULSO = 1490;
const PLANS = [
  { max: 2,  name: 'Essencial', unit: 1390, perks: ['Entrega quinzenal no dia que você escolher', 'Troca do galão vazio inclusa'] },
  { max: 9,  name: 'Família',   unit: 1290, perks: ['Entregas semanais ou no dia que você escolher', '10% de desconto em produtos naturais', 'Pedidos extras com o mesmo preço do plano'] },
  { max: 99, name: 'Empresa',   unit: null, perks: ['Bebedouro em comodato', 'Entregas em horário combinado', 'Nota fiscal e pagamento por boleto'] }
];

// Avaliações reais do Google, cada uma ligada a uma promessa da loja (o trecho entre <mark> aparece grifado)
const REVIEWS = [
  { icon: 'chat-line', claim: 'Atendimento de quem entende', detail: 'Explicamos a diferença entre as águas e ajudamos você a escolher.', color: 'green-tint', initials: 'LM', name: 'Prof. Lili M.', note: 'Cliente recente',
    text: 'Atendimento impecável, rápido e de muita qualidade. <mark>Alguém que realmente entende do que está vendendo!</mark> Atencioso e prestativo nas explicações sobre água. Obrigada Ge. Viramos clientes!' },
  { icon: 'people', claim: 'Uma equipe que conhece você', detail: 'Atendimento pessoal pelo telefone e pelo WhatsApp, com as mesmas pessoas há anos.', color: 'brand-tint', initials: 'DC', name: 'Daiani C.', note: 'Cliente há quase 6 anos',
    text: '<mark>Sou Cliente há quase 6 anos.</mark> Senhor Gege é extremamente atencioso pelo telefone e WhatsApp. Os funcionários também são Super profissionais e simpáticos. Ou seja, toda equipe nota 10.' },
  { icon: 'clock', claim: 'Entrega rápida e certinha', detail: 'Pedidos no horário de atendimento chegam em até 2 horas, conferidos item por item.', color: 'orange-tint', initials: 'CF', name: 'Closet das Flores', note: 'Pedido de 2 galões',
    text: 'Excelente atendimento! Pedi 2 galões de água hoje e veio tudo certinho. <mark>A entrega foi rápida, os entregadores foram muito educados e atenciosos</mark>, e a qualidade da água é ótima. Atendimento nota 10, recomendo bastante 👏👏' },
  { icon: 'building', claim: 'Até a porta do apartamento', detail: 'O entregador leva o galão até você, sem precisar descer na portaria.', color: 'green-tint', initials: 'WV', name: 'Wanderson V.', note: 'Local Guide no Google',
    text: 'Geovane super atencioso em explicar sobre os diferencias dos seus produtos e hoje fiz o pedido e estou super contente. <mark>O entregador dele chamado Manoel super gente boa e me trouxe até o meu apto.</mark> Atendimento diferenciado e super recomendo.' },
  { icon: 'egg', claim: 'Mais que água', detail: 'Ovos, produtos naturais e acessórios no mesmo pedido do galão.', color: 'brand-tint', initials: 'R', name: 'Rodrigo', note: 'Local Guide no Google',
    text: 'Melhor serviço de entrega de águas da região. Respeito e cuidado com o cliente! <mark>A loja vende também ovos. Muito bom, tamanho ideal para fazer uma boa refeição.</mark> Me ganharam como cliente...RECOMENDO!!!' }
];
