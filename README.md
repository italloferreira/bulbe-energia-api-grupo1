# ⚡ Bulbe Energia API

**Backend do sistema de monitoramento de energia renovável**  
Projeto desenvolvido para a disciplina de Projeto de Desenvolvimento Backend — IBMEC

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![License](https://img.shields.io/badge/license-MIT-blue)

</div>

---

## 👥 Equipe ⬅️

| Nome Completo | Matrícula | GitHub 
|---|---|---|
| Bruno Miguel Primo | 202501022961 | BrunoMP22 |
| Itallo Ferreira | 202503042871 | italloferreira |
| Marcus Carvalho | 202502931743 | MarcusCarvalho |
| Gabriel Manata | 202502924747 | GabrielManata |
| Cauã Caldeira | 202503052042 | Caua-Caldeira-harlle |
| Miguel Lacerda | 202501025498 | MiguelLacerda |

---

## 📋 Sobre o Projeto ⬅️

Breve descrição do sistema Bulbe Energia e do objetivo desta API.  
(3 a 5 linhas explicando o contexto do projeto)

---

## 🏗️ Arquitetura

> *A ser preenchido na Sprint 2 após definição da arquitetura MVC.*

---

## 🔧 Tecnologias

> *A ser preenchido na Sprint 2.*

---

## ⚙️ Como Executar Localmente

> *A ser preenchido na Sprint 2.*

---

## 📡 Endpoints da API ⬅️ (esboço inicial)

| Verbo | Path | RF | Status esperado |
|-------|------|----|-----------------|
| GET | /api/v1/catalogo/home | RF-01 | 200 |
| GET | /api/v1/produtos?search=lampada | RF-02 | 200 |
| GET | /api/v1/categorias/{slug}/produtos | RF-03 | 200, 404 |
| GET | /api/v1/produtos/{id} | RF-04 | 200, 404 |
| GET | /api/v1/produtos/{id}/avaliacoes | RF-05 | 200 |
| POST | /api/v1/produtos/{id}/avaliacoes | RF-06 | 201, 400 |
| POST | /api/v1/carrinho/itens | RF-07 | 201 |
| GET | /api/v1/carrinho | RF-08 | 200 |
| PATCH | /api/v1/carrinho/itens/{itemId} | RF-08 | 200, 404 |
| DELETE | /api/v1/carrinho/itens/{itemId} | RF-08 | 204, 404 |
| POST | /api/v1/checkout/entrega | RF-09 | 201, 400 |
| POST | /api/v1/cupons/aplicacoes | RF-10 | 200, 400, 404 |
| GET | /api/v1/checkout/fretes?cep=00000-000 | RF-11 | 200, 400 |
| POST | /api/v1/checkout/pagamento | RF-12 | 200, 201, 400 |
| POST | /api/v1/pedidos | RF-13 | 201, 400, 422 |
| GET | /api/v1/pedidos/{pedidoId} | RF-14 | 200, 404 |
| GET | /api/v1/usuarios/me | RF-15 | 200, 401 |
| PATCH | /api/v1/usuarios/me | RF-15 | 200, 204, 400, 401 |
| POST | /api/v1/suporte/solicitacoes | RF-16 | 201, 400 |
| GET | /api/v1/notificacoes | RF-17 | 200, 401 |


---

## 📚 Documentação OpenAPI

> Arquivo em [`docs/openapi.yaml`](./docs/openapi.yaml) — a ser preenchido progressivamente.

---

## 🗂️ Estrutura do Repositório

```
bulbe-energia-api/
├── docs/
│   ├── requisitos.md
│   └── openapi.yaml
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── services/
├── tests/
├── .gitignore
├── package.json
└── README.md
```

---

## 🔄 Sprints

| Sprint | Foco | Status |
|--------|------|--------|
| Kickoff | Apresentação dos trabalhos do semestre anterior | ✅ Concluída |
| Sprint 1 | Setup + Elicitação de Requisitos | 🔄 Em andamento |
| Sprint 2 | Modelagem + Arquitetura + CRUD básico | ⏳ Aguardando |
| Sprint 3 | Banco de Dados + ORM + Testes | ⏳ Aguardando |
| Sprint 4 | Autenticação + Documentação Final | ⏳ Aguardando |

---

## 📖 Referências

- SOMMERVILLE, I. *Software Engineering*. 10. ed. Pearson, 2015.
- FOWLER, M. *Patterns of Enterprise Application Architecture*. Addison-Wesley, 2002.
- RICHARDSON, L.; RUBY, S. *RESTful Web Services*. O'Reilly, 2007.
- OpenAPI Initiative. *OpenAPI Specification v3.1.0*. Disponível em: https://spec.openapis.org/oas/v3.1.0

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte o arquivo [LICENSE](./LICENSE) para mais detalhes.
```

---
