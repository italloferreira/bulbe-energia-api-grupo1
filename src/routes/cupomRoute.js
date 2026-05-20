const express = require('express');
 
const { validarCupom } = require('../controllers/cupomController');
 
const router = express.Router();
 
router.post('/cupons/validar', validarCupom);
 
module.exports = router;