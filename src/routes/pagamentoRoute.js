const express = require('express');
const router = express.Router();

const {
  criarPagamentoPix,
  consultarPagamentoPix
} = require('../controllers/pagamentoController');

router.post('/pix', criarPagamentoPix);

router.get('/pix/:id', consultarPagamentoPix);

module.exports = router;