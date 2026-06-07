const db = require('../data/db');

const CATEGORIAS_VALIDAS = [
  'casa',
  'eletronicos',
  'eletrodomesticos',
  'ofertas'
];

function mapProduto(row) {
  return {
    id: row.id,
    nome: row.nome,
    descricaoLonga: row.descricaoLonga,
    galeriaImagens: JSON.parse(row.galeriaImagens || '[]'),
    preco: row.preco,
    desconto: row.desconto,
    destaque: !!row.destaque,
    marca: row.marca,
    categoria: row.categoria,
    especificacoesTecnicas: JSON.parse(row.especificacoesTecnicas || '{}'),
    estoque: row.estoque,
    avaliacoesResumidas: JSON.parse(row.avaliacoesResumidas || '{}'),
    ativo: !!row.ativo
  };
}

function listarCatalogoHome(req, res) {
  const rows = db.prepare('SELECT * FROM produtos WHERE ativo = 1').all();
  res.json({ produtos: rows.map(mapProduto) });
}

function listarProdutos(req, res) {
  const { search } = req.query;

  if (search) {
    const rows = db.prepare('SELECT * FROM produtos WHERE ativo = 1 AND nome LIKE ?').all(`%${search}%`);
    return res.json(rows.map(mapProduto));
  }

  const rows = db.prepare('SELECT * FROM produtos WHERE ativo = 1').all();
  res.json(rows.map(mapProduto));
}

function buscarProdutoPorId(req, res) {
  const id = parseInt(req.params.id);
  const row = db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);

  if (!row) {
    return res.status(404).json({ erro: 'Produto não encontrado' });
  }

  const isAdmin = req.headers['x-admin'] === 'true';
  if (!row.ativo && !isAdmin) {
    return res.status(404).json({ erro: 'Produto não encontrado' });
  }

  const p = mapProduto(row);
  return res.json({
    id: p.id,
    nome: p.nome,
    descricaoLonga: p.descricaoLonga,
    galeriaImagens: p.galeriaImagens,
    preco: p.preco,
    desconto: p.desconto,
    marca: p.marca,
    categoria: p.categoria,
    especificacoesTecnicas: p.especificacoesTecnicas,
    estoque: p.estoque,
    avaliacoesResumidas: p.avaliacoesResumidas
  });
}

function listarDestaques(req, res) {
  const rows = db.prepare('SELECT * FROM produtos WHERE destaque = 1 AND ativo = 1 AND estoque > 0 LIMIT 10').all();
  res.set('Cache-Control', 'public, max-age=300');
  res.json(rows.map(mapProduto));
}

function listarOfertas(req, res) {
  const rows = db.prepare('SELECT * FROM produtos WHERE desconto > 0 AND ativo = 1 AND estoque > 0 LIMIT 10').all();
  res.set('Cache-Control', 'public, max-age=300');
  res.json(rows.map(mapProduto));
}

function listarPorCategoria(req, res) {
  const { categoria } = req.params;

  if (!CATEGORIAS_VALIDAS.includes(categoria)) {
    return res.status(404).json({
      erro: `Categoria '${categoria}' não encontrada.`,
      categoriasDisponiveis: CATEGORIAS_VALIDAS
    });
  }

  const { pagina = 1, limite = 20, ordenar_por } = req.query;
  const paginaNum = parseInt(pagina);
  const limiteNum = parseInt(limite);

  let sql, countSql, params;

  if (categoria === 'ofertas') {
    sql = 'SELECT * FROM produtos WHERE ativo = 1 AND desconto > 0 AND estoque > 0';
    countSql = 'SELECT COUNT(*) as total FROM produtos WHERE ativo = 1 AND desconto > 0 AND estoque > 0';
  } else {
    sql = 'SELECT * FROM produtos WHERE ativo = 1 AND categoria = ?';
    countSql = 'SELECT COUNT(*) as total FROM produtos WHERE ativo = 1 AND categoria = ?';
  }
  params = categoria === 'ofertas' ? [] : [categoria];

  const totalRow = db.prepare(countSql).get(...params);
  const total = totalRow.total;

  switch (ordenar_por) {
    case 'preco_asc':
      sql += ' ORDER BY (preco - preco * (COALESCE(desconto,0))/100) ASC';
      break;
    case 'preco_desc':
      sql += ' ORDER BY (preco - preco * (COALESCE(desconto,0))/100) DESC';
      break;
    case 'mais_vendidos':
      sql += ' ORDER BY JSON_EXTRACT(avaliacoesResumidas, \'$.total\') DESC';
      break;
    case 'novidades':
      sql += ' ORDER BY id DESC';
      break;
    case undefined:
      break;
    default:
      return res.status(400).json({
        erro: `Valor de ordenar_por inválido: '${ordenar_por}'.`,
        valoresPermitidos: ['preco_asc', 'preco_desc', 'mais_vendidos', 'novidades']
      });
  }

  sql += ' LIMIT ? OFFSET ?';
  const allParams = [...params, limiteNum, (paginaNum - 1) * limiteNum];
  const rows = db.prepare(sql).all(...allParams);

  const totalPaginas = Math.ceil(total / limiteNum);

  const resultado = rows.map(p => {
    const precoComDesconto = p.desconto > 0
      ? parseFloat((p.preco - (p.preco * p.desconto / 100)).toFixed(2))
      : p.preco;
    const galeria = JSON.parse(p.galeriaImagens || '[]');
    return {
      id: p.id,
      nome: p.nome,
      preco: p.preco,
      precoComDesconto,
      imagemPrincipal: galeria[0] || null,
      categoria: p.categoria,
      estoqueDisponivel: p.estoque
    };
  });

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
