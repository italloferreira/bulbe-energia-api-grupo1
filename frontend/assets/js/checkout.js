const inputCep = document.getElementById("cep");
const dados = JSON.parse(localStorage.getItem('dadosEntrega'));

if (inputCep && dados) {
    inputCep.textContent = dados.cep;
}

class Checkout {
    constructor() {
        this.cupomAplicado = false;
        this.codigoCupomAtual = '';
        this.descontoAtual = 0;
        this.freteAtual = 0;
        this.subtotal = 93.90; // VAI SER ATUALIZADO PELO CARRINHO
        this.tempoRestante = 900;
        this.timerInterval = null;
        this.init();
    }

    init() {
        console.log('🎯 Iniciando sistema de checkout...');
        this.carregarProdutosDoCarrinho(); // SÓ ISSO QUE ADICIONEI
        this.setupOpcoesEnvio();
        this.setupMetodosPagamento();
        this.setupCupom();
        this.setupFinalizarCompra();
        this.setupModalPix();
        this.setupSeletorCep();
        this.selecionarPrimeiraOpcaoEnvio();
        this.atualizarResumo();
    }

    // SÓ ADICIONEI ESTA FUNÇÃO - CARREGA PRODUTOS DO CARRINHO
    carregarProdutosDoCarrinho() {
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        console.log('🛒 Produtos no carrinho:', carrinho);
        
        if (carrinho.length > 0) {
            // CALCULA SUBTOTAL CORRETO
            this.subtotal = carrinho.reduce((total, produto) => {
                return total + (produto.preco * produto.quantidade);
            }, 0);
            
            console.log('💰 Subtotal calculado:', this.subtotal);
            
            // MOSTRA OS PRODUTOS
            this.mostrarProdutosNoCheckout(carrinho);
        }
    }

    // SÓ ADICIONEI ESTA FUNÇÃO - MOSTRA PRODUTOS NA TELA
    mostrarProdutosNoCheckout(carrinho) {
        const produtoSection = document.querySelector('.produto-section');
        if (!produtoSection) return;

        produtoSection.innerHTML = '';

        carrinho.forEach((produto, index) => {
            const precoTotal = produto.preco * produto.quantidade;
            
            // CORRIGE CAMINHO DA IMAGEM
            let imagemCorrigida = produto.imagem;
            if (imagemCorrigida && imagemCorrigida.startsWith('./')) {
                imagemCorrigida = '..' + imagemCorrigida.substring(1);
            }
            
            const produtoElement = document.createElement('div');
            produtoElement.className = 'produto-completo';
            produtoElement.innerHTML = `
                <div class="produto-imagem">
                    <img src="${imagemCorrigida}" alt="${produto.nome}" class="foto-produto" 
                         onerror="this.src='../assets/img/produtos/sem-imagem.jpg'">
                </div>
                <div class="produto-info">
                    <div class="produto-header">
                        <h1>${produto.nome}</h1>
                        <p class="produto-descricao">Quantidade: ${produto.quantidade}</p>
                        <div class="produto-preco-marca">
                            <span class="preco-atual">R$ ${precoTotal.toFixed(2)}</span>
                            <span class="marca-produto">(R$ ${produto.preco.toFixed(2)} cada)</span>
                        </div>
                    </div>
                </div>
            `;
            
            produtoSection.appendChild(produtoElement);
            
            if (index < carrinho.length - 1) {
                const divisor = document.createElement('div');
                divisor.className = 'divisor';
                produtoSection.appendChild(divisor);
            }
        });
    }

    // ----------------------------
    // DAQUI PRA BAIXO É TUDO IGUAL 
    // NÃO MEXI EM NADA!
    // ----------------------------

