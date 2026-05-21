const express = require('express');
const router = express.Router();

const { receberWebhookPagamento } = require('../controllers/webhookController');

const capturarRawBody = express.raw({ type: '*/*' });

function comRawBody(req, res, next) {
  req.rawBody = req.body && req.body.length ? req.body.toString('utf8') : '';
  next();
}

router.post(
  '/pagamento',
  capturarRawBody,
  comRawBody,
  receberWebhookPagamento
);

module.exports = router;