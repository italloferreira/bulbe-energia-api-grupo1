const nodemailer = require('nodemailer');
const db = require('../data/db');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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

async function notificarSlack(protocolo, assunto, mensagem, pedidoId) {
  const texto = [
    `🆕 *Novo chamado de suporte aberto!*`,
    `*Protocolo:* ${protocolo}`,
    `*Assunto:* ${assunto}`,
    pedidoId ? `*Pedido relacionado:* ${pedidoId}` : null,
    `*Mensagem:* ${mensagem}`
  ].filter(Boolean).join('\n');

  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: texto })
  });
}

function gerarProtocolo(id) {
  const data = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `SUP-${String(id).padStart(5, '0')}-${data}`;
}

async function abrirChamado(req, res) {
  const { assunto, mensagem, pedido_id, usuario } = req.body;

  if (!assunto || typeof assunto !== 'string' || assunto.trim() === '') {
    return res.status(400).json({ erro: 'assunto é obrigatório' });
  }

  if (!mensagem || typeof mensagem !== 'string' || mensagem.trim() === '') {
    return res.status(400).json({ erro: 'mensagem é obrigatória' });
  }

  if (!usuario || !usuario.email || !usuario.nome) {
    return res.status(400).json({ erro: 'usuario com nome e email são obrigatórios' });
  }

  const criadoEm = new Date().toISOString();

  const info = db.prepare(`
    INSERT INTO chamados (titulo, descricao, pedido_id, status, data_abertura, usuario_nome, usuario_email)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(assunto.trim(), mensagem.trim(), pedido_id || null, 'aberto', criadoEm, usuario.nome, usuario.email);

  const id = info.lastInsertRowid;
  const protocolo = gerarProtocolo(id);

  db.prepare('UPDATE chamados SET protocolo = ? WHERE id = ?').run(protocolo, id);

  const resultado = {
    protocolo,
    status: 'aberto',
    assunto: assunto.trim(),
    criadoEm
  };

  Promise.all([
    enviarEmailCliente(usuario.email, usuario.nome, protocolo, assunto.trim()),
    notificarSlack(protocolo, assunto.trim(), mensagem.trim(), pedido_id || null)
  ]).catch(err => {
    console.error('Erro ao enviar notificações:', err);
  });

  return res.status(201).json({
    protocolo: resultado.protocolo,
    status: resultado.status,
    assunto: resultado.assunto,
    criadoEm: resultado.criadoEm,
    mensagem: `Chamado aberto com sucesso. Protocolo: ${resultado.protocolo}`
  });
}

module.exports = { abrirChamado };
