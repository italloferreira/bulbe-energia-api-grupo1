const nodemailer = require('nodemailer');
const chamados = require('../data/chamados');
 
// Configuração do transporter Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
 
// Gera protocolo único ex: SUP-00001-20250520
function gerarProtocolo(id) {
  const data = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `SUP-${String(id).padStart(5, '0')}-${data}`;
}
 
// Envia e-mail de confirmação ao cliente
async function enviarEmailCliente(email, nome, protocolo, assunto) {
  await transporter.sendMail({
    from: `"Bulbe Energia Suporte" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Chamado aberto - Protocolo ${protocolo}`,
    html: `
      <h2>Olá, ${nome}!</h2>
      <p>Seu chamado foi aberto com sucesso.</p>
      <p><strong>Protocolo:</strong> ${protocolo}</p>
      <p><strong>Assunto:</strong> ${assunto}</p>
      <p>Nossa equipe entrará em contato em breve.</p>
      <br/>
      <p>Atenciosamente,<br/>Equipe Bulbe Energia</p>
    `
  });
}
 
// Notifica equipe interna via Slack
async function notificarSlack(protocolo, assunto, mensagem, pedidoId) {
  const texto = [
    `🆕 *Novo chamado de suporte aberto!*`,
    `*Protocolo:* ${protocolo}`,
    `*Assunto:* ${assunto}`,
    pedidoId ? `*Pedido relacionado:* ${pedidoId}` : null,
    `*Mensagem:* ${mensagem}`
  ]
    .filter(Boolean)
    .join('\n');
 
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: texto })
  });
}
 
// POST /api/suporte/chamados
async function abrirChamado(req, res) {
  const { assunto, mensagem, pedido_id, usuario } = req.body;
 
  // Validações
  if (!assunto || typeof assunto !== 'string' || assunto.trim() === '') {
    return res.status(400).json({
      erro: 'assunto é obrigatório'
    });
  }
 
  if (!mensagem || typeof mensagem !== 'string' || mensagem.trim() === '') {
    return res.status(400).json({
      erro: 'mensagem é obrigatória'
    });
  }
 
  if (!usuario || !usuario.email || !usuario.nome) {
    return res.status(400).json({
      erro: 'usuario com nome e email são obrigatórios'
    });
  }
 
  // Cria chamado
  const id = chamados._proximoId++;
  const protocolo = gerarProtocolo(id);
 
  const chamado = {
    id,
    protocolo,
    assunto: assunto.trim(),
    mensagem: mensagem.trim(),
    pedidoId: pedido_id || null,
    usuario: {
      nome: usuario.nome,
      email: usuario.email
    },
    status: 'aberto',
    criadoEm: new Date().toISOString()
  };
 
  chamados.lista.push(chamado);
 
  // Dispara e-mail e Slack em paralelo (sem travar a resposta)
  Promise.all([
    enviarEmailCliente(
      usuario.email,
      usuario.nome,
      protocolo,
      assunto.trim()
    ),
    notificarSlack(
      protocolo,
      assunto.trim(),
      mensagem.trim(),
      pedido_id || null
    )
  ]).catch(err => {
    console.error('Erro ao enviar notificações:', err);
  });
 
  return res.status(201).json({
    protocolo,
    status: chamado.status,
    assunto: chamado.assunto,
    criadoEm: chamado.criadoEm,
    mensagem: `Chamado aberto com sucesso. Protocolo: ${protocolo}`
  });
}
 
module.exports = { abrirChamado };