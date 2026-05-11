const jwt = require('jsonwebtoken');

// Mesma chave que está no usuarioController. Em produção, vem do .env
const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-dev';

// Middleware: verifica se o usuário está autenticado via JWT
function autenticar(req, res, next) {
  // 1. Pega o header "Authorization" da requisição
  const authHeader = req.headers.authorization;

  // 2. Se não tiver header, ou se não começar com "Bearer ", retorna 401
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      erro: 'Token não fornecido. Faça login para continuar.'
    });
  }

  // 3. Extrai apenas o token (tira o "Bearer " da frente)
  const token = authHeader.split(' ')[1];

  try {
    // 4. Verifica se o token é válido e decodifica o payload
    const payload = jwt.verify(token, JWT_SECRET);

    // 5. Salva os dados do usuário em req.user pra o controller usar
    req.user = payload;

    // 6. Libera a passagem pro controller
    next();
  } catch (err) {
    // 7. Se o token for inválido ou estiver expirado, retorna 401
    return res.status(401).json({
      erro: 'Token inválido ou expirado. Faça login novamente.'
    });
  }
}

module.exports = autenticar;