
const PESO_POR_UNIDADE_KG = 0.5;


const TARIFA_BASE = 12.0;


const CUSTO_POR_KG = 2.5;


const MULTIPLICADOR_EXPRESSA = 1.7;


const REGIOES = {
  '0': { uf: 'SP', fator: 1.05, prazoBase: 4 },
  '1': { uf: 'SP', fator: 1.05, prazoBase: 4 },
  '2': { uf: 'RJ/ES', fator: 1.1, prazoBase: 4 },
  '3': { uf: 'MG', fator: 1.0, prazoBase: 3 },
  '4': { uf: 'BA/SE', fator: 1.3, prazoBase: 6 },
  '5': { uf: 'PE/PB/RN/AL', fator: 1.4, prazoBase: 7 },
  '6': { uf: 'CE/PI/MA/Norte', fator: 1.6, prazoBase: 9 },
  '7': { uf: 'Centro-Oeste', fator: 1.3, prazoBase: 6 },
  '8': { uf: 'PR/SC', fator: 1.2, prazoBase: 5 },
  '9': { uf: 'RS', fator: 1.3, prazoBase: 6 }
};


const TTL_CACHE_MS = 30 * 60 * 1000;
const cacheFrete = new Map();

// --- Helpers -----------------------------------------------------------------


function normalizarCep(cep) {
  if (typeof cep !== 'string' && typeof cep !== 'number') {
    return null;
  }
  return String(cep).replace(/\D/g, '');
}


function cepValido(digitos) {
  return /^\d{8}$/.test(digitos) && digitos !== '00000000';
}


function formatarCep(digitos) {
  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}


function validarItens(itens) {
  if (!Array.isArray(itens) || itens.length === 0) {
    return { ok: false, erro: 'itens deve ser uma lista com ao menos um item' };
  }

  const normalizados = [];

  for (const item of itens) {
    const id = item?.id;
    const quantidade = item?.quantidade;

    if (!Number.isInteger(id) || id <= 0) {
      return { ok: false, erro: 'cada item deve ter um id inteiro positivo' };
    }
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      return {
        ok: false,
        erro: 'cada item deve ter uma quantidade inteira positiva'
      };
    }

    normalizados.push({ id, quantidade });
  }

  return { ok: true, itens: normalizados };
}


function montarChaveCache(cepDigitos, itens) {
  const carrinho = [...itens]
    .sort((a, b) => a.id - b.id)
    .map(i => `${i.id}:${i.quantidade}`)
    .join(',');

  return `${cepDigitos}|${carrinho}`;
}


function calcularOpcoes(cepDigitos, itens) {
  const regiao = REGIOES[cepDigitos[0]];

  const quantidadeTotal = itens.reduce((acc, i) => acc + i.quantidade, 0);
  const pesoTotalKg = quantidadeTotal * PESO_POR_UNIDADE_KG;

  const valorPadrao =
    (TARIFA_BASE + pesoTotalKg * CUSTO_POR_KG) * regiao.fator;

  const prazoPadrao = regiao.prazoBase + Math.floor(quantidadeTotal / 10);
  const prazoExpressa = Math.max(1, Math.ceil(prazoPadrao / 2));

  return [
    {
      tipo: 'padrao',
      nome: 'Entrega Padrão',
      transportadora: 'Correios',
      valor: Number(valorPadrao.toFixed(2)),
      prazoDiasUteis: prazoPadrao
    },
    {
      tipo: 'expressa',
      nome: 'Entrega Expressa',
      transportadora: 'Correios',
      valor: Number((valorPadrao * MULTIPLICADOR_EXPRESSA).toFixed(2)),
      prazoDiasUteis: prazoExpressa
    }
  ];
}


function calcularFrete(req, res) {
  const { cep_destino, itens } = req.body || {};

 
  const cepDigitos = normalizarCep(cep_destino);
  if (!cepDigitos || !cepValido(cepDigitos)) {
    return res.status(400).json({
      erro: 'CEP inválido. Informe um CEP de destino no formato 00000-000.'
    });
  }

  const itensValidados = validarItens(itens);
  if (!itensValidados.ok) {
    return res.status(400).json({ erro: itensValidados.erro });
  }

 
  const chave = montarChaveCache(cepDigitos, itensValidados.itens);
  const cacheado = cacheFrete.get(chave);

  if (cacheado && cacheado.expiraEm > Date.now()) {
    res.set('X-Cache', 'HIT');
    return res.json(cacheado.resposta);
  }

 
  if (cacheado) {
    cacheFrete.delete(chave);
  }

  const resposta = {
    cepDestino: formatarCep(cepDigitos),
    calculadoEm: new Date().toISOString(),
    opcoes: calcularOpcoes(cepDigitos, itensValidados.itens)
  };

 
  cacheFrete.set(chave, {
    resposta,
    expiraEm: Date.now() + TTL_CACHE_MS
  });

  res.set('X-Cache', 'MISS');
  return res.status(200).json(resposta);
}

module.exports = { calcularFrete };
