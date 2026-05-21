const express = require('express');
const router = express.Router();

const autenticar = require('../middlewares/auth');

const {
  criarPedido,
  listarPedidos,
  obterPedido,
  cancelarPedido
} = require('../controllers/pedidoController');

// POST /api/pedidos - Criar novo pedido
router.post('/', autenticar, criarPedido);

// GET /api/pedidos - Listar pedidos do usuário com filtros
router.get('/', autenticar, listarPedidos);

// GET /api/pedidos/:id - Obter detalhes de um pedido específico
router.get('/:id', autenticar, obterPedido);

// POST /api/pedidos/:id/cancelar - Cancelar um pedido
router.post('/:id/cancelar', autenticar, cancelarPedido);

module.exports = router;