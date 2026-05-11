const produtos = require('../produtos');

const carrinho = require('../data/data');

function getCarrinhoFormatado() {

  const itensFormatados = carrinho.itens.map(item => {

    const produtoAtual = produtos.find(
      p => p.id === item.produtoId
    );

    if (!produtoAtual || !produtoAtual.ativo) {

      return {
        itemId: item.itemId,
        produtoId: item.produtoId,
        nome: item.nome,
        quantidade: item.quantidade,
        indisponivel: true
      };
    }

    const precoAtual = produtoAtual.preco;

    const precoComDesconto =
      precoAtual * (1 - produtoAtual.desconto / 100);

    return {
      itemId: item.itemId,

      produtoId: item.produtoId,

      nome: produtoAtual.nome,

      preco: precoAtual,

      desconto: produtoAtual.desconto,

      quantidade: item.quantidade,

      subtotal: parseFloat(
        (precoComDesconto * item.quantidade).toFixed(2)
      ),

      indisponivel: false
    };
  });

  const subtotal = itensFormatados.reduce((acc, item) => {

    if (item.indisponivel) {
      return acc;
    }

    return acc + item.subtotal;

  }, 0);

  return {

    itens: itensFormatados,

    quantidadeItens: itensFormatados.reduce(
      (acc, item) => acc + item.quantidade,
      0
    ),

    subtotal: parseFloat(subtotal.toFixed(2)),

    totalEstimado: parseFloat(subtotal.toFixed(2))
  };
}

// RF-07 · Adicionar item ao carrinho
function adicionarItem(req, res) {

  console.log(req.body);

  const { produtoId, quantidade, usuarioId } = req.body;

  if (!produtoId || !quantidade || !usuarioId) {

    return res.status(400).json({
      erro: 'produtoId, quantidade e usuarioId são obrigatórios'
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
    i =>
      i.produtoId === produtoId &&
      i.usuarioId === usuarioId
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

      usuarioId,

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

  res.json(
    getCarrinhoFormatado()
  );
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

  const usuarioId = req.body?.usuarioId;
  const index = carrinho.itens.findIndex(
    i => i.itemId === itemId
  );

  if (index === -1) {

    return res.status(404).json({
      erro: 'Item não encontrado no carrinho'
    });
  }

  const item = carrinho.itens[index];

  if (item.usuarioId !== usuarioId) {

    return res.status(403).json({
      erro: 'Forbidden'
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