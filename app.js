const path = require('path');
const express = require('express');

const pedidosRoutes = require('./src/routes/pedidoRoute');
const freteRoutes = require('./src/routes/freteRoute');
const produtosRoutes = require('./src/routes/produtoRoute');
const carrinhoRoutes = require('./src/routes/carrinhoRoute');
const usuariosRoutes = require('./src/routes/usuarioRoute');
const cupomRoutes = require('./src/routes/cupomRoute');
const suporteRoutes = require('./src/routes/suporteRoute');

const pagamentosRoutes = require('./src/routes/pagamentoRoute');
const webhookRoutes = require('./src/routes/webhookRoute');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Webhook precisa do corpo cru (raw), por isso vem antes do express.json()
app.use('/api/webhooks', webhookRoutes);

app.use(express.json());
app.use(cors());

// ------------------------------------------------------------------
//  ROTAS DA API (backend - Bulbe Energia)
// ------------------------------------------------------------------
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/frete', freteRoutes);
app.use('/api/v1', produtosRoutes);
app.use('/api/v1', carrinhoRoutes);
app.use('/api/v1', usuariosRoutes);
app.use('/api', cupomRoutes);
app.use('/api', suporteRoutes);
app.use('/api/pagamentos', pagamentosRoutes);

// Documentação Swagger
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'openapi.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Endpoint simples de health-check da API
app.get('/api', (req, res) => {
  res.json({ mensagem: 'API Bulbe Energia funcionando!' });
});

// ------------------------------------------------------------------
//  FRONTEND (BulbeShop) - servido como arquivos estáticos
//  Tudo roda no mesmo servidor/porta -> sem CORS e imagens intactas
// ------------------------------------------------------------------
const FRONTEND_DIR = path.join(__dirname, 'frontend');
app.use(express.static(FRONTEND_DIR));

// Página inicial da loja
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🟢 Bulbe Fullstack rodando em http://localhost:${PORT}`);
  console.log(`   • Loja (frontend):   http://localhost:${PORT}/`);
  console.log(`   • API (backend):     http://localhost:${PORT}/api`);
  console.log(`   • Swagger (docs):    http://localhost:${PORT}/api-docs\n`);
});

module.exports = app;
