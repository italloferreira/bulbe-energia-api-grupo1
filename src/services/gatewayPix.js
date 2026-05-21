const crypto = require('crypto');

function calcularCRC16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function campo(id, valor) {
  return id + String(valor.length).padStart(2, '0') + valor;
}

function gerarCopiaECola(valor, txid) {
  const merchant =
    campo('00', 'BR.GOV.BCB.PIX') +
    campo('01', 'bulbe-energia@exemplo.com.br');

  let payload =
    campo('00', '01') +
    campo('26', merchant) +
    campo('52', '0000') +
    campo('53', '986') +
    campo('54', valor.toFixed(2)) +
    campo('58', 'BR') +
    campo('59', 'BULBE ENERGIA') +
    campo('60', 'BELO HORIZONTE') +
    campo('62', campo('05', txid)) +
    '6304';

  return payload + calcularCRC16(payload);
}

function criarCobrancaPix(pedido) {
  const valor = pedido.resumo.total;
  const txid = crypto.randomBytes(13).toString('hex').toUpperCase().slice(0, 25);
  const pixCopiaECola = gerarCopiaECola(valor, txid);

  const qrCodeUrl =
    'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' +
    encodeURIComponent(pixCopiaECola);

  return {
    gatewayId: `MOCK-${txid}`,
    valor,
    pixCopiaECola,
    qrCodeUrl
  };
}

module.exports = { criarCobrancaPix };