    // SELETOR DE CEP
    setupSeletorCep() {
        const selectCep = document.querySelector('.select-cep');
        
        if (selectCep) {
            selectCep.addEventListener('change', (e) => {
                const cepSelecionado = e.target.value;
                console.log(`📍 CEP selecionado: ${cepSelecionado}`);
                this.mostrarNotificacao(`CEP ${cepSelecionado} selecionado`);
            });

           
            selectCep.addEventListener('focus', () => {
                selectCep.style.boxShadow = '0 0 0 2px rgba(8, 6, 141, 0.2)';
            });

            selectCep.addEventListener('blur', () => {
                selectCep.style.boxShadow = 'none';
            });
        }
    }

    // ATUALIZAR RESUMO DO PEDIDO
    atualizarResumo() {
        const valorSubtotal = document.querySelector('.valor-subtotal');
        const valorFrete = document.querySelector('.valor-frete');
        const valorTotal = document.querySelector('.valor-total');
        const descontoLinha = document.querySelector('.desconto-linha');

        if (valorSubtotal) {
            valorSubtotal.textContent = `R$ ${this.subtotal.toFixed(2)}`;
        }

        if (valorFrete) {
            valorFrete.textContent = `R$ ${this.freteAtual.toFixed(2)}`;
        }

        let total = this.subtotal + this.freteAtual;
        
        if (this.cupomAplicado) {
            const desconto = total * this.descontoAtual;
            total -= desconto;
            
            if (descontoLinha) {
                descontoLinha.style.display = 'flex';
                const valorDesconto = descontoLinha.querySelector('.valor-desconto');
                if (valorDesconto) {
                    valorDesconto.textContent = `-R$ ${desconto.toFixed(2)}`;
                }
            }
        } else {
            if (descontoLinha) {
                descontoLinha.style.display = 'none';
            }
        }

        if (valorTotal) {
            valorTotal.textContent = `R$ ${total.toFixed(2)}`;
            this.animarAtualizacaoTotal();
        }
    }

    animarAtualizacaoTotal() {
        const totalElement = document.querySelector('.valor-total');
        if (totalElement) {
            totalElement.style.transform = 'scale(1.1)';
            totalElement.style.color = '#08068D';
            setTimeout(() => {
                totalElement.style.transform = 'scale(1)';
                totalElement.style.color = '#08068D';
            }, 300);
        }
    }

    // OPÇÕES DE ENVIO
    setupOpcoesEnvio() {
        const opcoesEnvio = document.querySelectorAll('.envio-opcao');
        
        opcoesEnvio.forEach(opcao => {
            opcao.addEventListener('click', (e) => {
                e.preventDefault();
                const tipoEnvio = opcao.dataset.envio;
                console.log(`🚚 Opção de envio clicada: ${tipoEnvio}`);
                
                this.selecionarOpcaoEnvio(opcao, tipoEnvio);
            });

            opcao.addEventListener('mouseenter', () => {
                if (!opcao.classList.contains('ativo')) {
                    opcao.style.transform = 'translateY(-2px)';
                    opcao.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }
            });

            opcao.addEventListener('mouseleave', () => {
                if (!opcao.classList.contains('ativo')) {
                    opcao.style.transform = 'translateY(0)';
                    opcao.style.boxShadow = 'none';
                }
            });
        });
    }

    selecionarOpcaoEnvio(opcaoSelecionada, tipoEnvio) {
        const todasOpcoes = document.querySelectorAll('.envio-opcao');
        
        todasOpcoes.forEach(opcao => {
            opcao.classList.remove('ativo');
            opcao.style.background = '#fff';
            opcao.style.borderColor = '#e0e0e0';
            const radioCircle = opcao.querySelector('.radio-circle');
            if (radioCircle) {
                radioCircle.style.background = '#fff';
                radioCircle.style.borderColor = '#ddd';
            }
        });
        
        opcaoSelecionada.classList.add('ativo');
        opcaoSelecionada.style.background = '#f8f9ff';
        opcaoSelecionada.style.borderColor = '#08068D';
        
        const radioCircle = opcaoSelecionada.querySelector('.radio-circle');
        if (radioCircle) {
            radioCircle.style.background = '#08068D';
            radioCircle.style.borderColor = '#08068D';
        }
        
        this.freteAtual = tipoEnvio === 'expresso' ? 15.90 : 0.00;
        this.atualizarResumo();
        
        const nomeEnvio = tipoEnvio === 'expresso' ? 'Expressa' : 'Padrão';
        this.mostrarNotificacao(`Entrega ${nomeEnvio} selecionada`);
    }

