
const express = require('express');
const router = express.Router();

const { calcularFrete } = require('../controllers/freteController');


router.post('/calcular', calcularFrete);

module.exports = router;
