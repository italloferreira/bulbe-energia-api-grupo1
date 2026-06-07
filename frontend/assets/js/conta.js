/* conta.js — controla login, cadastro, exibição da conta e pedidos */
document.addEventListener('DOMContentLoaded', function () {
  const areaDeslogado = document.getElementById('area-deslogado');
  const areaLogado = document.getElementById('area-logado');

  function render() {
    if (window.BulbeAPI && BulbeAPI.estaLogado()) {
      // Se o usuário veio do carrinho para logar, volta para finalizar a compra.
      const destino = localStorage.getItem('redirecionarApos');
      if (destino) {
        localStorage.removeItem('redirecionarApos');
        window.location.href = destino;
        return;
      }
      const u = BulbeAPI.getUsuario() || {};
      areaDeslogado.style.display = 'none';
      areaLogado.style.display = 'block';
      const elNome = document.getElementById('conta-nome');
      const elEmail = document.getElementById('conta-email');
      if (elNome) elNome.textContent = u.nome || 'Cliente Bulbe';
      if (elEmail) elEmail.textContent = u.email || '';
      carregarPedidos();
    } else {
      areaDeslogado.style.display = 'block';
      areaLogado.style.display = 'none';
    }
  }

  // ---- Abas Login / Cadastro ----
  const tabs = document.querySelectorAll('.auth-tab');
  const formLogin = document.getElementById('form-login');
  const formCadastro = document.getElementById('form-cadastro');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('ativo'));
      tab.classList.add('ativo');
      const alvo = tab.dataset.tab;
      formLogin.style.display = alvo === 'login' ? 'flex' : 'none';
      formCadastro.style.display = alvo === 'cadastro' ? 'flex' : 'none';
    });
  });

  function msg(el, texto, tipo) {
    if (!el) return;
    el.textContent = texto;
    el.className = 'auth-msg ' + (tipo || '');
  }

  // ---- Login ----
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const senha = document.getElementById('login-senha').value;
      const m = document.getElementById('login-msg');
      if (!email || !senha) { msg(m, 'Preencha e-mail e senha.', 'erro'); return; }
      msg(m, 'Entrando...', '');
      try {
        await BulbeAPI.login(email, senha);
        msg(m, 'Login realizado!', 'ok');
        render();
      } catch (err) {
        msg(m, err.message || 'Falha no login.', 'erro');
      }
    });
  }

  // ---- Cadastro ----
  if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = document.getElementById('cad-nome').value.trim();
      const email = document.getElementById('cad-email').value.trim();
      const senha = document.getElementById('cad-senha').value;
      const m = document.getElementById('cad-msg');
      if (!nome || !email || !senha) { msg(m, 'Preencha todos os campos.', 'erro'); return; }
      if (senha.length < 6) { msg(m, 'A senha deve ter ao menos 6 caracteres.', 'erro'); return; }
      msg(m, 'Criando conta...', '');
      try {
        await BulbeAPI.cadastrar(nome, email, senha);
        // já loga em seguida
        await BulbeAPI.login(email, senha);
        msg(m, 'Conta criada com sucesso!', 'ok');
        render();
      } catch (err) {
        msg(m, err.message || 'Falha no cadastro.', 'erro');
      }
    });
  }

  // ---- Logout ----
  const btnSair = document.getElementById('desvincular');
  if (btnSair) {
    btnSair.addEventListener('click', () => {
      BulbeAPI.logout();
      render();
    });
  }

  // ---- Meus Pedidos ----
  async function carregarPedidos() {
    const cont = document.getElementById('lista-pedidos');
    if (!cont) return;
    cont.innerHTML = '<p class="pedidos-vazio">Carregando pedidos...</p>';
    try {
      const data = await BulbeAPI.listarPedidos();
      const pedidos = (data && data.pedidos) || [];
      if (!pedidos.length) {
        cont.innerHTML = '<p class="pedidos-vazio">Você ainda não tem pedidos.</p>';
        return;
      }
      cont.innerHTML = '';
      pedidos.forEach(p => {
        const data = p.data ? new Date(p.data).toLocaleDateString('pt-BR') : '';
        const div = document.createElement('div');
        div.className = 'pedido-card';
        div.innerHTML =
          '<div class="pid">' + p.id + '</div>' +
          '<div class="pstatus">' + String(p.status).replace(/_/g, ' ') + ' • ' + data + '</div>' +
          '<div class="ptotal">R$ ' + Number(p.valorTotal || 0).toFixed(2) + ' • ' + (p.quantidadeItens || 0) + ' item(ns)</div>';
        cont.appendChild(div);
      });
    } catch (err) {
      cont.innerHTML = '<p class="pedidos-vazio">Não foi possível carregar os pedidos.</p>';
    }
  }

  render();
});
