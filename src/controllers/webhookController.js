const crypto = require('crypto');
const db = require('../data/db');

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'webhook-secreto-dev';

function formatPedidoId(id) {
  return `PED-${String(id).padStart(5, '0')}`;
}

function assinaturaValida(rawBody, assinaturaRecebida) {
  if (!assinaturaRecebida || typeof assinaturaRecebida !== 'string') return false;

  const esperada = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  const a = Buffer.from(esperada, 'utf8');
  const b = Buffer.from(assinaturaRecebida, 'utf8');

  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function receberWebhookPagamento(req, res) {
  try {
    const rawBody = req.rawBody || '';
    const assinatura = req.headers['x-webhook-signature'];

    if (!assinaturaValida(rawBody, assinatura)) {
      return res.status(401).json({ erro: 'Assinatura do webhook inválida' });
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return res.status(400).json({ erro: 'Payload inválido: JSON malformado' });
    }

    const { evento, gatewayId, status } = payload;

    if (!gatewayId || typeof gatewayId !== 'string') {
      return res.status(400).json({ erro: 'gatewayId é obrigatório no payload' });
    }

    const pagRow = db.prepare('SELECT * FROM pagamentos WHERE gatewayId = ?').get(gatewayId);
    if (!pagRow) {
      return res.status(404).json({ erro: `Pagamento com gatewayId '${gatewayId}' não encontrado` });
    }

    const confirmado = evento === 'pagamento.confirmado' || status === 'pago';

    if (!confirmado) {
      return res.status(200).json({ recebido: true, acao: 'nenhuma', motivo: 'evento não representa confirmação de pagamento' });
    }

    if (pagRow.status === 'pago') {
      return res.status(200).json({ recebido: true, acao: 'nenhuma', motivo: 'pagamento já estava confirmado (idempotente)' });
    }

    const pagoEm = new Date().toISOString();
    db.prepare('UPDATE pagamentos SET status = ?, pagoEm = ? WHERE id = ?').run('pago', pagoEm, pagRow.id);

    const pedidoRow = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(pagRow.pedido_id);
    if (pedidoRow) {
      db.prepare("UPDATE pedidos SET status = 'pago' WHERE id = ?").run(pedidoRow.id);
    }

    return res.status(200).json({
      recebido: true,
      acao: 'pedido_atualizado',
      pedidoId: formatPedidoId(pagRow.pedido_id),
      novoStatus: 'pago'
    });
  } catch (erro) {
    return res.status(500).json({ erro: 'Falha ao processar webhook' });
  }
}

module.exports = { receberWebhookPagamento };
