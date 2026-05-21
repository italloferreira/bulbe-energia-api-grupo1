const produtos = require('../produtos');
const carrinho = require('../data/data');
const pedidos = require('../data/pedidos');

const METODOS_PAGAMENTO = ['pix', 'cartao', 'boleto'];

const TIPOS_FRETE = ['padrao', 'expressa'];

const STATUS_VALIDOS = [
  'aguardando_pagamento',
  'pago',
  'enviado',
  'entregue',
  'cancelado'
];

const CUPONS = {
  BULBE10: { tipo: 'percentual', valor: 10 },
  BULBE20: { tipo: 'percentual', valor: 20 },
  FRETEGRATIS: { tipo: 'frete_gratis' }
};

function validarEndereco(endereco) {
  if (!endereco || typeof endereco !== 'object' || Array.isArray(endereco)) {
    return 'enderecoEntrega é obrigatório';
  }

  const obrigatorios = [
    'cep',
    'logradouro',
    'numero',
    'bairro',
    'cidade',
    'estado'
  ];

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

function reservarEstoque(itensPedido) {
  const reservados = [];

  for (const { produto, quantidade } of itensPedido) {
    if (produto.estoque < quantidade) {
      for (const r of reservados) {
        r.produto.estoque += r.quantidade;
      }
      return { ok: false, produto, quantidade };
    }

    produto.estoque -= quantidade;
    reservados.push({ produto, quantidade });
  }

  return { ok: true };
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
  // Autorização: usuário vem do token JWT, não do body
  const usuarioId = req.user.id;

  const {
    itens,
    enderecoEntrega,
    frete,
    cupom,
    metodoPagamento
  } = req.body || {};

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({
      erro: 'itens deve ser uma lista com ao menos um item'
    });
  }

  const erroEndereco = validarEndereco(enderecoEntrega);
  if (erroEndereco) {
    return res.status(400).json({ erro: erroEndereco });
  }

  if (
    !frete ||
    !TIPOS_FRETE.includes(frete.tipo) ||
    typeof frete.valor !== 'number' ||
    frete.valor < 0
  ) {
    return res.status(400).json({
      erro: 'frete deve conter tipo (padrao ou expressa) e valor numérico'
    });
  }

  if (!metodoPagamento || !METODOS_PAGAMENTO.includes(metodoPagamento)) {
    return res.status(400).json({
      erro: `metodoPagamento inválido. Valores aceitos: ${METODOS_PAGAMENTO.join(', ')}`
    });
  }

  const itensPedido = [];
  for (const item of itens) {
    const produtoId = item?.produtoId ?? item?.id;
    const quantidade = item?.quantidade;

    if (!Number.isInteger(produtoId) || produtoId <= 0) {
      return res.status(400).json({
        erro: 'cada item deve ter um produtoId inteiro positivo'
      });
    }
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      return res.status(400).json({
        erro: 'cada item deve ter uma quantidade inteira positiva'
      });
    }

    const produto = produtos.find(p => p.id === produtoId && p.ativo);
    if (!produto) {
      return res.status(404).json({
        erro: `Produto ${produtoId} não encontrado`
      });
    }

    itensPedido.push({ produto, quantidade });
  }

  let cupomAplicado = null;
  if (cupom !== undefined && cupom !== null && String(cupom).trim() !== '') {
    const codigo = String(cupom).trim().toUpperCase();
    const dados = CUPONS[codigo];
    if (!dados) {
      return res.status(400).json({ erro: `Cupom '${cupom}' inválido` });
    }
    cupomAplicado = { codigo, ...dados };
  }

  const reserva = reservarEstoque(itensPedido);
  if (!reserva.ok) {
    return res.status(409).json({
      erro:
        `Estoque insuficiente para o produto '${reserva.produto.nome}'. ` +
        `Disponível: ${reserva.produto.estoque}, solicitado: ${reserva.quantidade}.`
    });
  }

  let subtotalProdutos = 0;
  const itensFormatados = itensPedido.map(({ produto, quantidade }) => {
    const precoUnitario = Number(
      (produto.preco * (1 - (produto.desconto || 0) / 100)).toFixed(2)
    );
    const subtotal = Number((precoUnitario * quantidade).toFixed(2));
    subtotalProdutos += subtotal;

    return {
      produtoId: produto.id,
      nome: produto.nome,
      quantidade,
      precoUnitario,
      subtotal
    };
  });
  subtotalProdutos = Number(subtotalProdutos.toFixed(2));

  let valorFrete = frete.valor;
  let descontoCupom = 0;
  if (cupomAplicado) {
    if (cupomAplicado.tipo === 'percentual') {
      descontoCupom = Number(
        ((subtotalProdutos * cupomAplicado.valor) / 100).toFixed(2)
      );
    } else if (cupomAplicado.tipo === 'frete_gratis') {
      valorFrete = 0;
    }
  }

  const total = Number(
    (subtotalProdutos - descontoCupom + valorFrete).toFixed(2)
  );

  const id = `PED-${String(pedidos._proximoId++).padStart(5, '0')}`;
  const pedido = {
    id,
    usuarioId,
    status: 'aguardando_pagamento',
    criadoEm: new Date().toISOString(),
    itens: itensFormatados,
    enderecoEntrega,
    frete: { tipo: frete.tipo, valor: valorFrete },
    cupom: cupomAplicado ? cupomAplicado.codigo : null,
    metodoPagamento,
    resumo: {
      subtotalProdutos,
      descontoCupom,
      valorFrete,
      total
    }
  };
  pedidos.lista.push(pedido);

  carrinho.itens.length = 0;

  return res.status(201).json(pedido);
}