    selecionarPrimeiraOpcaoEnvio() {
        setTimeout(() => {
            const primeiraOpcao = document.querySelector('.envio-opcao[data-envio="padrao"]');
            if (primeiraOpcao && !document.querySelector('.envio-opcao.ativo')) {
                this.selecionarOpcaoEnvio(primeiraOpcao, 'padrao');
            }
        }, 500);
    }

    // MÉTODOS DE PAGAMENTO
    setupMetodosPagamento() {
        const metodos = document.querySelectorAll('.metodo');
        
        metodos.forEach(metodo => {
            metodo.addEventListener('click', (e) => {
                e.preventDefault();
                const tipoPagamento = metodo.dataset.metodo;
                console.log(`💳 Método de pagamento clicado: ${tipoPagamento}`);
                
                this.selecionarMetodoPagamento(metodo, tipoPagamento);
            });

            metodo.addEventListener('mouseenter', () => {
                if (!metodo.classList.contains('ativo')) {
                    metodo.style.transform = 'translateY(-2px)';
                    metodo.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }
            });

            metodo.addEventListener('mouseleave', () => {
                if (!metodo.classList.contains('ativo')) {
                    metodo.style.transform = 'translateY(0)';
                    metodo.style.boxShadow = 'none';
                }
            });
        });
    }

    selecionarMetodoPagamento(metodoSelecionado, tipoPagamento) {
        const todosMetodos = document.querySelectorAll('.metodo');
        
        todosMetodos.forEach(metodo => {
            metodo.classList.remove('ativo');
            metodo.style.background = '#fff';
            metodo.style.color = '#536679';
            
            const img = metodo.querySelector('img');
            if (img) {
                if (metodo.dataset.metodo === 'cartao') {
                    img.style.filter = 'brightness(0) saturate(100%) invert(33%) sepia(15%) saturate(1000%) hue-rotate(170deg) brightness(90%) contrast(85%)';
                } else if (metodo.dataset.metodo === 'pix') {
                    img.style.filter = 'brightness(0) saturate(100%) invert(33%) sepia(15%) saturate(1000%) hue-rotate(170deg) brightness(90%) contrast(85%)';
                } else if (metodo.dataset.metodo === 'boleto') {
                    img.style.filter = 'brightness(0) saturate(100%) invert(33%) sepia(15%) saturate(1000%) hue-rotate(170deg) brightness(90%) contrast(85%)';
                }
            }
        });
        
        metodoSelecionado.classList.add('ativo');
        metodoSelecionado.style.background = '#08068D';
        metodoSelecionado.style.color = '#fff';
        
        const img = metodoSelecionado.querySelector('img');
        if (img) {
            img.style.filter = 'brightness(0) invert(1)';
        }
        
        metodoSelecionado.style.transform = 'scale(0.95)';
        setTimeout(() => {
            metodoSelecionado.style.transform = 'scale(1)';
        }, 150);
        
        this.processarMetodoPagamento(tipoPagamento);
    }

    processarMetodoPagamento(tipoPagamento) {
        switch(tipoPagamento) {
            case 'pix':
                this.mostrarNotificacao('PIX selecionado - Clique novamente para ver QR Code');
                break;
            case 'cartao':
                this.mostrarNotificacao('Cartão selecionado - Formulário será aberto');
                break;
            case 'boleto':
                this.mostrarNotificacao('Boleto selecionado - Será gerado em breve');
                break;
        }
    }

    // CUPOM 
    setupCupom() {
        const btnAplicarCupom = document.querySelector('.btn-aplicar-cupom');
        const inputCupom = document.querySelector('#cupom');
        
        if (btnAplicarCupom && inputCupom) {
            btnAplicarCupom.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🎫 Aplicar cupom clicado');
                
                this.aplicarCupom(inputCupom.value);
            });
            
