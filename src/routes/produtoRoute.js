const express = require('express');

const {
  listarCatalogoHome,
  listarProdutos,
  buscarProdutoPorId,
  listarDestaques,
  listarOfertas
} = require('../controllers/produtoController');

const router = express.Router();

router.get(
  '/catalogo/home',
  listarCatalogoHome
);

router.get(
  '/produtos',
  listarProdutos
);

router.get(
  '/produtos/:id',
  buscarProdutoPorId
);

router.get(
  '/produtos/destaques',
  listarDestaques
);

router.get(
  '/produtos/ofertas',
  listarOfertas
);

module.exports = router;