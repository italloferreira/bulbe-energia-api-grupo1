/* barrapesquisa.js — busca de produtos.
   Usa a API real (/api/v1/produtos?search=) quando disponível,
   com fallback para uma lista local. */

(function () {
  const input = document.querySelector(".conteiner-pesquisa input");
  const dropdown = document.querySelector(".dropdown-pesquisa");

  if (!input) return;

  // Move o dropdown para o body para evitar herança de transform/overflow de pais
  if (dropdown) document.body.appendChild(dropdown);

  window.addEventListener('scroll', esconder, { passive: true });

  const isPages = window.location.pathname.includes('/pages/');
  const base    = isPages ? '../assets/img/produtos/' : './assets/img/produtos/';
  const paginaProduto = isPages ? './produtos.html' : './pages/produtos.html';

  const produtosFallback = [
    { nome: "Lâmpada Super Bulbo LED",        preco: "R$ 99,90",  img: base + "lampada4.png" },
    { nome: "Cadeira 4 Pernas Forro Branco",   preco: "R$ 35,80",  img: base + "cadeira.png"  },
    { nome: "Abajur Base de Cobre Luxo Puro",  preco: "R$ 15,75",  img: base + "abajur.png"   },
    { nome: "Mesa de Truco Preta Ultra Resistente", preco: "R$ 21,90", img: base + "mesa.png" },
    { nome: "Cama King Size Ultra Conforto",   preco: "R$ 135,80", img: base + "cama.png"     },
    { nome: "Aspirador de casa Ultra Potente", preco: "R$ 235,80", img: base + "aspirador.png"},
    { nome: "Aquecedor Smart Hot",             preco: "R$ 85,90",  img: base + "aquecedor.png"},
    { nome: "Sofá Cinza 4 lugares",            preco: "R$ 3500,80",img: base + "sofa.png"     },
    { nome: "Monitor Gamer",                   preco: "R$ 799,90", img: base + "monitor.png"  },
    { nome: "Teclado Mecânico",                preco: "R$ 249,90", img: base + "teclado.png"  },
    { nome: "Mouse Gamer",                     preco: "R$ 149,90", img: base + "mouse.png"    },
    { nome: "Notebook Gamer",                  preco: "R$ 4999,90",img: base + "notbook.png"  },
    { nome: "Cafeteira Expresso",              preco: "R$ 399,90", img: base + "cafeteira.png"},
    { nome: "Lavadora de Roupas",              preco: "R$ 1299,90",img: base + "lavadora.png" },
  ];

  function normalizar(str) {
    return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  function esconder() {
    if (dropdown) dropdown.style.display = "none";
  }

  function resolverUrlAbsoluto(relativo) {
    const a = document.createElement('a');
    a.href = relativo;
    return a.href;
  }

  function irParaProduto(produto) {
    localStorage.setItem('produtoSelecionado', JSON.stringify({
      nome: produto.nome,
      imagem: resolverUrlAbsoluto(produto.img),
      preco: produto.preco || ''
    }));
    window.location.href = paginaProduto;
  }

  function posicionarDropdown() {
    const rect = input.getBoundingClientRect();
    dropdown.style.position = 'fixed';
    dropdown.style.top    = rect.bottom + 'px';
    dropdown.style.left   = rect.left + 'px';
    dropdown.style.width  = rect.width + 'px';
    dropdown.style.zIndex = '9999';
  }

  function renderResultados(resultados) {
    if (!dropdown) return;

    posicionarDropdown();

    if (!resultados.length) {
      dropdown.innerHTML = `<p class="dropdown-vazio">Nenhum produto encontrado...</p>`;
      dropdown.style.display = "block";
      return;
    }

    dropdown.innerHTML = "";
    resultados.forEach(produto => {
      const item = document.createElement("div");
      item.classList.add("dropdown-item");
      item.innerHTML = `
        <img src="${produto.img}" alt="${produto.nome}">
        <p>${produto.nome}</p>
      `;
      item.onclick = () => irParaProduto(produto);
      dropdown.appendChild(item);
    });

    dropdown.style.display = "flex";
  }

  async function buscar(texto) {
    const textoNorm = normalizar(texto);

    if (window.BulbeAPI) {
      try {
        const lista = await BulbeAPI.listarProdutos(texto);
        const arr = Array.isArray(lista) ? lista : (lista.produtos || []);
        if (arr.length) {
          return arr.map(p => ({
            nome: p.nome,
            preco: p.preco ? 'R$ ' + p.preco : '',
            img: (p.galeriaImagens && p.galeriaImagens[0]) || base + "lampada.png"
          }));
        }
      } catch (e) { /* cai no fallback */ }
    }

    return produtosFallback.filter(p => normalizar(p.nome).includes(textoNorm));
  }

  let timer = null;
  input.addEventListener("input", () => {
    const texto = input.value.trim();
    if (texto === "") { esconder(); return; }
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const resultados = await buscar(texto);
      renderResultados(resultados);
    }, 250);
  });

  document.addEventListener("click", (e) => {
    const box = document.querySelector(".conteiner-pesquisa");
    const dentroDropdown = dropdown && dropdown.contains(e.target);
    if (box && !box.contains(e.target) && !dentroDropdown) esconder();
  });
})();
