const express = require('express');
const router = express.Router();

const {
  criarPedido,
  listarPedidos,
  obterPedido,
  cancelarPedido
} = require('../controllers/pedidoController');

// POST /api/pedidos - Criar novo pedido
router.post('/', criarPedido);

// GET /api/pedidos - Listar pedidos do usuário com filtros
router.get('/', listarPedidos);

// GET /api/pedidos/:id - Obter detalhes de um pedido específico
router.get('/:id', obterPedido);

// POST /api/pedidos/:id/cancelar - Cancelar um pedido
router.post('/:id/cancelar', cancelarPedido);

module.exports = router;