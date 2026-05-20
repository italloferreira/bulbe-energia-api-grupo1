const express = require('express');
const router = express.Router();

const {
  criarPedido,
  listarPedidos,
  obterPedido
} = require('../controllers/pedidoController');

router.post('/', criarPedido);

router.get('/', listarPedidos);

router.get('/:id', obterPedido);

module.exports = router;