const produtos = require('../produtos');

// RF-01 · Catálogo home
function listarCatalogoHome(req, res) {

  const produtosAtivos = produtos.filter(
    p => p.ativo
  );

  res.json({
    produtos: produtosAtivos
  });
}

// RF-02 · Buscar produtos
function listarProdutos(req, res) {

  const { search } = req.query;

  const lista = produtos.filter(
    p => p.ativo
  );

  if (search) {

    const termo = search.toLowerCase();

    const resultado = lista.filter(
      p => p.nome.toLowerCase().includes(termo)
    );

    return res.json(resultado);
  }

  res.json(lista);
}

// RF-04 · Produto por ID
function buscarProdutoPorId(req, res) {

  const id = parseInt(req.params.id);

  const produto = produtos.find(
    p => p.id === id
  );

  if (!produto) {

    return res.status(404).json({
      erro: 'Produto não encontrado'
    });
  }

  const isAdmin =
    req.headers['x-admin'] === 'true';

  if (!produto.ativo && !isAdmin) {

    return res.status(404).json({
      erro: 'Produto não encontrado'
    });
  }

  return res.json({
    id: produto.id,
    nome: produto.nome,
    descricaoLonga: produto.descricaoLonga,
    galeriaImagens: produto.galeriaImagens,
    preco: produto.preco,
    desconto: produto.desconto,
    marca: produto.marca,
    especificacoesTecnicas:
      produto.especificacoesTecnicas,
    estoque: produto.estoque,
    avaliacoesResumidas:
      produto.avaliacoesResumidas
  });
}

// RF · Produtos em destaque
function listarDestaques(req, res) {

  const destaques = produtos
    .filter(p =>
      p.destaque &&
      p.ativo &&
      p.estoque > 0
    )
    .slice(0, 10);

  res.set(
    'Cache-Control',
    'public, max-age=300'
  );

  res.json(destaques);
}

// RF · Produtos em oferta
function listarOfertas(req, res) {

  const ofertas = produtos
    .filter(p =>
      p.desconto > 0 &&
      p.ativo &&
      p.estoque > 0
    )
    .slice(0, 10);

  res.set(
    'Cache-Control',
    'public, max-age=300'
  );

  res.json(ofertas);
}

module.exports = {
  listarCatalogoHome,
  listarProdutos,
  buscarProdutoPorId,
  listarDestaques,
  listarOfertas
};