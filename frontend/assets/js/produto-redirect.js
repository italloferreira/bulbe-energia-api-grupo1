(function () {
  const isPages = window.location.pathname.includes('/pages/');
  const produtoUrl = isPages ? './produtos.html' : './pages/produtos.html';

  function irParaProduto(nome, imagem, preco) {
    localStorage.setItem('produtoSelecionado', JSON.stringify({ nome, imagem, preco }));
    window.location.href = produtoUrl;
  }

  document.addEventListener('DOMContentLoaded', function () {
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
          nome  ? nome.textContent.trim() : '',
          img   ? img.src                 : '',
          preco ? preco.textContent.trim(): ''
        );
      });
    });

    document.querySelectorAll('.card').forEach(function (card) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', function (e) {
        if (e.target.closest('.btn-carrinho')) return;
        const img   = card.querySelector('img');
        const nome  = card.querySelector('.card-title');
        const preco = card.querySelector('.card-price');
        irParaProduto(
          nome  ? nome.textContent.trim() : '',
          img   ? img.src                 : '',
          preco ? preco.textContent.trim(): ''
        );
      });
    });
  });
})();
