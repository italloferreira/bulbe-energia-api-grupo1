const crypto = require('crypto');
const pedidos = require('../data/pedidos');
const pagamentos = require('../data/pagamentos');

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'webhook-secreto-dev';

function assinaturaValida(rawBody, assinaturaRecebida) {
  if (!assinaturaRecebida || typeof assinaturaRecebida !== 'string') {
    return false;
  }

  const esperada = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  const a = Buffer.from(esperada, 'utf8');
  const b = Buffer.from(assinaturaRecebida, 'utf8');

  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}

function receberWebhookPagamento(req, res) {
  try {
    const rawBody = req.rawBody || '';
    const assinatura = req.headers['x-webhook-signature'];

    if (!assinaturaValida(rawBody, assinatura)) {
      return res.status(401).json({
        erro: 'Assinatura do webhook inválida'
      });
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return res.status(400).json({
        erro: 'Payload inválido: JSON malformado'
      });
    }

    const { evento, gatewayId, status } = payload;

    if (!gatewayId || typeof gatewayId !== 'string') {
      return res.status(400).json({
        erro: 'gatewayId é obrigatório no payload'
      });
    }

    const pagamento = pagamentos.lista.find(p => p.gatewayId === gatewayId);
    if (!pagamento) {
      return res.status(404).json({
        erro: `Pagamento com gatewayId '${gatewayId}' não encontrado`
      });
    }

    const confirmado =
      evento === 'pagamento.confirmado' || status === 'pago';

    if (!confirmado) {
      return res.status(200).json({
        recebido: true,
        acao: 'nenhuma',
        motivo: 'evento não representa confirmação de pagamento'
      });
    }

    if (pagamento.status === 'pago') {
      return res.status(200).json({
        recebido: true,
        acao: 'nenhuma',
        motivo: 'pagamento já estava confirmado (idempotente)'
      });
    }

    pagamento.status = 'pago';
    pagamento.pagoEm = new Date().toISOString();

    const pedido = pedidos.lista.find(p => p.id === pagamento.pedidoId);
    if (pedido) {
      pedido.status = 'pago';
    }

    return res.status(200).json({
      recebido: true,
      acao: 'pedido_atualizado',
      pedidoId: pagamento.pedidoId,
      novoStatus: 'pago'
    });
  } catch (erro) {
    return res.status(500).json({
      erro: 'Falha ao processar webhook'
    });
  }
}

module.exports = { receberWebhookPagamento };