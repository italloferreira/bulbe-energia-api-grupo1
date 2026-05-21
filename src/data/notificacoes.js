// "Banco de dados" em memória das notificações dos usuários
// Cada notificação tem: id, usuarioId, tipo, titulo, mensagem, lida (bool), data, link

const notificacoes = {
  lista: [
    {
      id: 1,
      usuarioId: 1,
      tipo: 'pedido',
      titulo: 'Pedido confirmado',
      mensagem: 'Seu pedido PED-00001 foi confirmado e está sendo preparado.',
      lida: false,
      data: '2026-05-19T14:30:00.000Z',
      link: '/pedidos/PED-00001'
    },
    {
      id: 2,
      usuarioId: 1,
      tipo: 'promocao',
      titulo: 'Cupom de 20% disponível',
      mensagem: 'Use o cupom BULBE20 e ganhe 20% de desconto em compras acima de R$ 100.',
      lida: false,
      data: '2026-05-18T09:00:00.000Z',
      link: '/promocoes'
    },
    {
      id: 3,
      usuarioId: 1,
      tipo: 'entrega',
      titulo: 'Pedido entregue',
      mensagem: 'Seu pedido PED-00000 foi entregue. Que tal avaliar?',
      lida: true,
      data: '2026-05-15T18:45:00.000Z',
      link: '/pedidos/PED-00000'
    },
    {
      id: 4,
      usuarioId: 2,
      tipo: 'pedido',
      titulo: 'Pedido confirmado',
      mensagem: 'Seu pedido PED-00002 foi confirmado.',
      lida: false,
      data: '2026-05-19T16:00:00.000Z',
      link: '/pedidos/PED-00002'
    }
  ],
  _proximoId: 5
};

module.exports = notificacoes;