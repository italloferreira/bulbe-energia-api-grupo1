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
