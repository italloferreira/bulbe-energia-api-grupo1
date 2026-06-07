const addCarrinho = document.getElementById("addCarrinho");
const comprar = document.getElementById("comprar");

addCarrinho.addEventListener('click', ()=>{
    const compra = {
        nomeProduto: document.getElementById("titulo").textContent,
        imgProduto: document.getElementById("img").src,
        valorTotal: document.getElementById("valorTotal").textContent,
        valorFinal: document.getElementById("valorFinal").textContent
    }

    const compraJSON = JSON.stringify(compra);

    localStorage.setItem('compra', compraJSON);
})

comprar.addEventListener("click", () => {
    const produto = {
        nomeProduto: document.getElementById("titulo").textContent,
        imgProduto: document.getElementById("img").src,
        descricaoProduto: document.getElementById("descricao").textContent,
        valorTotal: document.getElementById("valorTotal").textContent,
        valorFinal: document.getElementById("valorFinal").textContent
    }

    const produtoJSON = JSON.stringify(produto);
    localStorage.setItem('produto', produtoJSON);
})



// Script para funcionalidade das avaliações
document.addEventListener('DOMContentLoaded', function() {
    const addReviewBtn = document.querySelector('.add-review-btn');
    const reviewForm = document.getElementById('reviewForm');
    const stars = document.querySelectorAll('.star');
    const submitReviewBtn = document.querySelector('.submit-review');
    let currentRating = 0;

    // Carregar avaliações salvas no localStorage
    loadSavedReviews();

    // Alternar visibilidade do formulário de avaliação
    if (addReviewBtn) {
        addReviewBtn.addEventListener('click', function() {
            if (reviewForm.style.display === 'none' || reviewForm.style.display === '') {
                reviewForm.style.display = 'block';
                addReviewBtn.textContent = 'Cancelar';
            } else {
                reviewForm.style.display = 'none';
                addReviewBtn.textContent = '+ Adicionar Avaliação';
                resetForm();
            }
        });
    }

    // Sistema de avaliação por estrelas
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            currentRating = rating;
            
            stars.forEach(s => {
                if (parseInt(s.getAttribute('data-rating')) <= rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });

    // Enviar avaliação
    if (submitReviewBtn) {
        submitReviewBtn.addEventListener('click', function() {
            const reviewerName = document.getElementById('reviewerName').value;
            const reviewText = document.getElementById('reviewText').value;

            if (!reviewerName || !reviewText || currentRating === 0) {
                alert('Por favor, preencha todos os campos e selecione uma avaliação.');
                return;
            }

            // Salvar avaliação no localStorage
            saveReviewToLocalStorage(reviewerName, reviewText, currentRating);

            // Adicionar nova avaliação à UI
            addNewReview(reviewerName, reviewText, currentRating);

            resetForm();
            reviewForm.style.display = 'none';
            addReviewBtn.textContent = '+ Adicionar Avaliação';

            alert('Avaliação enviada com sucesso!');
        });
    }

    // Função para adicionar nova avaliação
    function addNewReview(name, text, rating) {
        const reviewsContainer = document.querySelector('.reviews-section');
        const reviewCards = document.querySelectorAll('.review-card');
        const firstReviewCard = reviewCards[0];

        const newReview = document.createElement('div');
        newReview.className = 'review-card';

        const starsHTML = '★'.repeat(rating) + '☆'.repeat(5 - rating);

        newReview.innerHTML = `
            <div class="review-header">
                <span class="reviewer-name">${name}</span>
                <span class="review-date">Agora mesmo</span>
            </div>
            <div class="review-rating">${starsHTML}</div>
            <p class="review-text">${text}</p>
        `;

        firstReviewCard.parentNode.insertBefore(newReview, firstReviewCard.nextSibling);
    }

    // Salvar avaliação no localStorage
    function saveReviewToLocalStorage(name, text, rating) {
        const existing = JSON.parse(localStorage.getItem("avaliacao")) || [];

        const newReview = {
            name,
            text,
            rating,
            date: new Date().toLocaleString('pt-BR')
        };

        existing.push(newReview);

        localStorage.setItem("avaliacao", JSON.stringify(existing));
    }

    // Carregar avaliações salvas do localStorage
    function loadSavedReviews() {
        const saved = JSON.parse(localStorage.getItem("avaliacao")) || [];

        saved.forEach(review => {
            const reviewsContainer = document.querySelector('.reviews-section');
            const reviewCards = document.querySelectorAll('.review-card');
            const firstReviewCard = reviewCards[0];

            const starsHTML = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

            const newReview = document.createElement('div');
            newReview.className = 'review-card';

            newReview.innerHTML = `
                <div class="review-header">
                    <span class="reviewer-name">${review.name}</span>
                    <span class="review-date">${review.date}</span>
                </div>
                <div class="review-rating">${starsHTML}</div>
                <p class="review-text">${review.text}</p>
            `;

            firstReviewCard.parentNode.insertBefore(newReview, firstReviewCard.nextSibling);
        });
    }

    // Resetar formulário
    function resetForm() {
        document.getElementById('reviewerName').value = '';
        document.getElementById('reviewText').value = '';
        currentRating = 0;
        
        stars.forEach(star => {
            star.classList.remove('active');
        });
    }

});

