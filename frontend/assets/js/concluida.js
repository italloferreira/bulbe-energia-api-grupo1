

class PaginaConcluida {
    constructor() {
        this.init();
    }

    init() {
        console.log('🎉 Página de compra concluída inicializada!');
        this.setupAnimacoes();
        this.setupInteracoes();
        this.gerarDadosPedido();
    }

    setupAnimacoes() {
        // Animação de entrada dos elementos
        setTimeout(() => {
            const elementos = document.querySelectorAll('.sucesso-icone, .titulo-concluida, .mensagem-confirmacao, .resumo-pedido, .botoes-acao');
            
            elementos.forEach((elemento, index) => {
                setTimeout(() => {
                    elemento.style.opacity = '0';
                    elemento.style.transform = 'translateY(20px)';
                    elemento.style.transition = 'all 0.6s ease';
                    
                    setTimeout(() => {
                        elemento.style.opacity = '1';
                        elemento.style.transform = 'translateY(0)';
                    }, 100);
                }, index * 200);
            });
        }, 500);
    }

    setupInteracoes() {
        // Efeitos hover nos botões
        const botoes = document.querySelectorAll('.btn-voltar-home, .btn-acompanhar-pedido');
        
        botoes.forEach(botao => {
            botao.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });

            botao.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });

        // Copiar número do pedido
        this.setupCopiarNumeroPedido();
    }

    setupCopiarNumeroPedido() {
        const numeroPedido = document.querySelector('.valor');
        
        if (numeroPedido) {
            numeroPedido.style.cursor = 'pointer';
            numeroPedido.title = 'Clique para copiar';
            
            numeroPedido.addEventListener('click', () => {
                const texto = numeroPedido.textContent;
                navigator.clipboard.writeText(texto).then(() => {
                    this.mostrarNotificacao('Número do pedido copiado!', 'success');
                }).catch(err => {
                    console.error('Erro ao copiar:', err);
                });
            });
        }
    }

    // concluida.js - ATUALIZADO COM DADOS DA COMPRA

gerarDadosPedido() {
    // Tentar pegar dados da compra do localStorage
    const dadosCompra = JSON.parse(localStorage.getItem('ultimaCompra'));
    
    if (dadosCompra) {
        // Usar dados da compra real
        const elementoNumero = document.querySelectorAll('.info-pedido .valor')[0];
        const elementoData = document.querySelectorAll('.info-pedido .valor')[1];
        const elementoPagamento = document.querySelectorAll('.info-pedido .valor')[2];
        const elementoEntrega = document.querySelectorAll('.info-pedido .valor')[3];
        
        if (elementoNumero) elementoNumero.textContent = `#${dadosCompra.numeroPedido}`;
        if (elementoData) elementoData.textContent = new Date(dadosCompra.data).toLocaleDateString('pt-BR');
        if (elementoPagamento) {
            const metodo = dadosCompra.metodoPagamento;
            elementoPagamento.textContent = metodo === 'pix' ? 'PIX' : 
                                          metodo === 'cartao' ? 'Cartão de Crédito' : 
                                          metodo === 'boleto' ? 'Boleto' : 'PIX';
        }
        if (elementoEntrega) {
            const envio = dadosCompra.tipoEnvio;
            elementoEntrega.textContent = envio === 'expresso' ? '1-2 dias úteis' : '5-7 dias úteis';
        }
        
        // INTEGRAÇÃO: exibe o QR Code PIX gerado pelo backend (se houver)
        if (dadosCompra.pix && dadosCompra.pix.qrCodeUrl) {
            const resumo = document.querySelector('.resumo-pedido');
            if (resumo && !document.getElementById('pix-bloco')) {
                const bloco = document.createElement('div');
                bloco.id = 'pix-bloco';
                bloco.style.cssText = 'margin-top:18px;padding:18px;background:#f8f9ff;border-radius:12px;text-align:center;';
                bloco.innerHTML =
                    '<h3 style="color:#08068D;margin-bottom:10px;">Pague com PIX</h3>' +
                    '<img src="' + dadosCompra.pix.qrCodeUrl + '" alt="QR Code PIX" style="width:200px;height:200px;border-radius:8px;">' +
                    '<p style="margin-top:10px;font-weight:600;">Valor: R$ ' + Number(dadosCompra.pix.valor || 0).toFixed(2) + '</p>' +
                    '<p style="font-size:12px;color:#536679;margin-top:6px;">PIX copia e cola:</p>' +
                    '<textarea readonly style="width:100%;max-width:340px;height:60px;margin-top:6px;font-size:11px;border:1px solid #ddd;border-radius:8px;padding:8px;">' +
                    (dadosCompra.pix.pixCopiaECola || '') + '</textarea>';
                resumo.appendChild(bloco);
            }
        }

        // Limpar dados do localStorage após usar
        localStorage.removeItem('ultimaCompra');
    } else {
        // Dados padrão caso não tenha dados no localStorage
        const numeroPedido = `#BULBE-${Date.now().toString().slice(-6)}`;
        const elementosValor = document.querySelectorAll('.info-pedido .valor');
        
        if (elementosValor[0]) elementosValor[0].textContent = numeroPedido;
        if (elementosValor[1]) elementosValor[1].textContent = new Date().toLocaleDateString('pt-BR');
    }
}
    mostrarNotificacao(mensagem, tipo = 'info') {
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao notificacao-${tipo}`;
        notificacao.textContent = mensagem;
        
        Object.assign(notificacao.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: tipo === 'error' ? '#f44336' : tipo === 'success' ? '#26D07C' : '#2196F3',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        document.body.appendChild(notificacao);
        
        setTimeout(() => {
            notificacao.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notificacao.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notificacao.parentNode) {
                    notificacao.parentNode.removeChild(notificacao);
                }
            }, 300);
        }, 3000);
    }
}

// Função global para acompanhar pedido
function acompanharPedido() {
    const numeroPedido = document.querySelector('.info-pedido .valor').textContent;
    alert(`Você será redirecionado para acompanhar o pedido: ${numeroPedido}`);
    // Aqui você pode redirecionar para a página de acompanhamento
}

// INICIALIZAR TUDO
document.addEventListener('DOMContentLoaded', function() {
    const paginaConcluida = new PaginaConcluida();
    console.log('✅ Página de compra concluída carregada com sucesso!');
    
    // Adicionar estilos de cursor pointer
    const style = document.createElement('style');
    style.textContent = `
        .btn-voltar-home { cursor: pointer !important; }
        .btn-acompanhar-pedido { cursor: pointer !important; }
        .btn-abrir-menu { cursor: pointer !important; }
        .info-pedido .valor:hover { opacity: 0.8; }
    `;
    document.head.appendChild(style);
});