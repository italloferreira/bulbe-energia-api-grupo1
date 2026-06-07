# Bulbe — Projeto Fullstack (Frontend + Backend integrados)

Este projeto une **dois trabalhos da faculdade** em uma única aplicação que roda
em **um só servidor**:

- **Backend (API):** `bulbe-energia-api-grupo1` — Node.js + Express + SQLite
- **Frontend (loja):** `Projeto-BulbeShop` — HTML, CSS e JS (servido em `frontend/`)

O Express serve a loja **e** a API na mesma origem (`http://localhost:3000`),
então **não há problema de CORS** e **todas as imagens continuam funcionando**
(são servidas como arquivos estáticos).

---

## Como rodar

Pré-requisito: **Node.js 18+** instalado.

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor
npm start
```

Depois abra no navegador:

- **Loja (frontend):** http://localhost:3000/
- **API (backend):**   http://localhost:3000/api
- **Swagger (docs):**  http://localhost:3000/api-docs

> Na primeira execução, o banco `src/data/bulbe.db` é criado e populado
> automaticamente com o catálogo de produtos e os cupons.

---

## O que foi integrado (frontend ↔ backend)

| Funcionalidade | Como ficou |
|---|---|
| **Login / Cadastro** | Página "Minha conta" (`/pages/usuario.html`) agora tem login e cadastro reais, com **JWT** salvo no navegador. |
| **Meus pedidos** | Quando logado, a conta lista os pedidos reais vindos da API. |
| **Catálogo** | A API (`/api/v1/...`) devolve os mesmos produtos da loja, usando as **imagens locais** (nada de URLs quebradas). |
| **Busca** | A barra de pesquisa consulta `/api/v1/produtos?search=` (com fallback offline). |
| **Cupom** | No checkout, o cupom é validado de verdade em `/api/cupons/validar` (ex.: `BULBE10`, `BULBE20`, `FRETEGRATIS`). |
| **Frete** | Endpoint `/api/frete/calcular` disponível para cálculo por CEP. |
| **Pedido + PIX** | "Finalizar compra" cria um **pedido real** (`/api/pedidos`) e gera uma **cobrança PIX com QR Code** (`/api/pagamentos/pix`), exibida na tela de conclusão. |
| **Suporte** | O formulário de suporte abre um **chamado real** (`/api/suporte/chamados`) e mostra o protocolo. |

> Observação: o checkout só cria pedido no backend quando o usuário está
> **logado**. Sem login, o fluxo continua funcionando de forma simulada
> (como era antes), sem quebrar a navegação.

### Cupons de teste já cadastrados
- `BULBE10` — 10% de desconto
- `BULBE20` — 20% (mínimo R$ 50)
- `DESCONTO20` — 20%
- `FRETEGRATIS` — frete grátis

---

## Estrutura

```
bulbe-fullstack/
├── app.js                 # Servidor Express (API + serve o frontend)
├── package.json
├── docs/
│   └── openapi.yaml        # Documentação Swagger
├── src/
│   ├── controllers/        # Lógica da API
│   ├── routes/             # Rotas da API
│   ├── middlewares/        # Autenticação JWT
│   ├── services/           # Gateway PIX (mock)
│   └── data/
│       ├── db.js           # Schema + seed do catálogo/cupons
│       └── bulbe.db        # (gerado automaticamente)
└── frontend/               # A loja BulbeShop
    ├── index.html
    ├── pages/
    └── assets/
        ├── css/
        ├── img/            # Imagens (intactas)
        └── js/
            ├── api.js       # NOVO: camada central de integração com a API
            ├── conta.js     # NOVO: login/cadastro/conta
            └── ...          # demais scripts da loja
```

---

## Correções aplicadas na integração
- **Bug que derrubava o servidor no Linux:** o arquivo `Pagamentocontroller.js`
  tinha letra maiúscula divergente do `require`. Renomeado para
  `pagamentoController.js`.
- Caminho quebrado do `barrapesquisa.js` nas páginas de categoria corrigido
  (`./assets` → `../assets`) e script tornado à prova de falhas.

---

## Notas
- As notificações de suporte por **e-mail/Slack** são **opcionais**. Sem as
  variáveis no `.env`, o chamado é criado normalmente e a notificação é apenas
  ignorada (não quebra nada).
- A documentação original do backend está em `README-backend.md`.
