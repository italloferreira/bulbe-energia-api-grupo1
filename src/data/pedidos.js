// src/data/pedidos.js
// "Banco de dados" em memória dos pedidos finalizados.
// Cada pedido tem: id, status, itens, endereço, frete, cupom, pagamento e resumo.

const pedidos = {
  lista: [],
  _proximoId: 1
};

module.exports = pedidos;
