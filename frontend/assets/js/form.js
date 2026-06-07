/* form.js — formulário de endereço (lead.html)
   - Exige login (volta ao carrinho se não estiver logado)
   - Pré-preenche nome/e-mail (e endereço salvo, se houver) — editável
   - Valida endereço e CEP antes de avançar
   - Salva o endereço na conta do usuário (sem duplicar) */

// ----------------- Máscaras / formatação -----------------
function letraMaiuscula(texto) {
  return texto.toLowerCase().replace(/(?:^|\s)\S/g, (l) => l.toUpperCase());
}
function mascaraCEP(valor) {
  return valor.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
}
function mascaraCPF(valor) {
  return valor.replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2').slice(0, 14);
}
function mascaraCelular(valor) {
  return valor.replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{5})(\d{4})$/, '$1-$2').slice(0, 15);
}

document.addEventListener('DOMContentLoaded', function () {
  // ---- Proteção de etapa: precisa estar logado e ter itens no carrinho ----
  const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
  if (!(window.BulbeAPI && BulbeAPI.estaLogado())) {
    alert('Você precisa entrar na sua conta para finalizar a compra.');
    localStorage.setItem('redirecionarApos', './lead.html');
    window.location.href = './usuario.html';
    return;
  }
  if (carrinho.length === 0) {
    alert('Seu carrinho está vazio.');
    window.location.href = './carrinho.html';
    return;
  }

  const $ = (id) => document.getElementById(id);
  const campos = {
    nome: $('nome'), endereco: $('endereco'), cep: $('cep'),
    cpf: $('cpf'), celular: $('celular'), email: $('email')
  };

  // ---- Pré-preenchimento ----
  const usuario = BulbeAPI.getUsuario() || {};
  if (campos.nome && !campos.nome.value) campos.nome.value = usuario.nome || '';
  if (campos.email && !campos.email.value) campos.email.value = usuario.email || '';

  // Se já existe endereço salvo, pré-preenche com o último (editável)
  const enderecos = BulbeAPI.listarEnderecos();
  if (enderecos.length) {
    const ult = enderecos[enderecos.length - 1];
    if (campos.endereco && !campos.endereco.value) campos.endereco.value = ult.endereco || '';
    if (campos.cep && !campos.cep.value) campos.cep.value = ult.cep || '';
    if (campos.cpf && !campos.cpf.value) campos.cpf.value = ult.cpf || '';
    if (campos.celular && !campos.celular.value) campos.celular.value = ult.celular || '';
  }

  // ---- Máscaras ----
  if (campos.nome) campos.nome.addEventListener('input', (e) => e.target.value = letraMaiuscula(e.target.value));
  if (campos.cep) campos.cep.addEventListener('input', (e) => e.target.value = mascaraCEP(e.target.value));
  if (campos.cpf) campos.cpf.addEventListener('input', (e) => e.target.value = mascaraCPF(e.target.value));
  if (campos.celular) campos.celular.addEventListener('input', (e) => e.target.value = mascaraCelular(e.target.value));
  if (campos.email) campos.email.addEventListener('input', (e) => e.target.value = e.target.value.toLowerCase());

  // ---- Avançar ----
  const enviar = document.getElementsByClassName('btn-finalizar')[0];
  if (!enviar) return;

  function marcarErro(campo, ok) {
    if (!campo) return;
    campo.style.borderColor = ok ? '' : '#d92d20';
  }

  enviar.addEventListener('click', () => {
    const endereco = campos.endereco ? campos.endereco.value.trim() : '';
    const cep = campos.cep ? campos.cep.value.trim() : '';
    const cepNumeros = cep.replace(/\D/g, '');

    // Validação dos campos principais (endereço e CEP)
    const endOk = endereco.length >= 3;
    const cepOk = cepNumeros.length === 8;
    marcarErro(campos.endereco, endOk);
    marcarErro(campos.cep, cepOk);

    if (!endOk || !cepOk) {
      alert('Preencha o endereço e um CEP válido (8 dígitos) para continuar.');
      return;
    }

    const dados = {
      nome: campos.nome ? campos.nome.value.trim() : '',
      endereco,
      cep,
      cpf: campos.cpf ? campos.cpf.value.trim() : '',
      celular: campos.celular ? campos.celular.value.trim() : '',
      email: campos.email ? campos.email.value.trim() : ''
    };

    // Endereço temporário desta compra
    localStorage.setItem('dadosEntrega', JSON.stringify(dados));
    // Salva na conta do usuário (sem duplicar CEP) p/ aparecer no seletor
    BulbeAPI.salvarEndereco(dados);

    window.location.href = './checkout.html';
  });
});
