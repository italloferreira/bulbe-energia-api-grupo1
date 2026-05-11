const express = require('express');
 
const {
  listarCatalogoHome,
  listarProdutos,
  buscarProdutoPorId,
  listarDestaques,
  listarOfertas,
  listarPorCategoria
} = require('../controllers/produtoController');
 
const router = express.Router();
 
router.get(
  '/catalogo/home',
  listarCatalogoHome
);
 
router.get(
  '/produtos/destaques',
  listarDestaques
);
 
router.get(
  '/produtos/ofertas',
  listarOfertas
);
 
// GET /api/v1/produtos?categoria={slug}&pagina=1&limite=20&ordenar_por=preco_asc
router.get(
  '/produtos/categoria/:categoria',
  listarPorCategoria
);
 
router.get(
  '/produtos',
  listarProdutos
);
 
router.get(
  '/produtos/:id',
  buscarProdutoPorId
);
 
module.exports = router;