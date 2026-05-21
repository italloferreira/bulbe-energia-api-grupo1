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
const PORT = 3000;

app.use('/api/webhooks', webhookRoutes);

app.use(express.json());
app.use(cors());

app.use('/api/pedidos', pedidosRoutes);
app.use('/api/frete', freteRoutes);
app.use('/api/v1', produtosRoutes);
app.use('/api/v1', carrinhoRoutes);
app.use('/api/v1', usuariosRoutes);
app.use('/api', cupomRoutes);
app.use('/api', suporteRoutes);
 
app.use('/api/pagamentos', pagamentosRoutes);

const swaggerDocument = YAML.load('./docs/openapi.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.json({ mensagem: 'API Bulbe Energia funcionando!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});