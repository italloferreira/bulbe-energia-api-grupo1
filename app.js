const express = require('express');

const pedidosRoutes = require('./src/routes/pedidoRoute');
const freteRoutes = require('./src/routes/freteRoute');
const produtosRoutes = require('./src/routes/produtoRoute');
const carrinhoRoutes = require('./src/routes/carrinhoRoute');

const cors = require('cors');

const app = express();
const PORT = 3000;


app.use(express.json());
app.use(cors());

app.use('/api/pedidos', pedidosRoutes);
app.use('/api/frete', freteRoutes);
app.use('/api/v1', produtosRoutes);
app.use('/api/v1', carrinhoRoutes);

app.get('/', (req, res) => {
  res.json({ mensagem: 'API Bulbe Energia funcionando!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});