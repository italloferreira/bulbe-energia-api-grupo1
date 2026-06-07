// Sistema do Carrinho - SIMPLES E FUNCIONAL
console.log('🛒 carrinho-completo.js carregado!');

// Inicializar carrinho
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// ========== ESTILOS DO CONTADOR E NOTIFICAÇÃO ==========
if (!document.querySelector('#carrinho-completo-styles')) {
    const style = document.createElement('style');
    style.id = 'carrinho-completo-styles';
    style.textContent = `
        .contador-carrinho {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #FF9E1B;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            font-size: 10px;
            display: none;
            justify-content: center;
            align-items: center;
            font-weight: bold;
        }
        
        .notificacao-carrinho {
            position: fixed;
            top: 100px;
            right: 20px;
            background: #12B76A;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: 'Poppins', sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// ========== FUNÇÃO PARA NORMALIZAR CAMINHO DA IMAGEM ==========
function normalizarImagem(srcBruto) {
    const origem = window.location.origin;

    if (!srcBruto) {
        return origem + '/assets/img/produtos/sem-imagem.jpg';
    }

    // Já é URL completa
    if (srcBruto.startsWith('http')) return srcBruto;

    // Começa com barra -> relativo à raiz
    if (srcBruto.startsWith('/')) return origem + srcBruto;

    // ../assets/img/...
    if (srcBruto.startsWith('../assets/')) {
        return origem + srcBruto.slice(2); // tira o ".."
    }

    // ./assets/img/...
    if (srcBruto.startsWith('./assets/')) {
        return origem + '/assets/' + srcBruto.slice('./assets/'.length);
    }

    // assets/img/...
    if (srcBruto.startsWith('assets/')) {
        return origem + '/' + srcBruto;
    }

    // Qualquer outra coisa: tenta anexar na raiz
    return origem + '/' + srcBruto.replace(/^\.\//, '');
}

// ========== FUNÇÃO PRINCIPAL - ADICIONAR AO CARRINHO ==========
window.adicionarAoCarrinho = function (produto) {
    console.log('🎯 ADICIONANDO PRODUTO:', produto);

    // Recarregar carrinho do localStorage
    carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    // Validar produto
    if (!produto || !produto.id) {
        console.error('❌ Produto inválido:', produto);
        return false;
    }

    // Normalizar imagem
    const imagemCorrigida = normalizarImagem(produto.imagem || produto.imagen);

    console.log('🖼️ IMAGEM NORMALIZADA:', imagemCorrigida);

    const produtoFormatado = {
        id: produto.id,
        produtoId: produto.produtoId || null, // id inteiro do backend (p/ checkout)
        nome: produto.nome || produto.none || 'Produto sem nome',
        preco: Number(produto.preco) || 0,
        imagem: imagemCorrigida,
        quantidade: 1
    };

    // Verificar se já existe no carrinho
    const produtoExistente = carrinho.find(item => item.id === produtoFormatado.id);

    if (produtoExistente) {
        produtoExistente.quantidade += 1;
        console.log('📈 Quantidade aumentada para:', produtoExistente.quantidade);
    } else {
        carrinho.push(produtoFormatado);
        console.log('🆕 Novo produto adicionado:', produtoFormatado.nome);
    }

    // Salvar
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    console.log('💾 Carrinho salvo:', carrinho);

    // Atualizar contador e notificação
    atualizarContadorCarrinho();
    mostrarNotificacao('✅ ' + produtoFormatado.nome + ' adicionado ao carrinho!');

    return true;
};

// ========== CONTADOR NO ÍCONE ==========
function atualizarContadorCarrinho() {
    carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const totalItens = carrinho.reduce(
        (total, item) => total + (item.quantidade || 1),
        0
    );

    console.log('🔢 Total de itens no carrinho:', totalItens);

    const contadores = document.querySelectorAll('.contador-carrinho');
    contadores.forEach(contador => {
        if (contador) {
            contador.textContent = totalItens;
            contador.style.display = totalItens > 0 ? 'flex' : 'none';
        }
    });

    sessionStorage.setItem('ultimaAtualizacaoCarrinho', Date.now());

    return totalItens;
}

// ========== NOTIFICAÇÃO ==========
function mostrarNotificacao(mensagem) {
    const notificacaoExistente = document.querySelector('.notificacao-carrinho');
    if (notificacaoExistente) {
        notificacaoExistente.remove();
    }

    const notificacao = document.createElement('div');
    notificacao.className = 'notificacao-carrinho';
    notificacao.textContent = mensagem;

    document.body.appendChild(notificacao);

    setTimeout(() => {
        if (notificacao.parentNode) {
            notificacao.remove();
        }
    }, 3000);
}

// ========== UTILITÁRIOS ==========
window.obterCarrinho = function () {
    return JSON.parse(localStorage.getItem('carrinho')) || [];
};

window.limparCarrinho = function () {
    carrinho = [];
    localStorage.setItem('carrinho', JSON.stringify([]));
    atualizarContadorCarrinho();
    console.log('🗑️ Carrinho limpo!');
};

window.removerDoCarrinho = function (idProduto) {
    carrinho = carrinho.filter(item => item.id !== idProduto);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContadorCarrinho();
    console.log('❌ Produto removido:', idProduto);
};

// ========== MENU LATERAL ==========
window.abrirMenu = function () {
    const menuLateral = document.getElementById('menu-lateral');
    const overlay = document.querySelector('.overlay');
    if (menuLateral && overlay) {
        menuLateral.classList.add('ativo');
        overlay.classList.add('ativo');
        document.body.style.overflow = 'hidden';
    }
};

window.fecharMenu = function () {
    const menuLateral = document.getElementById('menu-lateral');
    const overlay = document.querySelector('.overlay');
    if (menuLateral && overlay) {
        menuLateral.classList.remove('ativo');
        overlay.classList.remove('ativo');
        document.body.style.overflow = '';
    }
};

window.abrirFluxoNegativo = function () {
    alert('Sistema de ajuda - Em desenvolvimento');
};

// ========== SINCRONIZAÇÃO ENTRE ABAS ==========
window.addEventListener('storage', function (e) {
    if (e.key === 'carrinho') {
        console.log('🔄 Carrinho atualizado em outra aba, sincronizando...');
        carrinho = JSON.parse(e.newValue) || [];
        atualizarContadorCarrinho();
    }
});

setInterval(() => {
    const ultimaAtualizacao = sessionStorage.getItem('ultimaAtualizacaoCarrinho');
    if (ultimaAtualizacao) {
        atualizarContadorCarrinho();
    }
}, 1000);

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Página carregada - Inicializando carrinho');
    carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    atualizarContadorCarrinho();

    console.log('✅ adicionarAoCarrinho disponível:', typeof window.adicionarAoCarrinho);
    console.log('📦 Itens no carrinho:', carrinho.length);
    console.log('🔍 Detalhes do carrinho:', carrinho);
});

// Exportar
window.atualizarContadorCarrinho = atualizarContadorCarrinho;
window.mostrarNotificacao = mostrarNotificacao;

// ========== COMPRAR AGORA (rota direta, estilo Mercado Livre) ==========
// Adiciona o produto ao carrinho e leva direto ao checkout.
// Se não estiver logado, manda para o login e volta para finalizar.
window.comprarAgora = function (produto) {
    const ok = window.adicionarAoCarrinho(produto);
    if (ok === false) {
        mostrarNotificacao('❌ Não foi possível adicionar o produto.');
        return;
    }
    if (window.BulbeAPI && window.BulbeAPI.estaLogado()) {
        window.location.href = './lead.html';
    } else {
        localStorage.setItem('redirecionarApos', './lead.html');
        window.location.href = './usuario.html';
    }
};
