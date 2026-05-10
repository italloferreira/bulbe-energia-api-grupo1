const carrinho = {
  itens: [
    {
      itemId: 1,
      produtoId: 1,
      nome: 'Lâmpada LED 12W',
      preco: 29.90,
      desconto: 10,
      quantidade: 2
    },
    {
      itemId: 2,
      produtoId: 2,
      nome: 'Painel Solar 550W',
      preco: 899.90,
      desconto: 5,
      quantidade: 1
    }
  ],

  _proximoId: 3
};

module.exports = carrinho;