            inputCupom.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.aplicarCupom(inputCupom.value);
                }
            });

            
            inputCupom.placeholder = "Adicione seu cupom";
        }
    }

    async aplicarCupom(codigoCupom) {
        if (!codigoCupom.trim()) {
            this.mostrarNotificacao('Digite um código de cupom', 'error');
            return;
        }

        if (this.cupomAplicado) {
            this.mostrarNotificacao('Cupom já foi aplicado anteriormente', 'info');
            return;
        }

        console.log(`🎫 Aplicando cupom: ${codigoCupom}`);

        // 1) Validação REAL no backend (quando o usuário está logado)
        if (window.BulbeAPI && BulbeAPI.estaLogado()) {
            try {
                const res = await BulbeAPI.validarCupom(codigoCupom.trim(), this.subtotal);
                if (res && res.valido) {
                    this.cupomAplicado = true;
                    this.codigoCupomAtual = res.codigo;
                    if (res.tipo === 'percentual') {
                        this.descontoAtual = res.valor / 100;
                    } else if (res.tipo === 'frete_gratis') {
                        this.descontoAtual = 0;
                        this.freteGratisCupom = true;
                        this.freteAtual = 0;
                    } else {
                        // cupom fixo: converte em fração equivalente sobre o subtotal
                        this.descontoAtual = this.subtotal > 0 ? (res.descontoCalculado / this.subtotal) : 0;
                    }
                    this.atualizarResumo();
                    this.desativarCupom();
                    this.mostrarNotificacao(`🎉 Cupom "${res.codigo}" aplicado!`, 'success');
                    return;
                }
            } catch (err) {
                this.mostrarNotificacao(err.message || 'Cupom inválido', 'error');
                return;
            }
        }

        // 2) Fallback offline (sem login): lista local
        const cuponsValidos = {
            'PRIMEIRA COMPRA': 0.15,
            'BULBE10': 0.1,
            'BULBE20': 0.2,
            'DESCONTO20': 0.2
        };

        const desconto = cuponsValidos[codigoCupom.toUpperCase()];

        if (desconto) {
            this.cupomAplicado = true;
            this.codigoCupomAtual = codigoCupom.toUpperCase();
            this.descontoAtual = desconto;
            this.atualizarResumo();
            this.desativarCupom();

            this.mostrarNotificacao(`🎉 Cupom "${codigoCupom}" aplicado! ${desconto * 100}% de desconto`, 'success');
        } else {
            this.mostrarNotificacao('Cupom inválido', 'error');
        }
    }

    desativarCupom() {
        const btnAplicarCupom = document.querySelector('.btn-aplicar-cupom');
        const inputCupom = document.querySelector('#cupom');
        
        if (btnAplicarCupom) {
            btnAplicarCupom.textContent = 'Cupom Aplicado ✓';
            btnAplicarCupom.classList.add('desativado');
            btnAplicarCupom.disabled = true;
        }
        
        if (inputCupom) {
            inputCupom.disabled = true;
            inputCupom.value = this.codigoCupomAtual;
        }
    }

    // FINALIZAR COMPRA
    setupFinalizarCompra() {
        const btnFinalizar = document.querySelector('.finalizar-compra-btn');
        
        if (btnFinalizar) {
            btnFinalizar.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🛒 Finalizar compra clicado');
                
                this.finalizarCompra();
            });
        }
    }

    finalizarCompra() {
    const metodoAtivo = document.querySelector('.metodo.ativo');
    const envioAtivo = document.querySelector('.envio-opcao.ativo');
    
    if (!metodoAtivo) {
        this.mostrarNotificacao('Selecione um método de pagamento', 'error');
        return;
    }

    if (!envioAtivo) {
        this.mostrarNotificacao('Selecione uma opção de envio', 'error');
        return;
    }

    const metodoPagamento = metodoAtivo.dataset.metodo;
    const tipoEnvio = envioAtivo.dataset.envio;
    
    console.log('✅ Finalizando compra:', { metodoPagamento, tipoEnvio });

    // Se o usuário está logado, cria PEDIDO + PAGAMENTO reais no backend.
    if (window.BulbeAPI && BulbeAPI.estaLogado()) {
        this.enviarPedidoBackend(metodoPagamento, tipoEnvio);
        return;
    }

    // Fallback (visitante não logado): fluxo simulado original.
    const dadosCompra = {
        metodoPagamento: metodoPagamento,
        tipoEnvio: tipoEnvio,
        data: new Date().toISOString(),
        numeroPedido: `BULBE-${Date.now().toString().slice(-6)}`
    };
    localStorage.setItem('ultimaCompra', JSON.stringify(dadosCompra));

    this.simularProcessamento(metodoPagamento, tipoEnvio);
}

    // INTEGRAÇÃO: cria pedido e pagamento PIX reais via API
    async enviarPedidoBackend(metodoPagamento, tipoEnvio) {
        const btnFinalizar = document.querySelector('.finalizar-compra-btn');
        const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

        // Mapeia itens do carrinho -> produtoId inteiro do backend
        const itens = carrinho
            .filter(i => i.produtoId)
            .map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade || 1 }));

        // Sem itens mapeáveis -> mantém o fluxo simulado (não quebra a tela)
        if (!itens.length) {
            this.mostrarNotificacao('Finalizando seu pedido...', 'info');
            const dadosCompra = {
                metodoPagamento, tipoEnvio,
                data: new Date().toISOString(),
                numeroPedido: `BULBE-${Date.now().toString().slice(-6)}`
            };
            localStorage.setItem('ultimaCompra', JSON.stringify(dadosCompra));
            this.simularProcessamento(metodoPagamento, tipoEnvio);
            return;
        }

        // Endereço a partir dos dados de entrega coletados em lead.html
        const dados = JSON.parse(localStorage.getItem('dadosEntrega') || '{}');
        const enderecoEntrega = {
            cep: (dados.cep && dados.cep.replace(/\D/g, '').length === 8) ? dados.cep : '32600-000',
            logradouro: dados.endereco || 'Endereço não informado',
            numero: 'S/N',
            bairro: 'Centro',
            cidade: 'Belo Horizonte',
            estado: 'MG'
        };

        const freteTipo = tipoEnvio === 'expresso' ? 'expressa' : 'padrao';
        const payload = {
            itens,
            enderecoEntrega,
            frete: { tipo: freteTipo, valor: Number(this.freteAtual) || 0 },
            metodoPagamento,
            cupom: this.cupomAplicado ? this.codigoCupomAtual : undefined
        };

        const textoOriginal = btnFinalizar ? btnFinalizar.textContent : '';
        if (btnFinalizar) {
            btnFinalizar.textContent = '⏳ Processando...';
            btnFinalizar.disabled = true;
            btnFinalizar.style.background = '#536679';
            btnFinalizar.style.cursor = 'not-allowed';
        }

        try {
            const pedido = await BulbeAPI.criarPedido(payload);

            const compra = {
                numeroPedido: pedido.id,
                metodoPagamento,
                tipoEnvio,
                data: pedido.criadoEm || new Date().toISOString(),
                total: pedido.resumo ? pedido.resumo.total : null
            };

            // Gera cobrança PIX quando for o método escolhido
            if (metodoPagamento === 'pix') {
                try {
                    const pix = await BulbeAPI.criarPagamentoPix(pedido.id);
                    compra.pix = {
                        pagamentoId: pix.pagamentoId,
                        valor: pix.valor,
                        qrCodeUrl: pix.qrCodeUrl,
                        pixCopiaECola: pix.pixCopiaECola
                    };
                } catch (e) {
                    console.warn('Falha ao gerar PIX:', e.message);
                }
            }

            localStorage.setItem('ultimaCompra', JSON.stringify(compra));
            localStorage.setItem('carrinho', JSON.stringify([])); // limpa carrinho

            this.mostrarNotificacao('🎊 Pedido ' + pedido.id + ' criado com sucesso!', 'success');
            if (btnFinalizar) {
                btnFinalizar.textContent = '✅ Redirecionando...';
                btnFinalizar.style.background = '#26D07C';
            }
            setTimeout(() => { window.location.href = 'concluida.html'; }, 1800);
        } catch (err) {
            console.error('Erro ao criar pedido:', err);
            this.mostrarNotificacao(err.message || 'Erro ao finalizar o pedido', 'error');
            if (btnFinalizar) {
                btnFinalizar.textContent = textoOriginal || 'Finalizar compra';
                btnFinalizar.disabled = false;
                btnFinalizar.style.background = '';
                btnFinalizar.style.cursor = 'pointer';
            }
        }
    }

    // checkout.js - ATUALIZADO COM REDIRECIONAMENTO

