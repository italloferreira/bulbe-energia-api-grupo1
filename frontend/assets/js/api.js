/* =====================================================================
   api.js — Camada central de integração com o backend (Bulbe Energia)
   Como o frontend é servido pelo MESMO servidor da API (Express),
   a base é vazia (mesma origem): chamadas vão direto para /api/...
   Carregue este arquivo ANTES dos demais scripts da página.
   ===================================================================== */

window.API_BASE = '';

window.BulbeAPI = (function () {
  const TOKEN_KEY = 'bulbe_token';
  const USER_KEY = 'bulbe_usuario';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || null;
  }

  function getUsuario() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function estaLogado() {
    return !!getToken();
  }

  function salvarSessao(token, usuario) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (usuario) localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Wrapper de fetch: injeta JSON + Authorization e trata erros da API.
  async function request(path, options = {}) {
    const opts = { ...options };
    opts.headers = Object.assign(
      { 'Content-Type': 'application/json' },
      options.headers || {}
    );

    const token = getToken();
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;

    if (opts.body && typeof opts.body !== 'string') {
      opts.body = JSON.stringify(opts.body);
    }

    const resp = await fetch(window.API_BASE + path, opts);

    // 204 No Content
    if (resp.status === 204) return { ok: true, status: 204, data: null };

    let data = null;
    try {
      data = await resp.json();
    } catch (e) {
      data = null;
    }

    if (!resp.ok) {
      const msg = (data && (data.erro || data.message)) || `Erro ${resp.status}`;
      const err = new Error(msg);
      err.status = resp.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  /* ----------------------- Autenticação ----------------------- */
  async function cadastrar(nome, email, senha) {
    return request('/api/v1/usuarios', {
      method: 'POST',
      body: { nome, email, senha }
    });
  }

  async function login(email, senha) {
    const data = await request('/api/v1/login', {
      method: 'POST',
      body: { email, senha }
    });
    if (data && data.token) salvarSessao(data.token, data.usuario);
    return data;
  }

  /* ----------------------- Catálogo ----------------------- */
  function catalogoHome() { return request('/api/v1/catalogo/home'); }
  function listarProdutos(search) {
    const q = search ? ('?search=' + encodeURIComponent(search)) : '';
    return request('/api/v1/produtos' + q);
  }
  function produto(id) { return request('/api/v1/produtos/' + id); }

  /* ----------------------- Frete ----------------------- */
  function calcularFrete(cepDestino, itens) {
    return request('/api/frete/calcular', {
      method: 'POST',
      body: { cep_destino: cepDestino, itens }
    });
  }

  /* ----------------------- Cupom ----------------------- */
  function validarCupom(codigo, subtotal) {
    return request('/api/cupons/validar', {
      method: 'POST',
      body: { codigo, subtotal }
    });
  }

  /* ----------------------- Pedidos / Pagamento ----------------------- */
  function criarPedido(payload) {
    return request('/api/pedidos', { method: 'POST', body: payload });
  }
  function listarPedidos() { return request('/api/pedidos'); }
  function criarPagamentoPix(pedidoId) {
    return request('/api/pagamentos/pix', {
      method: 'POST',
      body: { pedido_id: pedidoId }
    });
  }

  /* ----------------------- Suporte ----------------------- */
  function abrirChamado(assunto, mensagem, usuario, pedidoId) {
    return request('/api/suporte/chamados', {
      method: 'POST',
      body: { assunto, mensagem, usuario, pedido_id: pedidoId || null }
    });
  }

  return {
    getToken, getUsuario, estaLogado, salvarSessao, logout,
    request,
    cadastrar, login,
    catalogoHome, listarProdutos, produto,
    calcularFrete, validarCupom,
    criarPedido, listarPedidos, criarPagamentoPix,
    abrirChamado
  };
})();
