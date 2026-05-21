const produtos = require('../produtos'); 
// Categorias válidas (slugs)
const CATEGORIAS_VALIDAS = [
  'casa',
  'eletronicos',
  'eletrodomesticos',
  'ofertas'
];
 
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
    categoria: produto.categoria,
    especificacoesTecnicas: produto.especificacoesTecnicas,
    estoque: produto.estoque,
    avaliacoesResumidas: produto.avaliacoesResumidas
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
 
  res.set('Cache-Control', 'public, max-age=300');
 
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
 
  res.set('Cache-Control', 'public, max-age=300');
 
  res.json(ofertas);
}
 
// RF · Listar produtos por categoria com paginação e ordenação
function listarPorCategoria(req, res) {
  const { categoria } = req.params;
 
  // Valida categoria
  if (!CATEGORIAS_VALIDAS.includes(categoria)) {
    return res.status(404).json({
      erro: `Categoria '${categoria}' não encontrada.`,
      categoriasDisponiveis: CATEGORIAS_VALIDAS
    });
  }
 
  const {
    pagina = 1,
    limite = 20,
    ordenar_por
  } = req.query;
 
  const paginaNum = parseInt(pagina);
  const limiteNum = parseInt(limite);
 
  // Filtra por categoria (ofertas = desconto > 0)
  let lista = produtos.filter(p => {
    if (!p.ativo) return false;
 
    if (categoria === 'ofertas') {
      return p.desconto > 0 && p.estoque > 0;
    }
 
    return p.categoria === categoria;
  });
 
  // Ordenação
  if (ordenar_por) {
    switch (ordenar_por) {
      case 'preco_asc':
        lista.sort((a, b) => {
          const precoA = a.preco - (a.preco * (a.desconto || 0) / 100);
          const precoB = b.preco - (b.preco * (b.desconto || 0) / 100);
          return precoA - precoB;
        });
        break;
 
      case 'preco_desc':
        lista.sort((a, b) => {
          const precoA = a.preco - (a.preco * (a.desconto || 0) / 100);
          const precoB = b.preco - (b.preco * (b.desconto || 0) / 100);
          return precoB - precoA;
        });
        break;
 
      case 'mais_vendidos':
        lista.sort((a, b) =>
          (b.avaliacoesResumidas?.total || 0) -
          (a.avaliacoesResumidas?.total || 0)
        );
        break;
 
      case 'novidades':
        lista.sort((a, b) => b.id - a.id);
        break;
 
      default:
        return res.status(400).json({
          erro: `Valor de ordenar_por inválido: '${ordenar_por}'.`,
          valoresPermitidos: [
            'preco_asc',
            'preco_desc',
            'mais_vendidos',
            'novidades'
          ]
        });
    }
  }
 
  // Paginação
  const total = lista.length;
  const totalPaginas = Math.ceil(total / limiteNum);
  const inicio = (paginaNum - 1) * limiteNum;
  const fim = inicio + limiteNum;
  const paginaAtual = lista.slice(inicio, fim);
 
  // Formata retorno conforme critérios de aceitação
  const resultado = paginaAtual.map(p => ({
    id: p.id,
    nome: p.nome,
    preco: p.preco,
    precoComDesconto: p.desconto > 0
      ? parseFloat(
          (p.preco - (p.preco * p.desconto / 100)).toFixed(2)
        )
      : p.preco,
    imagemPrincipal: p.galeriaImagens?.[0] || null,
    categoria: p.categoria,
    estoqueDisponivel: p.estoque
  }));
 
  res.json({
    categoria,
    paginacao: {
      paginaAtual: paginaNum,
      limite: limiteNum,
      total,
      totalPaginas
    },
    produtos: resultado
  });
}
 
module.exports = {
  listarCatalogoHome,
  listarProdutos,
  buscarProdutoPorId,
  listarDestaques,
  listarOfertas,
  listarPorCategoria
};
