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

  // Cupons (alinhados ao cupom usado na tela de checkout)
  const cnt = db.prepare('SELECT COUNT(*) as c FROM cupons').get().c;
  if (cnt === 0) {
    const ins = db.prepare('INSERT INTO cupons (codigo,tipo,valor,data_inicio,data_fim,valor_minimo,limite_uso_global,limite_uso_por_usuario,ativo) VALUES (?,?,?,?,?,?,?,?,?)');
    ins.run('BULBE10', 'percentual', 10, '2025-01-01', '2099-12-31', 0, 100000, 100, 1);
    ins.run('BULBE20', 'percentual', 20, '2025-01-01', '2099-12-31', 50, 100000, 100, 1);
    ins.run('DESCONTO20', 'percentual', 20, '2025-01-01', '2099-12-31', 0, 100000, 100, 1);
    ins.run('FRETEGRATIS', 'frete_gratis', 0, '2025-01-01', '2099-12-31', 0, 100000, 100, 1);
  }

  // Catalogo de produtos espelha o frontend e usa imagens LOCAIS da loja.
  // IDs 1..5 correspondem aos botoes "Adicionar ao Carrinho" da pagina de produto.
  const prodCnt = db.prepare('SELECT COUNT(*) as c FROM produtos').get().c;
  if (prodCnt === 0) {
    const ins = db.prepare(`INSERT INTO produtos
      (id,nome,descricaoLonga,galeriaImagens,preco,desconto,destaque,marca,categoria,especificacoesTecnicas,estoque,avaliacoesResumidas,ativo)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);

    const P = (id, nome, desc, imgs, preco, desconto, destaque, marca, categoria, specs, estoque, aval) =>
      ins.run(id, nome, desc, JSON.stringify(imgs), preco, desconto, destaque, marca, categoria, JSON.stringify(specs), estoque, JSON.stringify(aval), 1);

    P(1, 'Lâmpada Super Bulbo LED T 30W 6500K Elgin Bivolt Luz Branca Fria',
      'Possuir uma boa iluminação nos espaços em que estamos influencia a maneira como nos sentimos, relaxamos, trabalhamos ou estudamos. A Lâmpada Elgin Super Bulbo 30W é uma excelente opção para criar um ambiente agradável e funcional.',
      ['/assets/img/produtos/lampada.png','/assets/img/produtos/lampada2.png','/assets/img/produtos/lampada3.png','/assets/img/produtos/lampada4.png','/assets/img/produtos/lampada5.png'],
      99.90, 0, 1, 'Elgin', 'casa', { potencia: '30W', voltagem: 'Bivolt', temperaturaCor: '6500K' }, 120, { media: 4.7, total: 3450 });

    P(2, 'Abajur Luxuoso Base de Cobre',
      'Abajur de mesa com base de cobre escovado e cúpula difusora. Iluminação aconchegante para sala ou quarto.',
      ['/assets/img/produtos/abajur.png','/assets/img/produtos/abajur2.png'],
      35.80, 0, 0, 'Bulbe', 'casa', { material: 'Cobre', soquete: 'E27' }, 60, { media: 4.5, total: 210 });

    P(3, 'Cadeira 4 Pernas Forro Branco',
      'Cadeira estofada com forro branco e estrutura reforçada de 4 pernas. Conforto e elegância para sua casa.',
      ['/assets/img/produtos/cadeira.png','/assets/img/produtos/cadeirachique.png'],
      15.75, 0, 0, 'Bulbe', 'casa', { material: 'Madeira/Tecido', capacidade: '120kg' }, 80, { media: 4.3, total: 150 });

    P(4, 'Luminária de Mesa',
      'Luminária de mesa moderna com luz regulável, ideal para leitura e home office.',
      ['/assets/img/produtos/shopping.webp'],
      42.90, 0, 0, 'Bulbe', 'casa', { potencia: '9W', regulagem: 'Sim' }, 45, { media: 4.6, total: 98 });

    P(5, 'Kit de Lâmpadas LED',
      'Kit econômico com lâmpadas LED de alto rendimento e baixo consumo de energia.',
      ['/assets/img/produtos/shopping (1).webp'],
      67.50, 0, 0, 'Bulbe', 'casa', { unidades: '4', potencia: '9W cada' }, 70, { media: 4.8, total: 256 });

    P(6, 'Smartphone Samsung Galaxy A22 128GB',
      'Smartphone com tela Super AMOLED, câmera quádrupla e bateria de longa duração.',
      ['/assets/img/produtos/celular.png'],
      599.99, 10, 1, 'Samsung', 'eletronicos', { armazenamento: '128GB', tela: '6.4"' }, 40, { media: 4.5, total: 1200 });

    P(7, 'Mesa de Truco Preta Ultra Resistente',
      'Mesa dobrável ultra resistente, perfeita para jogos e reuniões em família.',
      ['/assets/img/produtos/mesa.png'],
      21.90, 0, 1, 'Bulbe', 'casa', { material: 'Aço/MDF' }, 35, { media: 4.4, total: 320 });

    P(8, 'Cama King Size Ultra Conforto',
      'Cama King Size com estrutura robusta e acabamento premium para máximo conforto.',
      ['/assets/img/produtos/cama.png'],
      135.80, 0, 0, 'Bulbe', 'casa', { tamanho: 'King', material: 'Madeira maciça' }, 20, { media: 4.7, total: 88 });

    P(9, 'Aspirador de Casa Ultra Potente',
      'Aspirador de pó potente, ideal para limpeza pesada em toda a casa.',
      ['/assets/img/produtos/aspirador.png'],
      235.80, 15, 0, 'Bulbe', 'eletrodomesticos', { potencia: '1800W', capacidade: '2L' }, 25, { media: 4.6, total: 140 });

    P(10, 'Aquecedor Smart Hot',
      'Aquecedor elétrico inteligente com controle de temperatura e desligamento automático.',
      ['/assets/img/produtos/aquecedor.png'],
      85.90, 0, 0, 'Bulbe', 'eletrodomesticos', { potencia: '2000W', modos: '3' }, 30, { media: 4.5, total: 76 });

    P(11, 'Monitor Gamer 144Hz',
      'Monitor gamer com taxa de atualização de 144Hz e baixo input lag para alta performance.',
      ['/assets/img/produtos/monitor.png'],
      1335.80, 0, 1, 'Bulbe', 'eletronicos', { taxa: '144Hz', tela: '27"' }, 18, { media: 4.8, total: 410 });

    P(12, 'Teclado Mecânico RGB',
      'Teclado mecânico com iluminação RGB personalizável e switches de alta durabilidade.',
      ['/assets/img/produtos/teclado.png'],
      355.90, 0, 0, 'Bulbe', 'eletronicos', { tipo: 'Mecânico', iluminacao: 'RGB' }, 50, { media: 4.7, total: 530 });

    P(13, 'Mouse Gamer 6 Botões',
      'Mouse gamer ergonômico com 6 botões programáveis e sensor de alta precisão.',
      ['/assets/img/produtos/mouse.png'],
      45.90, 22, 0, 'Bulbe', 'eletronicos', { dpi: '7200', botoes: '6' }, 90, { media: 4.6, total: 680 });

    P(14, 'LapTop Intel Core i7 16GB RAM',
      'Notebook com processador Intel Core i7, 16GB de RAM e SSD rápido para alta produtividade.',
      ['/assets/img/produtos/notbook.png','/assets/img/produtos/notebookasus.png'],
      1570.99, 0, 1, 'Asus', 'eletronicos', { processador: 'Intel Core i7', ram: '16GB', ssd: '512GB' }, 12, { media: 4.9, total: 295 });

    P(15, 'Relógio Digital Apple Watch',
      'Relógio inteligente com monitoramento de saúde, GPS e notificações.',
      ['/assets/img/produtos/aplleWatch.jpg'],
      755.90, 0, 0, 'Apple', 'eletronicos', { gps: 'Sim', resistencia: 'Água 50m' }, 22, { media: 4.8, total: 510 });

    P(16, 'Leitor de Livros Kindle',
      'Leitor de e-books com tela antirreflexo, luz embutida e bateria de semanas.',
      ['/assets/img/produtos/kindle.jpg'],
      280.90, 12, 0, 'Amazon', 'eletronicos', { tela: '6"', armazenamento: '8GB' }, 33, { media: 4.7, total: 405 });
  }
}

setupDb();

module.exports = db;
