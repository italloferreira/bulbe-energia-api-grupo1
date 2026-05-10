const express = require('express');

const {
  adicionarItem,
  visualizarCarrinho,
  atualizarItem,
  removerItem
} = require('../controllers/carrinhoController');

const router = express.Router();

router.post('/carrinho/itens', adicionarItem);

router.get('/carrinho', visualizarCarrinho);

router.patch('/carrinho/itens/:itemId', atualizarItem);

router.delete('/carrinho/itens/:itemId', removerItem);

module.exports = router;