simularProcessamento(metodoPagamento, tipoEnvio) {
    const btnFinalizar = document.querySelector('.finalizar-compra-btn');
    const textoOriginal = btnFinalizar.textContent;
    
    btnFinalizar.textContent = '⏳ Processando...';
    btnFinalizar.disabled = true;
    btnFinalizar.style.background = '#536679';
    btnFinalizar.style.cursor = 'not-allowed';
    
    // Simular processamento do pagamento
    setTimeout(() => {
        this.mostrarNotificacao('🎊 Compra realizada com sucesso!', 'success');
        
        btnFinalizar.textContent = '✅ Redirecionando...';
        btnFinalizar.style.background = '#26D07C';
        
        // Redirecionar para a página de compra concluída após 2 segundos
        setTimeout(() => {
            window.location.href = 'concluida.html';
        }, 2000);
        
    }, 3000);
}

    // MODAL PIX
    setupModalPix() {
        const metodoPix = document.querySelector('.metodo[data-metodo="pix"]');
        
        if (metodoPix) {
            let cliqueCount = 0;
            
            metodoPix.addEventListener('click', (e) => {
                e.preventDefault();
                cliqueCount++;
                
                if (cliqueCount === 1) {
                    setTimeout(() => {
                        if (cliqueCount === 1) {
                            this.mostrarModalPix();
                            cliqueCount = 0;
                        }
                    }, 300);
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.fecharModalPix();
            }
        });
    }

    mostrarModalPix() {
        this.criarModalPix();
        
        const modal = document.getElementById('modalPix');
        const overlay = document.querySelector('.overlay') || this.criarOverlay();
        
        if (modal && overlay) {
            modal.classList.add('mostrar');
            overlay.classList.add('mostrar');
            this.iniciarTimerPix();
            this.setupModalEvents(modal, overlay);
        }
    }

    criarOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
        return overlay;
    }

    criarModalPix() {
        if (document.getElementById('modalPix')) return;

        const modal = document.createElement('div');
        modal.id = 'modalPix';
        modal.className = 'modal-pix';
        modal.innerHTML = `
            <div class="modal-conteudo">
                <div class="modal-header">
                    <h3>Pagamento com PIX</h3>
                    <button class="modal-fechar">×</button>
                </div>
                <div class="modal-body">
                    <div class="qrcode-container">
                        <div class="qrcode-placeholder">
                            <span>QR Code PIX</span>
                        </div>
                    </div>
                    <div class="codigo-pix-container">
                        <p class="codigo-pix">bulbe.store-${Date.now().toString().slice(-6)}@pix.com.br</p>
                        <button class="btn-copiar-codigo">
                            <img src="../assets/img/icons/copy.png" alt="Copiar">
                            Copiar Código PIX
                        </button>
                    </div>
                    <div class="instrucoes-pix">
                        <div class="instrucao-item">
                            <div class="numero-instrucao">1</div>
                            <p>Abra seu app de pagamentos</p>
                        </div>
                        <div class="instrucao-item">
                            <div class="numero-instrucao">2</div>
                            <p>Escaneie o QR Code acima</p>
                        </div>
                        <div class="instrucao-item">
                            <div class="numero-instrucao">3</div>
                            <p>Ou copie o código PIX</p>
                        </div>
                        <div class="instrucao-item">
                            <div class="numero-instrucao">4</div>
                            <p>Confirme o pagamento</p>
                        </div>
                    </div>
                    <div class="tempo-restante">
                        <div class="tempo-info">
                            <span class="tempo-texto">Tempo restante</span>
                            <span class="tempo-contador">15:00</span>
                        </div>
                        <div class="barra-tempo">
                            <div class="barra-progresso-tempo"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    iniciarTimerPix() {
        this.tempoRestante = 900;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.atualizarTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.tempoRestante--;
            this.atualizarTimerDisplay();
            
            if (this.tempoRestante <= 0) {
                clearInterval(this.timerInterval);
                this.mostrarNotificacao('Tempo do PIX expirado', 'error');
                this.fecharModalPix();
            }
        }, 1000);
    }

    atualizarTimerDisplay() {
        const tempoContador = document.querySelector('.tempo-contador');
        if (tempoContador) {
            const minutos = Math.floor(this.tempoRestante / 60);
            const segundos = this.tempoRestante % 60;
            tempoContador.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        }
    }

    setupModalEvents(modal, overlay) {
        const fecharBtn = modal.querySelector('.modal-fechar');
        const copiarBtn = modal.querySelector('.btn-copiar-codigo');
        
        const fecharModal = () => {
            this.fecharModalPix();
        };
        
        if (fecharBtn) {
            fecharBtn.addEventListener('click', fecharModal);
        }
        
        if (overlay) {
            overlay.addEventListener('click', fecharModal);
        }
        
        if (copiarBtn) {
            copiarBtn.addEventListener('click', () => {
                this.copiarCodigoPix();
            });
        }
    }

    fecharModalPix() {
        const modal = document.getElementById('modalPix');
        const overlay = document.querySelector('.overlay');
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        if (modal) modal.classList.remove('mostrar');
        if (overlay) overlay.classList.remove('mostrar');
    }

    copiarCodigoPix() {
        const codigoElement = document.querySelector('.codigo-pix');
        const btn = document.querySelector('.btn-copiar-codigo');
        
        if (codigoElement && btn) {
            const codigo = codigoElement.textContent;
            
            navigator.clipboard.writeText(codigo).then(() => {
                const originalText = btn.innerHTML;
                btn.innerHTML = '<img src="../assets/img/icons/check.png" alt="Copiado"> Código Copiado!';
                btn.style.background = 'linear-gradient(135deg, #26D07C, #26D07C)';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = 'linear-gradient(135deg, #08068D, #4a48c5)';
                }, 2000);
                
                this.mostrarNotificacao('Código PIX copiado para a área de transferência!', 'success');
            }).catch(err => {
                console.error('Erro ao copiar código:', err);
                this.mostrarNotificacao('Erro ao copiar código', 'error');
            });
        }
    }

    // NOTIFICAÇÕES
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
        }, 4000);
    }
}

// INICIALIZAR TUDO
document.addEventListener('DOMContentLoaded', function() {
    const checkout = new Checkout();
    console.log('✅ Sistema de checkout inicializado com sucesso!');
    
    const style = document.createElement('style');
    style.textContent = `
        .envio-opcao { cursor: pointer !important; }
        .metodo { cursor: pointer !important; }
        .btn-aplicar-cupom { cursor: pointer !important; }
        .finalizar-compra-btn { cursor: pointer !important; }
        .modal-fechar { cursor: pointer !important; }
        .btn-copiar-codigo { cursor: pointer !important; }
        .select-cep { cursor: pointer !important; }
        .btn-abrir-menu { cursor: pointer !important; }
    `;
    document.head.appendChild(style);
});