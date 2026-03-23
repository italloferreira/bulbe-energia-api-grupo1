# Levantamento de Requisitos — Bulbe Energia API

**Versão:** 1.0  
**Data:** 15/03/2026  
**Grupo:** Grupo 1  
**Integrantes:**  
- Itallo Ferreira — 202503042871  
- Bruno Primo — 202501022961  
- Miguel Lacerda — 202501025498  
- Marcus Paulo — 202502931743  
- Gabriel Manata — 202502924747  
- Cauã Caldeira —  202503052042

---

## Visão Geral

Este documento consolida o levantamento formal de requisitos da **Bulbe Energia API**, realizado a partir da análise do projeto frontend desenvolvido anteriormente. A elicitação foi baseada nas telas existentes, componentes visuais, fluxos de navegação, formulários, dados exibidos e comportamentos esperados da aplicação.

O objetivo deste levantamento é definir os requisitos funcionais, os endpoints esperados e os requisitos não-funcionais necessários para a implementação da API backend.

---

## Requisitos Funcionais

| ID    | Descrição | US Vinculada | Prioridade |
|-------|-----------|--------------|------------|
| RF-01 | O sistema deve disponibilizar os produtos e vitrines exibidos na página inicial da loja. | US-01 | MUST |
| RF-02 | O sistema deve permitir a pesquisa de produtos pelo nome. | US-02 | SHOULD |
| RF-03 | O sistema deve permitir a consulta de produtos por categoria. | US-03 | MUST |
| RF-04 | O sistema deve disponibilizar os dados completos de um produto. | US-04 | MUST |
| RF-05 | O sistema deve permitir consultar avaliações vinculadas a um produto. | US-05 | SHOULD |
| RF-06 | O sistema deve permitir o cadastro de avaliações de produto. | US-06 | SHOULD |
| RF-07 | O sistema deve permitir adicionar produtos ao carrinho. | US-07 | MUST |
| RF-08 | O sistema deve permitir consultar e gerenciar os itens do carrinho. | US-08 | MUST |
| RF-09 | O sistema deve permitir o cadastro dos dados de entrega do pedido. | US-09 | MUST |
| RF-10 | O sistema deve permitir a aplicação de cupons promocionais no checkout. | US-10 | SHOULD |
| RF-11 | O sistema deve permitir consultar opções de frete para o pedido. | US-11 | MUST |
| RF-12 | O sistema deve permitir a seleção do método de pagamento do pedido. | US-12 | MUST |
| RF-13 | O sistema deve permitir a finalização do pedido de compra. | US-13 | MUST |
| RF-14 | O sistema deve permitir a consulta dos dados de um pedido finalizado. | US-14 | SHOULD |
| RF-15 | O sistema deve permitir consultar e atualizar os dados do perfil do usuário. | US-15 | SHOULD |
| RF-16 | O sistema deve permitir o registro de solicitações de suporte. | US-16 | SHOULD |
| RF-17 | O sistema deve permitir consultar notificações e cupons associados ao usuário. | US-17 | COULD |

---

## Mapa de Endpoints

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

## Requisitos Não-Funcionais

| ID | Categoria | Descrição |
|----|-----------|-----------|
| RNF-01 | Desempenho | Endpoints de leitura devem responder em até 300ms no percentil 95 em condições normais de uso. |
| RNF-02 | Segurança | Rotas que manipulam dados de perfil, notificações e informações privadas do usuário devem exigir autenticação via token JWT. |
| RNF-03 | Segurança | O backend deve validar e sanitizar todos os dados recebidos em body, params e query string. |
| RNF-04 | Confiabilidade | A API deve retornar códigos HTTP coerentes com o resultado da operação. |
| RNF-05 | Padronização | Todas as respostas devem seguir um padrão JSON consistente para sucesso e erro. |
| RNF-06 | Manutenibilidade | O código deve seguir organização por camadas, com separação mínima entre rotas, controladores, serviços e modelos. |
| RNF-07 | Manutenibilidade | O projeto deve utilizar ESLint e convenções de código padronizadas para facilitar manutenção em equipe. |
| RNF-08 | Escalabilidade | A estrutura da API deve permitir expansão futura para paginação, filtros e ordenação sem quebra de contrato. |
| RNF-09 | Usabilidade | As mensagens de erro da API devem ser claras, legíveis e úteis para integração com o frontend. |
| RNF-10 | Compatibilidade | A API deve utilizar JSON como formato padrão de troca de dados com o frontend. |
| RNF-11 | Integridade | Operações de checkout e finalização de pedido devem validar a consistência dos dados antes da conclusão da compra. |
| RNF-12 | Rastreabilidade | Cada requisito funcional deve estar vinculado a pelo menos uma User Story e a um endpoint esperado. |

---

## Observações

- Os requisitos aqui documentados foram inferidos a partir da análise dos artefatos do frontend existente.
- Os endpoints definidos neste documento representam a estrutura esperada da API para suportar as funcionalidades identificadas.
- Ajustes futuros podem ser realizados conforme refinamento técnico da equipe e evolução da modelagem backend.