function listarPedidos(req, res) {
  // Autorização: usuário vem do token JWT, não da query
  const usuarioId = req.user.id;

  const { status, data_inicio, data_fim } = req.query;

  if (status !== undefined && !STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({
      erro: `status inválido. Valores aceitos: ${STATUS_VALIDOS.join(', ')}`
    });
  }

  let inicioMs = null;
  let fimMs = null;

  if (data_inicio !== undefined) {
    inicioMs = parseDataInicio(data_inicio);
    if (inicioMs === null) {
      return res.status(400).json({
        erro: 'data_inicio inválida. Use o formato AAAA-MM-DD.'
      });
    }
  }

  if (data_fim !== undefined) {
    fimMs = parseDataFim(data_fim);
    if (fimMs === null) {
      return res.status(400).json({
        erro: 'data_fim inválida. Use o formato AAAA-MM-DD.'
      });
    }
  }

  if (inicioMs !== null && fimMs !== null && inicioMs > fimMs) {
    return res.status(400).json({
      erro: 'data_inicio não pode ser posterior a data_fim'
    });
  }

  const pagina = req.query.pagina === undefined ? 1 : Number(req.query.pagina);
  const limite = req.query.limite === undefined ? 10 : Number(req.query.limite);

  if (!Number.isInteger(pagina) || pagina <= 0) {
    return res.status(400).json({
      erro: 'pagina deve ser um inteiro positivo'
    });
  }
  if (!Number.isInteger(limite) || limite <= 0) {
    return res.status(400).json({
      erro: 'limite deve ser um inteiro positivo'
    });
  }

  let lista = pedidos.lista.filter(p => p.usuarioId === usuarioId);

  if (status !== undefined) {
    lista = lista.filter(p => p.status === status);
  }
  if (inicioMs !== null) {
    lista = lista.filter(p => new Date(p.criadoEm).getTime() >= inicioMs);
  }
  if (fimMs !== null) {
    lista = lista.filter(p => new Date(p.criadoEm).getTime() <= fimMs);
  }

  lista.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

  const total = lista.length;
  const totalPaginas = Math.ceil(total / limite);
  const inicio = (pagina - 1) * limite;
  const paginaAtual = lista.slice(inicio, inicio + limite);

  const resultado = paginaAtual.map(p => ({
    id: p.id,
    data: p.criadoEm,
    status: p.status,
    valorTotal: p.resumo.total,
    quantidadeItens: p.itens.reduce((acc, i) => acc + i.quantidade, 0)
  }));

  return res.json({
    paginacao: {
      paginaAtual: pagina,
      limite,
      total,
      totalPaginas
    },
    pedidos: resultado
  });
}

