
const produtos = require('../produtos');

const carrinho = require('../data/data');

function getCarrinhoFormatado() {

  const subtotal = carrinho.itens.reduce((acc, item) => {

    const precoComDesconto =
      item.preco * (1 - item.desconto / 100);

    return acc + precoComDesconto * item.quantidade;

  }, 0);

  return {

    itens: carrinho.itens,

    totalItens: carrinho.itens.reduce(
      (acc, item) => acc + item.quantidade,
      0
    ),

    subtotal: parseFloat(subtotal.toFixed(2))
  };
}

// RF-07 · Adicionar item ao carrinho
function adicionarItem(req, res) {
  const { produtoId, quantidade } = req.body;

  if (!produtoId || !quantidade) {
    return res.status(400).json({
      erro: 'produtoId e quantidade são obrigatórios'
    });
  }

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    return res.status(400).json({
      erro: 'quantidade deve ser um inteiro positivo'
    });
  }

  const produto = produtos.find(
    p => p.id === produtoId && p.ativo
  );

  if (!produto) {
    return res.status(404).json({
      erro: 'Produto não encontrado'
    });
  }

  const itemExistente = carrinho.itens.find(
    i => i.produtoId === produtoId
  );

  const qtdAtual = itemExistente
    ? itemExistente.quantidade
    : 0;

  if (qtdAtual + quantidade > produto.estoque) {
    return res.status(409).json({
      erro: 'Quantidade solicitada excede o estoque disponível'
    });
  }

  if (itemExistente) {
    itemExistente.quantidade += quantidade;
  } else {
    carrinho.itens.push({
      itemId: carrinho._proximoId++,
      produtoId: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      desconto: produto.desconto,
      quantidade
    });
  }

  return res.status(201).json(
    getCarrinhoFormatado()
  );
}

// RF-08 · Visualizar carrinho
function visualizarCarrinho(req, res) {
  res.json(getCarrinhoFormatado());
}

// RF-08 · Atualizar quantidade
function atualizarItem(req, res) {
  const itemId = parseInt(req.params.itemId);

  const { quantidade } = req.body;

  if (
    quantidade === undefined ||
    !Number.isInteger(quantidade) ||
    quantidade < 0
  ) {
    return res.status(400).json({
      erro: 'quantidade deve ser um inteiro maior ou igual a 0'
    });
  }

  const index = carrinho.itens.findIndex(
    i => i.itemId === itemId
  );

  if (index === -1) {
    return res.status(404).json({
      erro: 'Item não encontrado no carrinho'
    });
  }

  if (quantidade === 0) {
    carrinho.itens.splice(index, 1);

    return res.json(
      getCarrinhoFormatado()
    );
  }

  const item = carrinho.itens[index];

  const produto = produtos.find(
    p => p.id === item.produtoId
  );

  if (quantidade > produto.estoque) {
    return res.status(409).json({
      erro: 'Quantidade solicitada excede o estoque disponível'
    });
  }

  item.quantidade = quantidade;

  return res.json(
    getCarrinhoFormatado()
  );
}

// RF-08 · Remover item
function removerItem(req, res) {
  const itemId = parseInt(req.params.itemId);

  const index = carrinho.itens.findIndex(
    i => i.itemId === itemId
  );

  if (index === -1) {
    return res.status(404).json({
      erro: 'Item não encontrado no carrinho'
    });
  }

  carrinho.itens.splice(index, 1);

  return res.status(204).send();
}

module.exports = {
  adicionarItem,
  visualizarCarrinho,
  atualizarItem,
  removerItem
};