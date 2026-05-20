const cupons = require('../data/cupons');
 
// POST /api/cupons/validar
function validarCupom(req, res) {
  const { codigo, subtotal, usuarioId } = req.body;
 
  // Validação dos campos obrigatórios
  if (!codigo || typeof codigo !== 'string' || codigo.trim() === '') {
    return res.status(400).json({
      erro: 'codigo é obrigatório'
    });
  }
 
  if (subtotal === undefined || typeof subtotal !== 'number' || subtotal < 0) {
    return res.status(400).json({
      erro: 'subtotal é obrigatório e deve ser um número positivo'
    });
  }
 
  if (!usuarioId) {
    return res.status(400).json({
      erro: 'usuarioId é obrigatório'
    });
  }
 
  const codigoNormalizado = codigo.trim().toUpperCase();
 
  // Verifica existência
  const cupom = cupons.find(
    c => c.codigo === codigoNormalizado
  );
 
  if (!cupom || !cupom.ativo) {
    return res.status(400).json({
      erro: 'Cupom inválido ou inexistente'
    });
  }
 
  // Verifica vigência
  const agora = new Date();
  const inicio = new Date(`${cupom.dataInicio}T00:00:00.000Z`);
  const fim = new Date(`${cupom.dataFim}T23:59:59.999Z`);
 
  if (agora < inicio) {
    return res.status(400).json({
      erro: 'Cupom ainda não está vigente'
    });
  }
 
  if (agora > fim) {
    return res.status(400).json({
      erro: 'Cupom expirado'
    });
  }
 
  // Verifica valor mínimo
  if (subtotal < cupom.valorMinimo) {
    return res.status(400).json({
      erro: `Valor mínimo para este cupom é R$ ${cupom.valorMinimo.toFixed(2)}`
    });
  }
 
  // Verifica limite global
  if (cupom.totalUsado >= cupom.limiteUsoGlobal) {
    return res.status(400).json({
      erro: 'Cupom esgotado'
    });
  }
 
  // Verifica limite por usuário
  const usosDoUsuario = cupom.usosPorUsuario[usuarioId] || 0;
 
  if (usosDoUsuario >= cupom.limiteUsoPorUsuario) {
    return res.status(400).json({
      erro: 'Você já utilizou este cupom o número máximo de vezes permitido'
    });
  }
 
  // Calcula desconto
  let descontoCalculado = 0;
  let freteGratis = false;
 
  if (cupom.tipo === 'percentual') {
    descontoCalculado = parseFloat(
      ((subtotal * cupom.valor) / 100).toFixed(2)
    );
  } else if (cupom.tipo === 'fixo') {
    descontoCalculado = parseFloat(
      Math.min(cupom.valor, subtotal).toFixed(2)
    );
  } else if (cupom.tipo === 'frete_gratis') {
    freteGratis = true;
    descontoCalculado = 0;
  }
 
  const totalComDesconto = parseFloat(
    (subtotal - descontoCalculado).toFixed(2)
  );
 
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