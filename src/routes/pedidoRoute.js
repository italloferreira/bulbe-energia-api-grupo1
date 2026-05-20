// src/routes/pedidoRoute.js
const express = require('express');
const router = express.Router();

const { criarPedido, listarPedidos } = require('../controllers/pedidoController');

// RF-13 · POST /api/pedidos · finaliza a compra e gera um pedido
router.post('/', criarPedido);

// RF-14 · GET /api/pedidos · histórico de pedidos do usuário
router.get('/', listarPedidos);

module.exports = router;