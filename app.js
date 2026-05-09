const express = require('express');
const produtos = require('./src/produtos');

const app = express();
const PORT = 3000;

app.use(express.json());

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API Bulbe Energia funcionando!'
  });
});

// Listar todos os produtos ativos
app.get('/api/produtos', (req, res) => {
  const produtosAtivos = produtos.filter(produto => produto.ativo);
  res.json(produtosAtivos);
});

// Buscar produto por ID
app.get('/api/produtos/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const produto = produtos.find(p => p.id === id);

  // Produto não encontrado
  if (!produto) {
    return res.status(404).json({
      erro: 'Produto não encontrado'
    });
  }

  // Verifica se é admin
  const isAdmin = req.headers['x-admin'] === 'true';

  // Produto inativo só pode ser visualizado por admin
  if (!produto.ativo && !isAdmin) {
    return res.status(404).json({
      erro: 'Produto não encontrado'
    });
  }

  // Retorna detalhes completos
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

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});