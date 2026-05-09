const express = require('express');
const produtos = require('./src/produtos');
const { carrinho, getCarrinhoFormatado } = require('./src/carrinho');

const app = express();
const PORT = 3000;

app.use(express.json());

// ─── Rota raiz ────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ mensagem: 'API Bulbe Energia funcionando!' });
});

// ─── RF-01 · Catálogo home ────────────────────────────────────────────────────
app.get('/api/v1/catalogo/home', (req, res) => {
  const produtosAtivos = produtos.filter(p => p.ativo);
  res.json({ produtos: produtosAtivos });
});

// ─── RF-02 · Buscar produtos ──────────────────────────────────────────────────
app.get('/api/v1/produtos', (req, res) => {
  const { search } = req.query;
  const lista = produtos.filter(p => p.ativo);

  if (search) {
    const termo = search.toLowerCase();
    const resultado = lista.filter(p => p.nome.toLowerCase().includes(termo));
    return res.json(resultado);
  }

  res.json(lista);
});

// ─── RF-04 · Produto por ID ───────────────────────────────────────────────────
app.get('/api/v1/produtos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const produto = produtos.find(p => p.id === id);

  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

  const isAdmin = req.headers['x-admin'] === 'true';
  if (!produto.ativo && !isAdmin) {
    return res.status(404).json({ erro: 'Produto não encontrado' });
  }

  return res.json({
    id: produto.id,
    nome: produto.nome,
    descricaoLonga: produto.descricaoLonga,
    galeriaImagens: produto.galeriaImagens,
    preco: produto.preco,
    desconto: produto.desconto,
    marca: produto.marca,
    especificacoesTecnicas: produto.especificacoesTecnicas,
    estoque: produto.estoque,
    avaliacoesResumidas: produto.avaliacoesResumidas
  });
});

// ─── RF-07 · Adicionar item ao carrinho ───────────────────────────────────────
// POST /api/v1/carrinho/itens
app.post('/api/v1/carrinho/itens', (req, res) => {
  const { produtoId, quantidade } = req.body;

  if (!produtoId || !quantidade) {
    return res.status(400).json({ erro: 'produtoId e quantidade são obrigatórios' });
  }

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    return res.status(400).json({ erro: 'quantidade deve ser um inteiro positivo' });
  }

  const produto = produtos.find(p => p.id === produtoId && p.ativo);
  if (!produto) {
    return res.status(404).json({ erro: 'Produto não encontrado' });
  }

  const itemExistente = carrinho.itens.find(i => i.produtoId === produtoId);
  const qtdAtual = itemExistente ? itemExistente.quantidade : 0;

  if (qtdAtual + quantidade > produto.estoque) {
    return res.status(409).json({ erro: 'Quantidade solicitada excede o estoque disponível' });
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

  return res.status(201).json(getCarrinhoFormatado());
});

// ─── RF-08 · Visualizar carrinho ──────────────────────────────────────────────
// GET /api/v1/carrinho
app.get('/api/v1/carrinho', (req, res) => {
  res.json(getCarrinhoFormatado());
});

// ─── RF-08 · [US-07] Atualizar quantidade de um item ─────────────────────────
// PATCH /api/v1/carrinho/itens/:itemId
app.patch('/api/v1/carrinho/itens/:itemId', (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const { quantidade } = req.body;

  // Validação: deve ser inteiro >= 0
  if (quantidade === undefined || !Number.isInteger(quantidade) || quantidade < 0) {
    return res.status(400).json({ erro: 'quantidade deve ser um inteiro maior ou igual a 0' });
  }

  // Procura o item no carrinho
  const index = carrinho.itens.findIndex(i => i.itemId === itemId);
  if (index === -1) {
    return res.status(404).json({ erro: 'Item não encontrado no carrinho' });
  }

  // quantidade 0 → remove o item
  if (quantidade === 0) {
    carrinho.itens.splice(index, 1);
    return res.json(getCarrinhoFormatado());
  }

  // Verifica estoque
  const item = carrinho.itens[index];
  const produto = produtos.find(p => p.id === item.produtoId);

  if (quantidade > produto.estoque) {
    return res.status(409).json({ erro: 'Quantidade solicitada excede o estoque disponível' });
  }

  item.quantidade = quantidade;

  return res.json(getCarrinhoFormatado());
});

// ─── RF-08 · Remover item do carrinho ─────────────────────────────────────────
// DELETE /api/v1/carrinho/itens/:itemId
app.delete('/api/v1/carrinho/itens/:itemId', (req, res) => {
  const itemId = parseInt(req.params.itemId);

  const index = carrinho.itens.findIndex(i => i.itemId === itemId);
  if (index === -1) {
    return res.status(404).json({ erro: 'Item não encontrado no carrinho' });
  }

  carrinho.itens.splice(index, 1);
  return res.status(204).send();
});

// ─── Servidor ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});