const express = require('express');
const router = express.Router();

const autenticar = require('../middlewares/auth');

const {
  criarPagamentoPix,
  consultarPagamentoPix
} = require('../controllers/pagamentoController');

router.post('/pix', autenticar, criarPagamentoPix);

router.get('/pix/:id', autenticar, consultarPagamentoPix);

module.exports = router;