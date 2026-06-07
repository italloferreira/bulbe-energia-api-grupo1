const db = require('../data/db');

function getCarrinhoFormatado(usuarioId) {
  const itens = db.prepare('SELECT * FROM carrinho_itens WHERE usuario_id = ?').all(usuarioId);

  const itensFormatados = itens.map(item => {
    const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(item.produto_id);

    if (!produto || !produto.ativo) {
      return {
        itemId: item.item_id,
        produtoId: item.produto_id,
        nome: item.nome,
        quantidade: item.quantidade,
        indisponivel: true
      };
    }

    const precoAtual = produto.preco;
    const precoComDesconto = precoAtual * (1 - produto.desconto / 100);

    return {
      itemId: item.item_id,
      produtoId: item.produto_id,
      nome: produto.nome,
      preco: precoAtual,
      desconto: produto.desconto,
      quantidade: item.quantidade,
      subtotal: parseFloat((precoComDesconto * item.quantidade).toFixed(2)),
      indisponivel: false
    };
  });

  const subtotal = itensFormatados.reduce((acc, item) => {
    if (item.indisponivel) return acc;
    return acc + item.subtotal;
  }, 0);

  return {
    itens: itensFormatados,
    quantidadeItens: itensFormatados.reduce((acc, item) => acc + item.quantidade, 0),
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalEstimado: parseFloat(subtotal.toFixed(2))
  };
}

function adicionarItem(req, res) {
  const usuarioId = req.user.id;
  const { produtoId, quantidade } = req.body;

  if (!produtoId || !quantidade) {
    return res.status(400).json({ erro: 'produtoId e quantidade são obrigatórios' });
  }

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    return res.status(400).json({ erro: 'quantidade deve ser um inteiro positivo' });
  }

  const produto = db.prepare('SELECT * FROM produtos WHERE id = ? AND ativo = 1').get(produtoId);
  if (!produto) {
    return res.status(404).json({ erro: 'Produto não encontrado' });
  }

  const itemExistente = db.prepare('SELECT * FROM carrinho_itens WHERE produto_id = ? AND usuario_id = ?').get(produtoId, usuarioId);
  const qtdAtual = itemExistente ? itemExistente.quantidade : 0;

  if (qtdAtual + quantidade > produto.estoque) {
    return res.status(409).json({ erro: 'Quantidade solicitada excede o estoque disponível' });
  }

  if (itemExistente) {
    db.prepare('UPDATE carrinho_itens SET quantidade = ? WHERE item_id = ?').run(qtdAtual + quantidade, itemExistente.item_id);
  } else {
    db.prepare('INSERT INTO carrinho_itens (usuario_id, produto_id, nome, preco, desconto, quantidade) VALUES (?, ?, ?, ?, ?, ?)').run(usuarioId, produtoId, produto.nome, produto.preco, produto.desconto, quantidade);
  }

  return res.status(201).json(getCarrinhoFormatado(usuarioId));
}

function visualizarCarrinho(req, res) {
  res.json(getCarrinhoFormatado(req.user.id));
}

function atualizarItem(req, res) {
  const itemId = parseInt(req.params.itemId);
  const { quantidade } = req.body;

  if (quantidade === undefined || !Number.isInteger(quantidade) || quantidade < 0) {
    return res.status(400).json({ erro: 'quantidade deve ser um inteiro maior ou igual a 0' });
  }

  const item = db.prepare('SELECT * FROM carrinho_itens WHERE item_id = ?').get(itemId);
  if (!item) {
    return res.status(404).json({ erro: 'Item não encontrado no carrinho' });
  }

  if (quantidade === 0) {
    db.prepare('DELETE FROM carrinho_itens WHERE item_id = ?').run(itemId);
    return res.json(getCarrinhoFormatado(req.user.id));
  }

  const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(item.produto_id);
  if (quantidade > produto.estoque) {
    return res.status(409).json({ erro: 'Quantidade solicitada excede o estoque disponível' });
  }

  db.prepare('UPDATE carrinho_itens SET quantidade = ? WHERE item_id = ?').run(quantidade, itemId);
  return res.json(getCarrinhoFormatado(req.user.id));
}

function removerItem(req, res) {
  const itemId = parseInt(req.params.itemId);
  const usuarioId = req.user.id;

  const item = db.prepare('SELECT * FROM carrinho_itens WHERE item_id = ?').get(itemId);
  if (!item) {
    return res.status(404).json({ erro: 'Item não encontrado no carrinho' });
  }

  if (item.usuario_id !== usuarioId) {
    return res.status(403).json({ erro: 'Forbidden' });
  }

  db.prepare('DELETE FROM carrinho_itens WHERE item_id = ?').run(itemId);
  return res.status(204).send();
}

module.exports = {
  adicionarItem,
  visualizarCarrinho,
  atualizarItem,
  removerItem
};
