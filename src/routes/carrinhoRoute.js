const express = require('express');

const {
  adicionarItem,
  visualizarCarrinho,
  atualizarItem,
  removerItem
} = require('../controllers/carrinhoController');

const autenticar = require('../middlewares/auth');

const router = express.Router();

router.post('/carrinho/itens', autenticar, adicionarItem);

router.get('/carrinho', autenticar, visualizarCarrinho);

router.patch('/carrinho/itens/:itemId', autenticar, atualizarItem);

router.delete('/carrinho/itens/:itemId', autenticar, removerItem);

module.exports = router;