// src/controllers/pedidoController.js
// RF-13 · Finalização do pedido de compra
//
// História: como cliente, quero finalizar a compra e gerar um pedido,
// para poder pagar e receber meus produtos.

const produtos = require('../produtos');
const carrinho = require('../data/data');
const pedidos = require('../data/pedidos');

// Métodos de pagamento aceitos.
const METODOS_PAGAMENTO = ['pix', 'cartao', 'boleto'];

// Tipos de frete aceitos (alinhados ao freteController · RF-11).
const TIPOS_FRETE = ['padrao', 'expressa'];

// Cupons promocionais disponíveis (tabela de demonstração).
// Quando a RF-10 de cupons for implementada, esta tabela vira a fonte real.
const CUPONS = {
  BULBE10: { tipo: 'percentual', valor: 10 },
  BULBE20: { tipo: 'percentual', valor: 20 },
  FRETEGRATIS: { tipo: 'frete_gratis' }
};

// --- Helpers -----------------------------------------------------------------

// Valida o endereço de entrega. Retorna a mensagem de erro, ou null se ok.
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

// TRANSAÇÃO · reserva (decrementa) o estoque de todos os itens.
// Se algum item não tiver estoque suficiente, desfaz as reservas já
// aplicadas e devolve o item problemático.
function reservarEstoque(itensPedido) {
  const reservados = [];

  for (const { produto, quantidade } of itensPedido) {
    if (produto.estoque < quantidade) {
      // Rollback: devolve ao estoque tudo o que já havia sido reservado.
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

// --- Controller --------------------------------------------------------------

// RF-13 · POST /api/pedidos
function criarPedido(req, res) {
  const {
    itens,
    enderecoEntrega,
    frete,
    cupom,
    metodoPagamento
  } = req.body || {};

  // 1. Itens.
  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({
      erro: 'itens deve ser uma lista com ao menos um item'
    });
  }

  // 2. Endereço de entrega.
  const erroEndereco = validarEndereco(enderecoEntrega);
  if (erroEndereco) {
    return res.status(400).json({ erro: erroEndereco });
  }

  // 3. Opção de frete escolhida.
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

  // 4. Método de pagamento.
  if (!metodoPagamento || !METODOS_PAGAMENTO.includes(metodoPagamento)) {
    return res.status(400).json({
      erro: `metodoPagamento inválido. Valores aceitos: ${METODOS_PAGAMENTO.join(', ')}`
    });
  }

  // 5. Resolve o produto de cada item do carrinho.
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

  // 6. Cupom (opcional).
  let cupomAplicado = null;
  if (cupom !== undefined && cupom !== null && String(cupom).trim() !== '') {
    const codigo = String(cupom).trim().toUpperCase();
    const dados = CUPONS[codigo];
    if (!dados) {
      return res.status(400).json({ erro: `Cupom '${cupom}' inválido` });
    }
    cupomAplicado = { codigo, ...dados };
  }

  // 7. TRANSAÇÃO · reserva o estoque (decrementa) com rollback em caso de falha.
  const reserva = reservarEstoque(itensPedido);
  if (!reserva.ok) {
    return res.status(409).json({
      erro:
        `Estoque insuficiente para o produto '${reserva.produto.nome}'. ` +
        `Disponível: ${reserva.produto.estoque}, solicitado: ${reserva.quantidade}.`
    });
  }

  // 8. Cálculo dos totais.
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

  // 9. Cria o pedido com ID único e status inicial.
  const id = `PED-${String(pedidos._proximoId++).padStart(5, '0')}`;
  const pedido = {
    id,
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

  // 10. Esvazia o carrinho após o sucesso.
  carrinho.itens.length = 0;

  return res.status(201).json(pedido);
}

module.exports = { criarPedido };
