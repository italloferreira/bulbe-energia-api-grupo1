// "Banco de dados" em memória dos usuários cadastrados
// Cada usuário tem: id, nome, email, senha (criptografada)

const usuarios = {
  lista: [],
  _proximoId: 1
};

module.exports = usuarios;