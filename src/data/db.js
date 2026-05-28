const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'bulbe.db');

const db = new Database(dbPath, { timeout: 10000 });
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function setupDb() {

  const sqls = [
    `CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT,nome TEXT NOT NULL,email TEXT NOT NULL UNIQUE,senha TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS carrinho_itens (item_id INTEGER PRIMARY KEY AUTOINCREMENT,usuario_id INTEGER,produto_id INTEGER NOT NULL,nome TEXT NOT NULL,preco REAL NOT NULL,desconto INTEGER DEFAULT 0,quantidade INTEGER NOT NULL DEFAULT 1)`,
    `CREATE TABLE IF NOT EXISTS cupons (codigo TEXT PRIMARY KEY,tipo TEXT NOT NULL,valor REAL NOT NULL,data_inicio TEXT NOT NULL,data_fim TEXT NOT NULL,valor_minimo REAL DEFAULT 0,limite_uso_global INTEGER,limite_uso_por_usuario INTEGER,total_usado INTEGER DEFAULT 0,ativo INTEGER DEFAULT 1)`,
    `CREATE TABLE IF NOT EXISTS cupons_usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT,cupom_codigo TEXT NOT NULL,usuario_id INTEGER NOT NULL,quantidade_usos INTEGER DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS pedidos (id INTEGER PRIMARY KEY AUTOINCREMENT,usuario_id INTEGER,status TEXT NOT NULL,endereco TEXT,frete REAL DEFAULT 0,cupom_codigo TEXT,pagamento_id INTEGER,valor_total REAL)`,
    `CREATE TABLE IF NOT EXISTS pedidos_itens (id INTEGER PRIMARY KEY AUTOINCREMENT,pedido_id INTEGER NOT NULL,produto_id INTEGER NOT NULL,nome TEXT NOT NULL,preco REAL NOT NULL,desconto INTEGER DEFAULT 0,quantidade INTEGER NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS pagamentos (id INTEGER PRIMARY KEY AUTOINCREMENT,pedido_id INTEGER,metodo TEXT NOT NULL,status TEXT NOT NULL,valor REAL NOT NULL,data_pagamento TEXT)`,
    `CREATE TABLE IF NOT EXISTS chamados (id INTEGER PRIMARY KEY AUTOINCREMENT,usuario_id INTEGER,pedido_id INTEGER,titulo TEXT NOT NULL,descricao TEXT NOT NULL,status TEXT DEFAULT 'aberto',data_abertura TEXT DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS produtos (id INTEGER PRIMARY KEY AUTOINCREMENT,nome TEXT NOT NULL,descricaoLonga TEXT,galeriaImagens TEXT,preco REAL NOT NULL,desconto INTEGER DEFAULT 0,destaque INTEGER DEFAULT 0,marca TEXT,categoria TEXT,especificacoesTecnicas TEXT,estoque INTEGER DEFAULT 0,avaliacoesResumidas TEXT,ativo INTEGER DEFAULT 1)`
  ];
  sqls.forEach(s => { try { db.exec(s); } catch (ex) {} });

  const cols = {
    pagamentos: ['gatewayId','qrCodeUrl','pixCopiaECola','criadoEm','expiraEm','pagoEm'],
    chamados: ['protocolo','usuario_nome','usuario_email','mensagem'],
    pedidos: ['criadoEm','canceladoEm','reembolsoProcessado','metodoPagamento','resumo','codigoRastreio','frete_tipo']
  };
  for (const [table, names] of Object.entries(cols)) {
    const existing = db.prepare(`PRAGMA table_info('${table}')`).all().map(c => c.name);
    for (const col of names) {
      if (!existing.includes(col)) {
        try { db.prepare(`ALTER TABLE ${table} ADD COLUMN ${col} TEXT`).run(); } catch (ex) {}
      }
    }
  }

  const cnt = db.prepare('SELECT COUNT(*) as c FROM cupons').get().c;
  if (cnt === 0) {
    const ins = db.prepare('INSERT INTO cupons (codigo,tipo,valor,data_inicio,data_fim,valor_minimo,limite_uso_global,limite_uso_por_usuario,ativo) VALUES (?,?,?,?,?,?,?,?,?)');
    ins.run('BULBE10', 'percentual', 10, '2025-01-01', '2099-12-31', 50, 1000, 1, 1);
    ins.run('BULBE20', 'percentual', 20, '2025-01-01', '2099-12-31', 100, 500, 1, 1);
    ins.run('FRETEGRATIS', 'frete_gratis', 0, '2025-01-01', '2099-12-31', 0, 2000, 3, 1);
  }

  const prodCnt = db.prepare('SELECT COUNT(*) as c FROM produtos').get().c;
  if (prodCnt === 0) {
    const ins = db.prepare(`INSERT INTO produtos (id,nome,descricaoLonga,galeriaImagens,preco,desconto,destaque,marca,categoria,especificacoesTecnicas,estoque,avaliacoesResumidas,ativo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    ins.run(1,'Lâmpada LED 12W','Lâmpada LED econômica com alta durabilidade e baixo consumo de energia.','["https://example.com/imagens/lampada1.jpg","https://example.com/imagens/lampada2.jpg"]',29.90,10,1,'Philips','casa','{"potencia":"12W","voltagem":"110V","temperaturaCor":"6500K"}',120,'{"media":4.8,"total":256}',1);
    ins.run(2,'Painel Solar 550W','Painel solar de alta eficiência para sistemas fotovoltaicos.','["https://example.com/imagens/painel1.jpg"]',899.90,5,1,'Canadian Solar','eletronicos','{"potencia":"550W","eficiencia":"21.3%"}',30,'{"media":4.9,"total":98}',1);
  }
}

setupDb();

module.exports = db;
