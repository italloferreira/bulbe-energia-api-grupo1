const express = require('express');
const router = express.Router();

const {
  listar,
  marcarComoLida,
  marcarTodasComoLidas
} = require('../controllers/notificacaoController');

const autenticar = require('../middlewares/auth');

// US-18 · Listar notificações do usuário
// GET /api/notificacoes
// GET /api/notificacoes?nao_lidas=true
router.get('/', autenticar, listar);

// US-19 · Marcar TODAS as notificações como lidas
// PATCH /api/notificacoes/lidas
// IMPORTANTE: precisa vir ANTES da rota /:id/lida pra não dar conflito
router.patch('/lidas', autenticar, marcarTodasComoLidas);

// US-19 · Marcar UMA notificação como lida
// PATCH /api/notificacoes/:id/lida
router.patch('/:id/lida', autenticar, marcarComoLida);

module.exports = router;