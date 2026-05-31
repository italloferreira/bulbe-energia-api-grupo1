/* barrapesquisa.js — busca de produtos.
   Usa a API real (/api/v1/produtos?search=) quando disponível,
   com fallback para uma lista local. Caminhos absolutos para
   funcionar tanto na home (/) quanto nas páginas (/pages/...). */

(function () {
  const input = document.querySelector(".conteiner-pesquisa input");
  const dropdown = document.querySelector(".dropdown-pesquisa");

  // Se a página não tem barra de pesquisa, não faz nada (evita erros).
  if (!input) return;

  const produtosFallback = [
    { id: 1, nome: "Lâmpada Super Bulbo LED", preco: "R$ 99,90", pagina: "/pages/produtos.html", img: "/assets/img/produtos/lampada4.png" },
    { id: 3, nome: "Cadeira 4 Pernas Forro Branco", preco: "R$ 15,75", pagina: "/pages/produtos.html", img: "/assets/img/produtos/cadeira.png" },
    { id: 2, nome: "Abajur Base de Cobre", preco: "R$ 35,80", pagina: "/pages/produtos.html", img: "/assets/img/produtos/abajur.png" }
  ];

  function esconder() {
    if (dropdown) dropdown.style.display = "none";
  }

  function renderResultados(resultados) {
    if (!dropdown) return;

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
      item.onclick = () => (window.location.href = produto.pagina);
      dropdown.appendChild(item);
    });

    dropdown.style.display = "flex";
  }

  async function buscar(texto) {
    // 1) Tenta a API real
    if (window.BulbeAPI) {
      try {
        const lista = await BulbeAPI.listarProdutos(texto);
        const arr = Array.isArray(lista) ? lista : (lista.produtos || []);
        return arr.map(p => ({
          id: p.id,
          nome: p.nome,
          pagina: "/pages/produtos.html",
          img: (p.galeriaImagens && p.galeriaImagens[0]) || "/assets/img/produtos/lampada.png"
        }));
      } catch (e) {
        // cai no fallback
      }
    }
    // 2) Fallback local
    return produtosFallback.filter(p =>
      p.nome.toLowerCase().includes(texto.toLowerCase())
    );
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
    if (box && !box.contains(e.target)) esconder();
  });
})();
