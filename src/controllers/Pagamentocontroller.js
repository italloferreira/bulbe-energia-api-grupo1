const pedidos = require('../data/pedidos');
const pagamentos = require('../data/pagamentos');
const { criarCobrancaPix } = require('../services/gatewayPix');

const EXPIRACAO_MS = 15 * 60 * 1000;

function expirarPagamento(pagamentoId) {
  const pagamento = pagamentos.lista.find(p => p.id === pagamentoId);
  if (!pagamento || pagamento.status !== 'pendente') {
    return;
  }

  pagamento.status = 'expirado';

  const pedido = pedidos.lista.find(p => p.id === pagamento.pedidoId);
  if (pedido && pedido.status === 'processando_pagamento') {
    pedido.status = 'aguardando_pagamento';
  }
}

function criarPagamentoPix(req, res) {
  const pedidoId = req.body?.pedido_id ?? req.body?.pedidoId;

  if (!pedidoId || typeof pedidoId !== 'string') {
    return res.status(400).json({
      erro: 'pedido_id é obrigatório'
    });
  }

  const pedido = pedidos.lista.find(p => p.id === pedidoId);
  if (!pedido) {
    return res.status(404).json({
      erro: `Pedido '${pedidoId}' não encontrado`
    });
  }

  if (pedido.status !== 'aguardando_pagamento') {
    return res.status(409).json({
      erro: `Pedido não está aguardando pagamento (status atual: ${pedido.status})`
    });
  }

  const pendenteExistente = pagamentos.lista.find(
    p => p.pedidoId === pedidoId && p.status === 'pendente'
  );
  if (pendenteExistente) {
    return res.status(409).json({
      erro: 'Já existe um pagamento PIX pendente para este pedido'
    });
  }

  const cobranca = criarCobrancaPix(pedido);

  const agora = Date.now();
  const expiraEm = new Date(agora + EXPIRACAO_MS).toISOString();

  const pagamento = {
    id: `PIX-${String(pagamentos._proximoId++).padStart(5, '0')}`,
    pedidoId,
    metodo: 'pix',
    status: 'pendente',
    gatewayId: cobranca.gatewayId,
    valor: cobranca.valor,
    qrCodeUrl: cobranca.qrCodeUrl,
    pixCopiaECola: cobranca.pixCopiaECola,
    criadoEm: new Date(agora).toISOString(),
    expiraEm
  };
  pagamentos.lista.push(pagamento);

  pedido.status = 'processando_pagamento';

  const timer = setTimeout(() => expirarPagamento(pagamento.id), EXPIRACAO_MS);
  if (typeof timer.unref === 'function') {
    timer.unref();
  }

  return res.status(201).json({
    pagamentoId: pagamento.id,
    pedidoId: pagamento.pedidoId,
    status: pagamento.status,
    valor: pagamento.valor,
    qrCodeUrl: pagamento.qrCodeUrl,
    pixCopiaECola: pagamento.pixCopiaECola,
    expiraEm: pagamento.expiraEm,
    expiraEmSegundos: EXPIRACAO_MS / 1000
  });
}

function consultarPagamentoPix(req, res) {
  const { id } = req.params;

  const pagamento = pagamentos.lista.find(p => p.id === id);
  if (!pagamento) {
    return res.status(404).json({
      erro: `Pagamento '${id}' não encontrado`
    });
  }

  if (
    pagamento.status === 'pendente' &&
    Date.now() > new Date(pagamento.expiraEm).getTime()
  ) {
    expirarPagamento(pagamento.id);
  }

  return res.json({
    pagamentoId: pagamento.id,
    pedidoId: pagamento.pedidoId,
    status: pagamento.status,
    valor: pagamento.valor,
    qrCodeUrl: pagamento.qrCodeUrl,
    pixCopiaECola: pagamento.pixCopiaECola,
    criadoEm: pagamento.criadoEm,
    expiraEm: pagamento.expiraEm
  });
}

module.exports = { criarPagamentoPix, consultarPagamentoPix };