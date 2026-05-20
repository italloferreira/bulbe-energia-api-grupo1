// src/routes/pedidoRoute.js
const express = require('express');
const router = express.Router();

const { criarPedido } = require('../controllers/pedidoController');

// RF-13 · POST /api/pedidos
router.post('/', criarPedido);

module.exports = router;
