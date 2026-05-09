// Carrinho em memória (simula sessão de usuário)
const carrinho = {
  itens: [],
  _proximoId: 1
};

/**
 * Retorna o carrinho formatado com totais calculados
 */
function getCarrinhoFormatado() {
  const subtotal = carrinho.itens.reduce((acc, item) => {
    const precoComDesconto = item.preco * (1 - item.desconto / 100);
    return acc + precoComDesconto * item.quantidade;
  }, 0);

  return {
    itens: carrinho.itens,
    totalItens: carrinho.itens.reduce((acc, item) => acc + item.quantidade, 0),
    subtotal: parseFloat(subtotal.toFixed(2))
  };
}

module.exports = { carrinho, getCarrinhoFormatado };