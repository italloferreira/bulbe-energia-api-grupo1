const db = require('../data/db');

function validarCupom(req, res) {
  const usuarioId = req.user.id;
  const { codigo, subtotal } = req.body;

  if (!codigo || typeof codigo !== 'string' || codigo.trim() === '') {
    return res.status(400).json({ erro: 'codigo é obrigatório' });
  }

  if (subtotal === undefined || typeof subtotal !== 'number' || subtotal < 0) {
    return res.status(400).json({ erro: 'subtotal é obrigatório e deve ser um número positivo' });
  }

  const codigoNormalizado = codigo.trim().toUpperCase();

  const cupom = db.prepare('SELECT * FROM cupons WHERE codigo = ?').get(codigoNormalizado);

  if (!cupom || !cupom.ativo) {
    return res.status(400).json({ erro: 'Cupom inválido ou inexistente' });
  }

  const agora = new Date();
  const inicio = new Date(`${cupom.data_inicio}T00:00:00.000Z`);
  const fim = new Date(`${cupom.data_fim}T23:59:59.999Z`);

  if (agora < inicio) {
    return res.status(400).json({ erro: 'Cupom ainda não está vigente' });
  }

  if (agora > fim) {
    return res.status(400).json({ erro: 'Cupom expirado' });
  }

  if (subtotal < cupom.valor_minimo) {
    return res.status(400).json({
      erro: `Valor mínimo para este cupom é R$ ${cupom.valor_minimo.toFixed(2)}`
    });
  }

  if (cupom.total_usado >= cupom.limite_uso_global) {
    return res.status(400).json({ erro: 'Cupom esgotado' });
  }

  const usoRow = db.prepare('SELECT quantidade_usos FROM cupons_usuarios WHERE cupom_codigo = ? AND usuario_id = ?').get(codigoNormalizado, usuarioId);
  const usosDoUsuario = usoRow ? usoRow.quantidade_usos : 0;

  if (usosDoUsuario >= cupom.limite_uso_por_usuario) {
    return res.status(400).json({ erro: 'Você já utilizou este cupom o número máximo de vezes permitido' });
  }

  let descontoCalculado = 0;
  let freteGratis = false;

  if (cupom.tipo === 'percentual') {
    descontoCalculado = parseFloat(((subtotal * cupom.valor) / 100).toFixed(2));
  } else if (cupom.tipo === 'fixo') {
    descontoCalculado = parseFloat(Math.min(cupom.valor, subtotal).toFixed(2));
  } else if (cupom.tipo === 'frete_gratis') {
    freteGratis = true;
  }

  const totalComDesconto = parseFloat((subtotal - descontoCalculado).toFixed(2));

  return res.json({
    valido: true,
    codigo: cupom.codigo,
    tipo: cupom.tipo,
    valor: cupom.valor,
    descontoCalculado,
    freteGratis,
    totalComDesconto
  });
}

module.exports = { validarCupom };
