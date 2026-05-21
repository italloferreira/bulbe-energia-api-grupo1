const notificacoes = require('../data/notificacoes');

// US-18 · Listar notificações do usuário autenticado
// GET /api/notificacoes
// Suporta filtro ?nao_lidas=true
function listar(req, res) {
  const usuarioId = req.user.id;
  const apenasNaoLidas = req.query.nao_lidas === 'true';

  // 1. Filtra só as notificações do usuário logado
  let lista = notificacoes.lista.filter(
    n => n.usuarioId === usuarioId
  );

  // 2. Se o filtro nao_lidas=true foi passado, filtra ainda mais
  if (apenasNaoLidas) {
    lista = lista.filter(n => !n.lida);
  }

  // 3. Ordena da mais recente pra mais antiga
  lista.sort((a, b) =>
    new Date(b.data) - new Date(a.data)
  );

  return res.json(lista);
}

// US-19 · Marcar UMA notificação como lida
// PATCH /api/notificacoes/:id/lida
function marcarComoLida(req, res) {
  const usuarioId = req.user.id;
  const notificacaoId = parseInt(req.params.id);

  // 1. Procura a notificação pelo id
  const notificacao = notificacoes.lista.find(
    n => n.id === notificacaoId
  );

  if (!notificacao) {
    return res.status(404).json({
      erro: 'Notificação não encontrada'
    });
  }

  // 2. Verifica se a notificação pertence ao usuário logado
  // Se não for, retorna 403 Forbidden (critério da issue)
  if (notificacao.usuarioId !== usuarioId) {
    return res.status(403).json({
      erro: 'Você não tem permissão para acessar esta notificação'
    });
  }

  // 3. Marca como lida
  notificacao.lida = true;

  return res.json(notificacao);
}

// US-19 · Marcar TODAS as notificações do usuário como lidas
// PATCH /api/notificacoes/lidas
function marcarTodasComoLidas(req, res) {
  const usuarioId = req.user.id;

  // 1. Pega só as notificações do usuário logado
  const minhasNotificacoes = notificacoes.lista.filter(
    n => n.usuarioId === usuarioId
  );

  // 2. Marca todas como lidas
  minhasNotificacoes.forEach(n => {
    n.lida = true;
  });

  // 3. Retorna quantas foram marcadas
  return res.json({
    mensagem: 'Todas as notificações foram marcadas como lidas',
    total: minhasNotificacoes.length
  });
}

module.exports = {
  listar,
  marcarComoLida,
  marcarTodasComoLidas
};