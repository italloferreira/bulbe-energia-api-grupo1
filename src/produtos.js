const produtos = [
  {
    id: 1,
    nome: 'Lâmpada LED 12W',
    descricaoLonga: 'Lâmpada LED econômica com alta durabilidade e baixo consumo de energia.',
    galeriaImagens: [
      'https://example.com/imagens/lampada1.jpg',
      'https://example.com/imagens/lampada2.jpg'
    ],
    preco: 29.90,
    desconto: 10,
    marca: 'Philips',
    especificacoesTecnicas: {
      potencia: '12W',
      voltagem: '110V',
      temperaturaCor: '6500K'
    },
    estoque: 120,
    avaliacoesResumidas: {
      media: 4.8,
      total: 256
    },
    ativo: true
  },
  {
    id: 2,
    nome: 'Painel Solar 550W',
    descricaoLonga: 'Painel solar de alta eficiência para sistemas fotovoltaicos.',
    galeriaImagens: [
      'https://example.com/imagens/painel1.jpg'
    ],
    preco: 899.90,
    desconto: 5,
    marca: 'Canadian Solar',
    especificacoesTecnicas: {
      potencia: '550W',
      eficiencia: '21.3%'
    },
    estoque: 30,
    avaliacoesResumidas: {
      media: 4.9,
      total: 98
    },
    ativo: false
  }
];

module.exports = produtos;