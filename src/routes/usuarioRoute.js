const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Rota de cadastro de novo usuário
// POST /api/usuarios
router.post('/usuarios', usuarioController.cadastrar);

// Rota de login (gera token JWT)
// POST /api/login
router.post('/login', usuarioController.login);

module.exports = router;