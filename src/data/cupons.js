const cupons = [
  {
    codigo: 'BULBE10',
    tipo: 'percentual',
    valor: 10,
    dataInicio: '2025-01-01',
    dataFim: '2099-12-31',
    valorMinimo: 50.00,
    limiteUsoGlobal: 1000,
    limiteUsoPorUsuario: 1,
    totalUsado: 0,
    usosPorUsuario: {},
    ativo: true
  },
  {
    codigo: 'BULBE20',
    tipo: 'percentual',
    valor: 20,
    dataInicio: '2025-01-01',
    dataFim: '2099-12-31',
    valorMinimo: 100.00,
    limiteUsoGlobal: 500,
    limiteUsoPorUsuario: 1,
    totalUsado: 0,
    usosPorUsuario: {},
    ativo: true
  },
  {
    codigo: 'FRETEGRATIS',
    tipo: 'frete_gratis',
    valor: 0,
    dataInicio: '2025-01-01',
    dataFim: '2099-12-31',
    valorMinimo: 0,
    limiteUsoGlobal: 2000,
    limiteUsoPorUsuario: 3,
    totalUsado: 0,
    usosPorUsuario: {},
    ativo: true
  }
];
 
module.exports = cupons;