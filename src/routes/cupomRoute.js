const express = require('express');

const autenticar = require('../middlewares/auth');

const { validarCupom } = require('../controllers/cupomController');

const router = express.Router();

router.post('/cupons/validar', autenticar, validarCupom);

module.exports = router;