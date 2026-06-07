(function () {
  const isRoot = !window.location.pathname.includes('/pages/');
  const produtoUrl = isRoot ? './pages/produtos.html' : './produtos.html';

  function irParaProduto(nome, imagem, preco) {
    localStorage.setItem('produtoSelecionado', JSON.stringify({ nome, imagem, preco }));
    window.location.href = produtoUrl;
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Lamp destaque card — remove onclick hardcoded e limpa seleção pra cair no padrão
    const lampCard = document.getElementById('Lampada');
    if (lampCard) {
      lampCard.removeAttribute('onclick');
      lampCard.style.cursor = 'pointer';
      lampCard.addEventListener('click', function () {
        localStorage.removeItem('produtoSelecionado');
        window.location.href = produtoUrl;
      });
    }

    document.querySelectorAll('.prod, .prod_destaque:not(#Lampada)').forEach(function (card) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', function () {
        const img   = card.querySelector('img');
        const nome  = card.querySelector('p');
        const preco = card.querySelector('h3');
        irParaProduto(
          nome  ? nome.textContent.trim()  : '',
          img   ? img.getAttribute('src')  : '',
          preco ? preco.textContent.trim() : ''
        );
      });
    });
  });
})();
