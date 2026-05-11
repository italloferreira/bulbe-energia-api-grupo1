const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarios = require('../data/usuarios');

// Chave secreta usada pra "assinar" o token. Em produção isso vem do .env
const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-dev';

// US-26 · Cadastrar novo usuário
async function cadastrar(req, res) {
  const { nome, email, senha } = req.body;

  // 1. Validação básica: campos obrigatórios
  if (!nome || !email || !senha) {
    return res.status(400).json({
      erro: 'nome, email e senha são obrigatórios'
    });
  }

  // 2. Verifica se já existe usuário com esse email
  const emailJaCadastrado = usuarios.lista.find(
    u => u.email === email
  );
  if (emailJaCadastrado) {
    return res.status(409).json({
      erro: 'Email já cadastrado'
    });
  }

  // 3. Criptografa a senha (10 é o "custo" — quanto maior, mais seguro e mais lento)
  const senhaHash = await bcrypt.hash(senha, 10);

  // 4. Cria o usuário e adiciona na lista
  const novoUsuario = {
    id: usuarios._proximoId++,
    nome,
    email,
    senha: senhaHash
  };
  usuarios.lista.push(novoUsuario);

  // 5. Retorna sucesso (SEM a senha, nunca devolve senha na resposta)
  return res.status(201).json({
    id: novoUsuario.id,
    nome: novoUsuario.nome,
    email: novoUsuario.email
  });
}

// US-26 · Fazer login e gerar token JWT
async function login(req, res) {
  const { email, senha } = req.body;

  // 1. Validação básica
  if (!email || !senha) {
    return res.status(400).json({
      erro: 'email e senha são obrigatórios'
    });
  }

  // 2. Procura o usuário pelo email
  const usuario = usuarios.lista.find(
    u => u.email === email
  );
  if (!usuario) {
    return res.status(401).json({
      erro: 'Email ou senha inválidos'
    });
  }

  // 3. Compara a senha digitada com a senha criptografada salva
  const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
  if (!senhaCorreta) {
    return res.status(401).json({
      erro: 'Email ou senha inválidos'
    });
  }

  // 4. Gera o token JWT (expira em 7 dias)
  const token = jwt.sign(
    { id: usuario.id, email: usuario.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // 5. Retorna o token pro cliente
  return res.json({
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email
    }
  });
}

module.exports = {
  cadastrar,
  login
};