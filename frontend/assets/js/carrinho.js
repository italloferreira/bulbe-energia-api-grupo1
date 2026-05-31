// carrinho.js - desenha o carrinho na tela
document.addEventListener('DOMContentLoaded', () => {
  console.log('🛒 Carrinho (render) carregado');

  const container = document.querySelector('.conteiner-produto');
  const subtotalEl = document.getElementById('subtotal');
  const totalEl = document.getElementById('total');
  const freteEl = document.getElementById('frete');
  const descontoEl = document.getElementById('desconto');
  const valorNovoCard = document.getElementById('valor-novo');
  const totalAntigoEl = document.getElementById('total-antigo');
  const descontoTopoEl = document.getElementById('desconto-topo');        // faixa azul
  const totalCheioTopoEl = document.getElementById('total-sem-desconto'); // "De R$ X por"

  if (!container) return;

  // 💡 Preço CHEIO da lâmpada (sem desconto)
  const PRECO_CHEIO_LAMPADA = 182.03;

  // Identificação da lâmpada
  const ID_LAMPADA = 'lampada-elgin-001';
  const NOME_LAMPADA = 'lâmpada super bulbo';

  function ehLampada(item) {
    if (!item) return false;

    if (item.id === ID_LAMPADA) return true;

    if (item.nome && item.nome.toLowerCase().includes(NOME_LAMPADA)) {
      return true;
    }

    return false;
  }

  function parsePreco(str) {
    if (!str) return 0;
    return parseFloat(
      String(str)
        .replace(/[R$\s]/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
    );
  }

  function formataPreco(num) {
    return num.toFixed(2).replace('.', ',');
  }

  // 🔧 Ajusta o caminho da imagem para a página /pages/carrinho.html
  function corrigirCaminhoImagem(src) {
    if (!src) return '../assets/img/produtos/sem-imagem.jpg';

    if (src.startsWith('http') || src.startsWith('/')) return src;
    if (src.startsWith('../assets/')) return src;
    if (src.startsWith('./assets/')) {
      return '../' + src.slice(2);
    }
    if (src.startsWith('assets/')) {
      return '../' + src;
    }
    return '../' + src.replace(/^\.\//, '');
  }

  function carregarCarrinho() {
    let carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');

    // Compatibilidade com "compra"/"produto" antigo
    if (!carrinho.length) {
      const legadoJSON =
        localStorage.getItem('compra') || localStorage.getItem('produto');

      if (legadoJSON) {
        try {
          const legado = JSON.parse(legadoJSON);
          carrinho = [
            {
              id: legado.id || ID_LAMPADA,
              nome: legado.nomeProduto || legado.nome || 'Produto',
              preco: parsePreco(legado.valorFinal), // já com desconto
              imagem: corrigirCaminhoImagem(
                legado.imgProduto ||
                  legado.imagem ||
                  '../assets/img/produtos/lampada.png'
              ),
              quantidade: 1
            }
          ];
          localStorage.setItem('carrinho', JSON.stringify(carrinho));
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      carrinho = carrinho.map(item => ({
        ...item,
        imagem: corrigirCaminhoImagem(item.imagem)
      }));
      localStorage.setItem('carrinho', JSON.stringify(carrinho));
    }

    return carrinho;
  }

  let carrinho = carregarCarrinho();

  function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
  }

  // 🔥 Atualiza subtotal (preço atual), total CHEIO e desconto Bulbe
  function atualizarResumo() {
    let subtotal = 0;          // soma dos preços atuais (com desconto)
    let totalCheio = 0;        // soma como se NADA tivesse desconto
    let descontoBulbe = 0;     // economia total só nas lâmpadas

    carrinho.forEach(item => {
      const qtd = item.quantidade || 1;
      const precoAtual = item.preco;

      // valor que o cliente paga hoje
      subtotal += precoAtual * qtd;

      if (ehLampada(item)) {
        // preço que seria SEM desconto
        totalCheio += PRECO_CHEIO_LAMPADA * qtd;

        // economia por lâmpada
        const descontoUnit = Math.max(PRECO_CHEIO_LAMPADA - precoAtual, 0);
        descontoBulbe += descontoUnit * qtd;
      } else {
        // outros produtos: preço cheio = preço atual
        totalCheio += precoAtual * qtd;
      }
    });

    const frete = 0;
    const totalCalculado = subtotal; // 👉 total não mexe com desconto Bulbe

    // Atualiza campos
    if (freteEl) freteEl.textContent = `R$ ${formataPreco(frete)}`;
    if (subtotalEl) subtotalEl.textContent = `R$ ${formataPreco(subtotal)}`;
    if (totalEl) totalEl.textContent = `R$ ${formataPreco(totalCalculado)}`;
    if (valorNovoCard)
      valorNovoCard.textContent = formataPreco(totalCalculado);

    // Linha "Valor total" embaixo – valor antigo (cheio) riscado
    if (totalAntigoEl) {
      totalAntigoEl.textContent =
        totalCheio > 0 ? `R$ ${formataPreco(totalCheio)}` : 'R$ 0,00';
    }

    // Texto "De R$ X por" no card de cima
    if (totalCheioTopoEl) {
      totalCheioTopoEl.textContent =
        totalCheio > 0 ? `R$ ${formataPreco(totalCheio)}` : 'R$ 0,00';
    }

    // Desconto Bulbe (economia) – faixa azul + bloco resumo
    const textoDesconto = `R$ ${formataPreco(descontoBulbe)}`;

    if (descontoEl) {
      descontoEl.textContent = textoDesconto;
    }
    if (descontoTopoEl) {
      descontoTopoEl.textContent = textoDesconto;
    }

    console.log('Resumo => subtotal:', subtotal, 'totalCheio:', totalCheio, 'descontoBulbe:', descontoBulbe);
  }

  function renderCarrinho() {
    container.innerHTML = '';

    if (!carrinho.length) {
      container.innerHTML =
        '<p style="padding:8px 0;color:#777;">Seu carrinho está vazio.</p>';

      if (subtotalEl) subtotalEl.textContent = 'R$ 0,00';
      if (totalEl) totalEl.textContent = 'R$ 0,00';
      if (valorNovoCard) valorNovoCard.textContent = '0,00';
      if (totalAntigoEl) totalAntigoEl.textContent = 'R$ 0,00';
      if (freteEl) freteEl.textContent = 'R$ 0,00';
      if (descontoEl) descontoEl.textContent = 'R$ 0,00';
      if (descontoTopoEl) descontoTopoEl.textContent = 'R$ 0,00';
      if (totalCheioTopoEl) totalCheioTopoEl.textContent = 'R$ 0,00';

      return;
    }

    carrinho.forEach((item) => {
      const qtd = item.quantidade || 1;
      const totalItem = item.preco * qtd;
      const imagemRender = corrigirCaminhoImagem(item.imagem);

      const div = document.createElement('div');
      div.className = 'produto';
      div.dataset.id = item.id;

      div.innerHTML = `
        <img src="${imagemRender}" alt="${item.nome}">
        <div class="info-produto">
          <p class="nome" title="${item.nome}">${item.nome}</p>
          <p class="preco-antigo-prod"></p>
          <div class="quantidade">
            <button class="menos" type="button">-</button>
            <div class="campo">${qtd}</div>
            <button class="mais" type="button">+</button>
          </div>
        </div>
        <div class="coluna-direita">
          <button class="remover" type="button">
            <img src="../assets/img/produtos/trash-01.png"
                 alt="Remover"
                 class="icon-trash">
          </button>
          <p class="preco">R$ <span class="valor">${formataPreco(
            totalItem
          )}</span></p>
        </div>
      `;
      container.appendChild(div);
    });

    atualizarResumo();
  }

  // Eventos (+, -, remover)
  container.addEventListener('click', (e) => {
    const prodEl = e.target.closest('.produto');
    if (!prodEl) return;

    const id = prodEl.dataset.id;
    const item = carrinho.find((p) => p.id === id);
    if (!item) return;

    if (e.target.classList.contains('mais')) {
      item.quantidade = (item.quantidade || 1) + 1;
      salvarCarrinho();
      renderCarrinho();
    } else if (e.target.classList.contains('menos')) {
      item.quantidade = Math.max((item.quantidade || 1) - 1, 1);
      salvarCarrinho();
      renderCarrinho();
    } else if (e.target.closest('.remover')) {
      carrinho = carrinho.filter((p) => p.id !== id);
      salvarCarrinho();
      renderCarrinho();
    }
  });

  renderCarrinho();
});
