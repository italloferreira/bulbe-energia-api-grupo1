const db = require('../data/db');
const { criarCobrancaPix } = require('../services/gatewayPix');

const EXPIRACAO_MS = 15 * 60 * 1000;

function formatPixId(id) {
  return `PIX-${String(id).padStart(5, '0')}`;
}

function formatPedidoId(id) {
  return `PED-${String(id).padStart(5, '0')}`;
}

function reconstruirPagamento(row) {
  if (!row) return null;
  return {
    id: formatPixId(row.id),
    pedidoId: formatPedidoId(row.pedido_id),
    metodo: row.metodo,
    status: row.status,
    gatewayId: row.gatewayId,
    valor: row.valor,
    qrCodeUrl: row.qrCodeUrl,
    pixCopiaECola: row.pixCopiaECola,
    criadoEm: row.criadoEm,
    expiraEm: row.expiraEm,
    pagoEm: row.pagoEm || null,
    data_pagamento: row.data_pagamento || null
  };
}

function reconstruirPedido(row) {
  if (!row) return null;
  return {
    id: formatPedidoId(row.id),
    numId: row.id,
    usuarioId: row.usuario_id,
    status: row.status,
    criadoEm: row.criadoEm,
    enderecoEntrega: JSON.parse(row.endereco || '{}'),
    frete: { tipo: row.frete_tipo || 'padrao', valor: row.frete },
    cupom: row.cupom_codigo || null,
    metodoPagamento: row.metodoPagamento,
    resumo: JSON.parse(row.resumo || '{}'),
    codigoRastreio: row.codigoRastreio || null,
    canceladoEm: row.canceladoEm || null,
    reembolsoProcessado: row.reembolsoProcessado === '1' || row.reembolsoProcessado === 1 || row.reembolsoProcessado === true
  };
}

function expirarPagamento(pagamentoId) {
  const numId = parseInt(pagamentoId.replace('PIX-', ''), 10);
  if (isNaN(numId)) return;

  const pagamento = db.prepare('SELECT * FROM pagamentos WHERE id = ?').get(numId);
  if (!pagamento || pagamento.status !== 'pendente') return;

  db.prepare("UPDATE pagamentos SET status = 'expirado' WHERE id = ?").run(numId);

  const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(pagamento.pedido_id);
  if (pedido && pedido.status === 'processando_pagamento') {
    db.prepare("UPDATE pedidos SET status = 'aguardando_pagamento' WHERE id = ?").run(pedido.id);
  }
}

function criarPagamentoPix(req, res) {
  const usuarioId = req.user.id;
  const pedidoId = req.body?.pedido_id ?? req.body?.pedidoId;

  if (!pedidoId || typeof pedidoId !== 'string') {
    return res.status(400).json({ erro: 'pedido_id é obrigatório' });
  }

  const pedidoNumId = parseInt(pedidoId.replace('PED-', ''), 10);
  if (isNaN(pedidoNumId)) {
    return res.status(404).json({ erro: `Pedido '${pedidoId}' não encontrado` });
  }

  const pedidoRow = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(pedidoNumId);
  if (!pedidoRow) {
    return res.status(404).json({ erro: `Pedido '${pedidoId}' não encontrado` });
  }

  const pedido = reconstruirPedido(pedidoRow);

  if (pedido.usuarioId !== usuarioId) {
    return res.status(403).json({ erro: 'Este pedido pertence a outro usuário' });
  }

  if (pedido.status !== 'aguardando_pagamento') {
    return res.status(409).json({ erro: `Pedido não está aguardando pagamento (status atual: ${pedido.status})` });
  }

  const pendentes = db.prepare('SELECT * FROM pagamentos WHERE pedido_id = ? AND status = ?').all(pedidoNumId, 'pendente');
  if (pendentes.length > 0) {
    return res.status(409).json({ erro: 'Já existe um pagamento PIX pendente para este pedido' });
  }

  const cobranca = criarCobrancaPix(pedido);

  const agora = Date.now();
  const expiraEm = new Date(agora + EXPIRACAO_MS).toISOString();
  const criadoEm = new Date(agora).toISOString();

  const info = db.prepare(`
    INSERT INTO pagamentos (pedido_id, metodo, status, valor, gatewayId, qrCodeUrl, pixCopiaECola, criadoEm, expiraEm)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(pedidoNumId, 'pix', 'pendente', cobranca.valor, cobranca.gatewayId, cobranca.qrCodeUrl, cobranca.pixCopiaECola, criadoEm, expiraEm);

  const pagamentoId = formatPixId(info.lastInsertRowid);

  db.prepare("UPDATE pedidos SET status = 'processando_pagamento' WHERE id = ?").run(pedidoNumId);

  const timer = setTimeout(() => expirarPagamento(pagamentoId), EXPIRACAO_MS);
  if (typeof timer.unref === 'function') timer.unref();

  const pagRow = db.prepare('SELECT * FROM pagamentos WHERE id = ?').get(info.lastInsertRowid);
  const pagamento = reconstruirPagamento(pagRow);

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
  const usuarioId = req.user.id;
  const { id } = req.params;

  const numId = parseInt(id.replace('PIX-', ''), 10);
  if (isNaN(numId)) {
    return res.status(404).json({ erro: `Pagamento '${id}' não encontrado` });
  }

  const pagRow = db.prepare('SELECT * FROM pagamentos WHERE id = ?').get(numId);
  if (!pagRow) {
    return res.status(404).json({ erro: `Pagamento '${id}' não encontrado` });
  }

  const pagamento = reconstruirPagamento(pagRow);
  const pedidoRow = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(pagRow.pedido_id);
  const pedido = pedidoRow ? reconstruirPedido(pedidoRow) : null;

  if (!pedido || pedido.usuarioId !== usuarioId) {
    return res.status(403).json({ erro: 'Este pagamento pertence a outro usuário' });
  }

  if (pagamento.status === 'pendente' && Date.now() > new Date(pagamento.expiraEm).getTime()) {
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
