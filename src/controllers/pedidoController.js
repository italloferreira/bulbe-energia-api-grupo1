const db = require('../data/db');

const METODOS_PAGAMENTO = ['pix', 'cartao', 'boleto'];
const TIPOS_FRETE = ['padrao', 'expressa'];
const STATUS_VALIDOS = ['aguardando_pagamento', 'pago', 'enviado', 'entregue', 'cancelado'];

function formatPedidoId(id) {
  return `PED-${String(id).padStart(5, '0')}`;
}

function reconstruirPedido(row) {
  if (!row) return null;
  const pedido = {
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
  return pedido;
}

function validarEndereco(endereco) {
  if (!endereco || typeof endereco !== 'object' || Array.isArray(endereco)) {
    return 'enderecoEntrega é obrigatório';
  }

  const obrigatorios = ['cep', 'logradouro', 'numero', 'bairro', 'cidade', 'estado'];
  for (const campo of obrigatorios) {
    const valor = endereco[campo];
    if (valor === undefined || valor === null || String(valor).trim() === '') {
      return `enderecoEntrega.${campo} é obrigatório`;
    }
  }

  const cepDigitos = String(endereco.cep).replace(/\D/g, '');
  if (!/^\d{8}$/.test(cepDigitos) || cepDigitos === '00000000') {
    return 'enderecoEntrega.cep inválido. Use o formato 00000-000.';
  }

  return null;
}

function parseDataInicio(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const d = new Date(`${str}T00:00:00.000Z`);
  return isNaN(d.getTime()) ? null : d.getTime();
}

function parseDataFim(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const d = new Date(`${str}T23:59:59.999Z`);
  return isNaN(d.getTime()) ? null : d.getTime();
}

function criarPedido(req, res) {
  const usuarioId = req.user.id;
  const { itens, enderecoEntrega, frete, cupom, metodoPagamento } = req.body || {};

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: 'itens deve ser uma lista com ao menos um item' });
  }

  const erroEndereco = validarEndereco(enderecoEntrega);
  if (erroEndereco) {
    return res.status(400).json({ erro: erroEndereco });
  }

  if (!frete || !TIPOS_FRETE.includes(frete.tipo) || typeof frete.valor !== 'number' || frete.valor < 0) {
    return res.status(400).json({ erro: 'frete deve conter tipo (padrao ou expressa) e valor numérico' });
  }

  if (!metodoPagamento || !METODOS_PAGAMENTO.includes(metodoPagamento)) {
    return res.status(400).json({ erro: `metodoPagamento inválido. Valores aceitos: ${METODOS_PAGAMENTO.join(', ')}` });
  }

  const itensPedido = [];
  for (const item of itens) {
    const produtoId = item?.produtoId ?? item?.id;
    const quantidade = item?.quantidade;

    if (!Number.isInteger(produtoId) || produtoId <= 0) {
      return res.status(400).json({ erro: 'cada item deve ter um produtoId inteiro positivo' });
    }
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      return res.status(400).json({ erro: 'cada item deve ter uma quantidade inteira positiva' });
    }

    const produto = db.prepare('SELECT * FROM produtos WHERE id = ? AND ativo = 1').get(produtoId);
    if (!produto) {
      return res.status(404).json({ erro: `Produto ${produtoId} não encontrado` });
    }

    itensPedido.push({ produto, quantidade });
  }

  let cupomAplicado = null;
  if (cupom !== undefined && cupom !== null && String(cupom).trim() !== '') {
    const codigo = String(cupom).trim().toUpperCase();
    const dados = db.prepare('SELECT * FROM cupons WHERE codigo = ?').get(codigo);
    if (!dados || !dados.ativo) {
      return res.status(400).json({ erro: `Cupom '${cupom}' inválido` });
    }
    cupomAplicado = { codigo, tipo: dados.tipo, valor: dados.valor };
  }

  for (const { produto, quantidade } of itensPedido) {
    if (produto.estoque < quantidade) {
      return res.status(409).json({
        erro: `Estoque insuficiente para o produto '${produto.nome}'. Disponível: ${produto.estoque}, solicitado: ${quantidade}.`
      });
    }
  }

  let subtotalProdutos = 0;
  const itensFormatados = itensPedido.map(({ produto, quantidade }) => {
    const precoUnitario = Number((produto.preco * (1 - (produto.desconto || 0) / 100)).toFixed(2));
    const subtotal = Number((precoUnitario * quantidade).toFixed(2));
    subtotalProdutos += subtotal;
    return { produtoId: produto.id, nome: produto.nome, quantidade, precoUnitario, subtotal };
  });
  subtotalProdutos = Number(subtotalProdutos.toFixed(2));

  let valorFrete = frete.valor;
  let descontoCupom = 0;
  if (cupomAplicado) {
    if (cupomAplicado.tipo === 'percentual') {
      descontoCupom = Number(((subtotalProdutos * cupomAplicado.valor) / 100).toFixed(2));
    } else if (cupomAplicado.tipo === 'frete_gratis') {
      valorFrete = 0;
    }
  }

  const total = Number((subtotalProdutos - descontoCupom + valorFrete).toFixed(2));
  const criadoEm = new Date().toISOString();

  const resumo = { subtotalProdutos, descontoCupom, valorFrete, total };

  const pedidoId = db.transaction(() => {
    for (const { produto, quantidade } of itensPedido) {
      db.prepare('UPDATE produtos SET estoque = estoque - ? WHERE id = ?').run(quantidade, produto.id);
    }

    const info = db.prepare(`
      INSERT INTO pedidos (usuario_id, status, endereco, frete, frete_tipo, cupom_codigo, metodoPagamento, criadoEm, resumo, valor_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(usuarioId, 'aguardando_pagamento', JSON.stringify(enderecoEntrega), valorFrete, frete.tipo, cupomAplicado ? cupomAplicado.codigo : null, metodoPagamento, criadoEm, JSON.stringify(resumo), total);

    const novoPedidoId = info.lastInsertRowid;

    const insertItem = db.prepare('INSERT INTO pedidos_itens (pedido_id, produto_id, nome, preco, desconto, quantidade) VALUES (?, ?, ?, ?, ?, ?)');
    for (const item of itensFormatados) {
      insertItem.run(novoPedidoId, item.produtoId, item.nome, item.precoUnitario, 0, item.quantidade);
    }

    db.prepare('DELETE FROM carrinho_itens WHERE usuario_id = ?').run(usuarioId);

    return novoPedidoId;
  })();

  const id = formatPedidoId(pedidoId);

  return res.status(201).json({
    id, usuarioId, status: 'aguardando_pagamento', criadoEm,
    itens: itensFormatados, enderecoEntrega,
    frete: { tipo: frete.tipo, valor: valorFrete },
    cupom: cupomAplicado ? cupomAplicado.codigo : null, metodoPagamento,
    resumo
  });
}

function listarPedidos(req, res) {
  const usuarioId = req.user.id;
  const { status, data_inicio, data_fim } = req.query;

  if (status !== undefined && !STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ erro: `status inválido. Valores aceitos: ${STATUS_VALIDOS.join(', ')}` });
  }

  let inicioMs = null, fimMs = null;

  if (data_inicio !== undefined) {
    inicioMs = parseDataInicio(data_inicio);
    if (inicioMs === null) return res.status(400).json({ erro: 'data_inicio inválida. Use o formato AAAA-MM-DD.' });
  }
  if (data_fim !== undefined) {
    fimMs = parseDataFim(data_fim);
    if (fimMs === null) return res.status(400).json({ erro: 'data_fim inválida. Use o formato AAAA-MM-DD.' });
  }
  if (inicioMs !== null && fimMs !== null && inicioMs > fimMs) {
    return res.status(400).json({ erro: 'data_inicio não pode ser posterior a data_fim' });
  }

  const pagina = req.query.pagina === undefined ? 1 : Number(req.query.pagina);
  const limite = req.query.limite === undefined ? 10 : Number(req.query.limite);

  if (!Number.isInteger(pagina) || pagina <= 0) return res.status(400).json({ erro: 'pagina deve ser um inteiro positivo' });
  if (!Number.isInteger(limite) || limite <= 0) return res.status(400).json({ erro: 'limite deve ser um inteiro positivo' });

  let countSql = 'SELECT COUNT(*) as total FROM pedidos p WHERE p.usuario_id = ?';
  let listSql = `SELECT p.*, (SELECT COALESCE(SUM(quantidade), 0) FROM pedidos_itens WHERE pedido_id = p.id) as _quantidade_itens FROM pedidos p WHERE p.usuario_id = ?`;
  const params = [usuarioId];

  if (status !== undefined && status !== null) {
    countSql += ' AND p.status = ?';
    listSql += ' AND p.status = ?';
    params.push(status);
  }
  if (inicioMs !== null) {
    countSql += ' AND p.criadoEm >= ?';
    listSql += ' AND p.criadoEm >= ?';
    params.push(new Date(inicioMs).toISOString());
  }
  if (fimMs !== null) {
    countSql += ' AND p.criadoEm <= ?';
    listSql += ' AND p.criadoEm <= ?';
    params.push(new Date(fimMs).toISOString());
  }

  const total = db.prepare(countSql).get(...params).total;

  listSql += ' ORDER BY p.criadoEm DESC LIMIT ? OFFSET ?';
  const listParams = [...params, limite, (pagina - 1) * limite];
  const rows = db.prepare(listSql).all(...listParams);

  const totalPaginas = Math.ceil(total / limite);

  const resultado = rows.map(p => {
    const pedido = reconstruirPedido(p);
    return {
      id: pedido.id,
      data: pedido.criadoEm,
      status: pedido.status,
      valorTotal: pedido.resumo.total,
      quantidadeItens: p._quantidade_itens || 0
    };
  });

  return res.json({ paginacao: { paginaAtual: pagina, limite, total, totalPaginas }, pedidos: resultado });
}

function obterPedido(req, res) {
  const usuarioId = req.user.id;
  const { id } = req.params;

  const numId = parseInt(id.replace('PED-', ''), 10);
  if (isNaN(numId)) return res.status(404).json({ erro: `Pedido '${id}' não encontrado` });

  const row = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(numId);
  if (!row) return res.status(404).json({ erro: `Pedido '${id}' não encontrado` });

  const pedido = reconstruirPedido(row);
  if (pedido.usuarioId !== usuarioId) {
    return res.status(403).json({ erro: 'Este pedido pertence a outro usuário' });
  }

  const itens = db.prepare('SELECT * FROM pedidos_itens WHERE pedido_id = ?').all(numId);
  pedido.itens = itens.map(item => ({
    produtoId: item.produto_id,
    nome: item.nome,
    quantidade: item.quantidade,
    precoUnitario: item.preco,
    subtotal: Number((item.preco * item.quantidade).toFixed(2))
  }));

  return res.json({ ...pedido, codigoRastreio: pedido.codigoRastreio ?? null });
}

function cancelarPedido(req, res) {
  const usuarioId = req.user.id;
  const { id } = req.params;

  const numId = parseInt(id.replace('PED-', ''), 10);
  if (isNaN(numId)) return res.status(404).json({ erro: `Pedido '${id}' não encontrado` });

  const row = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(numId);
  if (!row) return res.status(404).json({ erro: `Pedido '${id}' não encontrado` });

  const pedido = reconstruirPedido(row);
  if (pedido.usuarioId !== usuarioId) {
    return res.status(403).json({ erro: 'Este pedido pertence a outro usuário' });
  }

  const STATUS_CANCELAVEIS = ['aguardando_pagamento', 'pago'];
  if (!STATUS_CANCELAVEIS.includes(pedido.status)) {
    return res.status(409).json({ erro: `Pedido não pode ser cancelado. Status atual: '${pedido.status}'. Apenas pedidos com status 'aguardando_pagamento' ou 'pago' podem ser cancelados.` });
  }

  const itens = db.prepare('SELECT * FROM pedidos_itens WHERE pedido_id = ?').all(numId);

  const dataCancel = new Date().toISOString();

  db.transaction(() => {
    for (const item of itens) {
      db.prepare('UPDATE produtos SET estoque = estoque + ? WHERE id = ?').run(item.quantidade, item.produto_id);
    }

    let reembolsoProcessado = false;
    if (pedido.status === 'pago') {
      console.log(`[GATEWAY] Processando reembolso para pedido ${pedido.id}`);
      console.log(`[GATEWAY] Valor: R$ ${pedido.resumo.total.toFixed(2)}`);
      console.log(`[GATEWAY] Método de pagamento: ${pedido.metodoPagamento}`);
      reembolsoProcessado = true;
    }

    db.prepare("UPDATE pedidos SET status = 'cancelado', canceladoEm = ?, reembolsoProcessado = ? WHERE id = ?").run(dataCancel, reembolsoProcessado ? '1' : '0', numId);

    return reembolsoProcessado;
  })();

  const pedidoAtualizado = reconstruirPedido(db.prepare('SELECT * FROM pedidos WHERE id = ?').get(numId));

  return res.json({
    mensagem: 'Pedido cancelado com sucesso',
    pedido: {
      id: pedidoAtualizado.id,
      status: 'cancelado',
      canceladoEm: dataCancel,
      reembolsoProcessado: pedidoAtualizado.reembolsoProcessado || false,
      dataReembolso: pedidoAtualizado.reembolsoProcessado ? dataCancel : null,
      resumo: pedidoAtualizado.resumo,
      itens: itens.map(item => ({
        produtoId: item.produto_id,
        nome: item.nome,
        quantidade: item.quantidade,
        precoUnitario: item.preco,
        subtotal: Number((item.preco * item.quantidade).toFixed(2))
      }))
    }
  });
}

module.exports = { criarPedido, listarPedidos, obterPedido, cancelarPedido };
