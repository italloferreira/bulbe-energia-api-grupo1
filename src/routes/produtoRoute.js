const express = require('express');

const {
  listarCatalogoHome,
  listarProdutos,
  buscarProdutoPorId,
  listarDestaques,
  listarOfertas,
  buscarProdutos
} = require('../controllers/produtoController');

const router = express.Router();

router.get(
  '/catalogo/home',
  listarCatalogoHome
);

router.get(
  '/produtos/buscar',
  buscarProdutos
);

router.get(
  '/produtos/destaques',
  listarDestaques
);

router.get(
  '/produtos/ofertas',
  listarOfertas
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
