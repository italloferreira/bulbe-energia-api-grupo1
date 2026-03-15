<div align="center">


teste
# ⚡ Bulbe Energia API

**Backend do sistema de monitoramento de energia renovável**  
Projeto desenvolvido para a disciplina de Projeto de Desenvolvimento Backend — IBMEC

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![License](https://img.shields.io/badge/license-MIT-blue)

</div>

---

## 👥 Equipe

| Nome Completo | Matrícula | GitHub |
|---|---|---|
| Itallo Ferreira | 202503042871 | [@italloferreira](https://github.com/italloferreira) |
| Bruno Primo | 202501022961 | [@BrunoMP22](https://github.com/BrunoMP22) |
| Cauan |  | [@Caua-Caldeira-harlle](https://github.com/Caua-Caldeira-harlle) |
| Marcos Paulo | 202502931743 | [@EmipeCarvalho](https://github.com/EmipeCarvalho) |
| Gabriel Manata | 202502924747 | [@GabrielMPinho](https://github.com/GabrielMPinho) |
| Miguel Lacerda | 202501025498 | [@Miguellacerda14](https://github.com/Miguellacerda14) |

---

## 📋 Sobre o Projeto

A **Bulbe Energia API** é o backend responsável por disponibilizar os recursos necessários para o funcionamento do sistema Bulbe Energia.  
Este projeto tem como objetivo centralizar o acesso aos dados da aplicação, fornecendo endpoints para consulta, cadastro, atualização e gerenciamento das funcionalidades identificadas durante a etapa de elicitação de requisitos.  
A API será desenvolvida de forma incremental ao longo das sprints, seguindo boas práticas de organização, versionamento e documentação.  
Durante a Sprint 1, o foco está na estruturação inicial do repositório, definição das User Stories e levantamento formal dos requisitos funcionais e não-funcionais do sistema.

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

## 📡 Endpoints da API (esboço inicial)

> Consulte o arquivo completo em [`docs/requisitos.md`](./docs/requisitos.md).

| Verbo | Path | Descrição |
|-------|------|-----------|
| GET | /api/v1/catalogo/home | Consultar catálogo inicial exibido na página principal |
| GET | /api/v1/produtos?search=termo | Pesquisar produtos por nome |
| GET | /api/v1/categorias/{slug}/produtos | Listar produtos de uma categoria específica |
| GET | /api/v1/produtos/{id} | Consultar detalhes completos de um produto |
| GET | /api/v1/produtos/{id}/avaliacoes | Consultar avaliações de um produto |
| POST | /api/v1/produtos/{id}/avaliacoes | Registrar nova avaliação de produto |
| POST | /api/v1/carrinho/itens | Adicionar item ao carrinho |
| GET | /api/v1/carrinho | Consultar itens do carrinho |
| PATCH | /api/v1/carrinho/itens/{itemId} | Atualizar quantidade de item no carrinho |
| DELETE | /api/v1/carrinho/itens/{itemId} | Remover item do carrinho |
| POST | /api/v1/checkout/entrega | Registrar dados de entrega |
| POST | /api/v1/cupons/aplicacoes | Aplicar cupom promocional |
| GET | /api/v1/checkout/fretes?cep=00000-000 | Consultar opções de frete |
| POST | /api/v1/checkout/pagamento | Selecionar método de pagamento |
| POST | /api/v1/pedidos | Finalizar pedido |
| GET | /api/v1/pedidos/{pedidoId} | Consultar confirmação e acompanhamento do pedido |
| GET | /api/v1/usuarios/me | Consultar perfil do usuário |
| PATCH | /api/v1/usuarios/me | Atualizar perfil do usuário |
| POST | /api/v1/suporte/solicitacoes | Registrar solicitação de suporte |
| GET | /api/v1/notificacoes | Consultar notificações e cupons do usuário |

---

## 📚 Documentação OpenAPI

> Arquivo em [`docs/openapi.yaml`](./docs/openapi.yaml) — a ser preenchido progressivamente.