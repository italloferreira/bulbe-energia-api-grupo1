// Menu Lateral - Funcionalidades (FUNCIONANDO 100%)
document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.querySelector('.menu-e-logo img:first-child');
    const menuLateral = document.getElementById('menu-lateral');
    const btnFechar = document.querySelector('.btn-fechar');
    const overlay = document.querySelector('.overlay');
    const categoriaHeader = document.querySelector('.categoria-header');
    const categoria = document.querySelector('.categoria');

    // Abrir menu
    if (menuIcon) {
        menuIcon.addEventListener('click', abrirMenu);
    }

    // Fechar menu
    if (btnFechar) {
        btnFechar.addEventListener('click', fecharMenu);
    }

    if (overlay) {
        overlay.addEventListener('click', fecharMenu);
    }

    // Alternar submenu ao clicar em "Categorias"
    if (categoriaHeader) {
        categoriaHeader.addEventListener('click', () => {
            categoria.classList.toggle('ativo');
        });
    }
});

// Funções globais para serem usadas em todas as páginas
function abrirMenu() {
    const menuLateral = document.getElementById('menu-lateral');
    const overlay = document.querySelector('.overlay');
    if (menuLateral && overlay) {
        menuLateral.classList.add('ativo');
        overlay.classList.add('ativo');
    }
}

function fecharMenu() {
    const menuLateral = document.getElementById('menu-lateral');
    const overlay = document.querySelector('.overlay');
    const categoria = document.querySelector('.categoria');
    
    if (menuLateral && overlay) {
        menuLateral.classList.remove('ativo');
        overlay.classList.remove('ativo');
        if (categoria) {
            categoria.classList.remove('ativo');
        }
    }
}


// JavaScript para funcionalidade do formulário de avaliações
document.addEventListener('DOMContentLoaded', function() {
  // Elementos do DOM
  const addReviewBtn = document.querySelector('.add-review-btn');
  const reviewForm = document.getElementById('reviewForm');
  const submitReviewBtn = document.querySelector('.submit-review');
  const stars = document.querySelectorAll('.star');
  
  // Variável para armazenar a avaliação selecionada
  let selectedRating = 0;
  
  // Mostrar/ocultar formulário
  addReviewBtn.addEventListener('click', function() {
    if (reviewForm.style.display === 'none' || reviewForm.style.display === '') {
      reviewForm.style.display = 'block';
      addReviewBtn.textContent = '− Cancelar Avaliação';
    } else {
      reviewForm.style.display = 'none';
      addReviewBtn.textContent = '+ Adicionar Avaliação';
      resetForm();
    }
  });
  
  // Sistema de avaliação por estrelas
  stars.forEach(star => {
    star.addEventListener('click', function() {
      selectedRating = parseInt(this.getAttribute('data-rating'));
      updateStars(selectedRating);
    });
  });
  
  // Função para atualizar as estrelas
  function updateStars(rating) {
    stars.forEach(star => {
      const starRating = parseInt(star.getAttribute('data-rating'));
      if (starRating <= rating) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
  }
  
  // Enviar avaliação
  submitReviewBtn.addEventListener('click', function() {
    const reviewerName = document.getElementById('reviewerName').value.trim();
    const reviewText = document.getElementById('reviewText').value.trim();
    
    // Validação básica
    if (!reviewerName) {
      alert('Por favor, digite seu nome.');
      return;
    }
    
    if (selectedRating === 0) {
      alert('Por favor, selecione uma avaliação com as estrelas.');
      return;
    }
    
    if (!reviewText) {
      alert('Por favor, digite um comentário.');
      return;
    }
    
    // Criar nova avaliação
    createNewReview(reviewerName, selectedRating, reviewText);
    
    // Resetar formulário
    resetForm();
    reviewForm.style.display = 'none';
    addReviewBtn.textContent = '+ Adicionar Avaliação';
    
    alert('Avaliação enviada com sucesso!');
  });
  
  // Função para criar nova avaliação
  function createNewReview(name, rating, text) {
    const reviewsSection = document.querySelector('.reviews-section');
    const reviewForm = document.getElementById('reviewForm');
    
    // Criar elemento de avaliação
    const reviewCard = document.createElement('div');
    reviewCard.className = 'review-card';
    
    // Data atual formatada
    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);
    
    // Criar estrelas baseadas na avaliação
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
      starsHTML += i <= rating ? '★' : '☆';
    }
    
    // Conteúdo da avaliação
    reviewCard.innerHTML = `
      <div class="review-header">
        <span class="reviewer-name">${name}</span>
        <span class="review-date">${formattedDate}</span>
      </div>
      <div class="review-rating">${starsHTML}</div>
      <p class="review-text">${text}</p>
    `;
    
    // Inserir antes do formulário
    reviewsSection.insertBefore(reviewCard, reviewForm);
  }
  
  // Função para resetar o formulário
  function resetForm() {
    document.getElementById('reviewerName').value = '';
    document.getElementById('reviewText').value = '';
    selectedRating = 0;
    updateStars(0);
  }
  
  // Função para formatar data
  function formatDate(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hoje';
    } else if (diffDays === 1) {
      return 'Há 1 dia atrás';
    } else if (diffDays < 7) {
      return `Há ${diffDays} dias atrás`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Há ${weeks} ${weeks === 1 ? 'semana' : 'semanas'} atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  }
});