function obterPedido(req, res) {
  // Autorização: usuário vem do token JWT, não da query
  const usuarioId = req.user.id;
  const { id } = req.params;

  const pedido = pedidos.lista.find(p => p.id === id);
  if (!pedido) {
    return res.status(404).json({ erro: `Pedido '${id}' não encontrado` });
  }

  if (pedido.usuarioId !== usuarioId) {
    return res.status(403).json({
      erro: 'Este pedido pertence a outro usuário'
    });
  }

  return res.json({
    ...pedido,
    codigoRastreio: pedido.codigoRastreio ?? null
  });
}

function cancelarPedido(req, res) {
  // Autorização: usuário vem do token JWT, não da query
  const usuarioId = req.user.id;
  const { id } = req.params;

  // Buscar pedido
  const pedido = pedidos.lista.find(p => p.id === id);
  if (!pedido) {
    return res.status(404).json({ erro: `Pedido '${id}' não encontrado` });
  }

  // Verificar se o pedido pertence ao usuário
  if (pedido.usuarioId !== usuarioId) {
    return res.status(403).json({
      erro: 'Este pedido pertence a outro usuário'
    });
  }

  // Verificar se o pedido pode ser cancelado
  const STATUS_CANCELAVEIS = ['aguardando_pagamento', 'pago'];
  if (!STATUS_CANCELAVEIS.includes(pedido.status)) {
    return res.status(409).json({
      erro: `Pedido não pode ser cancelado. Status atual: '${pedido.status}'. Apenas pedidos com status 'aguardando_pagamento' ou 'pago' podem ser cancelados.`
    });
  }

  // Restaurar o estoque dos itens do pedido
  for (const item of pedido.itens) {
    const produto = produtos.find(p => p.id === item.produtoId);
    if (produto) {
      produto.estoque += item.quantidade;
    }
  }

  // Se o pedido foi pago, processar reembolso
  let reembolsoProcessado = false;
  if (pedido.status === 'pago') {
    reembolsoProcessado = processarReembolsoGateway(pedido);
  }

  // Atualizar status do pedido para cancelado
  const dataCancel = new Date().toISOString();
  pedido.status = 'cancelado';
  pedido.canceladoEm = dataCancel;
  if (reembolsoProcessado) {
    pedido.reembolsoProcessado = true;
    pedido.dataReembolso = dataCancel;
  }

  return res.json({
    mensagem: 'Pedido cancelado com sucesso',
    pedido: {
      id: pedido.id,
      status: pedido.status,
      canceladoEm: pedido.canceladoEm,
      reembolsoProcessado: pedido.reembolsoProcessado || false,
      dataReembolso: pedido.dataReembolso || null,
      resumo: {
        subtotalProdutos: pedido.resumo.subtotalProdutos,
        descontoCupom: pedido.resumo.descontoCupom,
        valorFrete: pedido.resumo.valorFrete,
        total: pedido.resumo.total
      },
      itens: pedido.itens.map(item => ({
        produtoId: item.produtoId,
        nome: item.nome,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        subtotal: item.subtotal
      }))
    }
  });
}

function processarReembolsoGateway(pedido) {
  try {
    console.log(`[GATEWAY] Processando reembolso para pedido ${pedido.id}`);
    console.log(`[GATEWAY] Valor: R$ ${pedido.resumo.total.toFixed(2)}`);
    console.log(`[GATEWAY] Método de pagamento: ${pedido.metodoPagamento}`);
    return true;
  } catch (erro) {
    console.error('[GATEWAY] Erro ao processar reembolso:', erro.message);
    return false;
  }
}

module.exports = { criarPedido, listarPedidos, obterPedido, cancelarPedido };