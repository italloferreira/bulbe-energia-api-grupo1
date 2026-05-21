const express = require('express');
 
const { abrirChamado } = require('../controllers/suporteController');
 
const router = express.Router();
 
router.post('/suporte/chamados', abrirChamado);
 
module.exports = router;
 