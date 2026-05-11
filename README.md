## 📋 Sobre o Projeto ⬅️

A **Bulbe Energia API** é o backend de um sistema voltado para venda, consulta e gerenciamento de produtos relacionados à energia, eletrônicos e soluções sustentáveis.  
Nesta etapa, a API disponibiliza recursos para listagem de produtos, consulta de detalhes, filtros por categoria, vitrines de destaque/ofertas e gerenciamento básico de carrinho.  
O projeto está sendo desenvolvido de forma incremental para a disciplina de Projeto de Desenvolvimento Backend — IBMEC, com evolução prevista para autenticação, checkout, pedidos, documentação OpenAPI e integração futura com banco de dados.

---

## 🏗️ Arquitetura

O projeto utiliza uma arquitetura em camadas baseada no padrão **MVC simplificado**, separando as responsabilidades principais da aplicação:

- **app.js**: ponto de entrada da aplicação. Configura o Express, habilita JSON, CORS e registra as rotas da API.
- **routes/**: camada responsável por definir os endpoints HTTP e direcionar cada requisição para o controller correto.
- **controllers/**: camada que concentra a lógica de cada recurso, como validações, filtros, busca de produtos, cálculo de carrinho e retorno das respostas JSON.
- **data/** e arquivos de dados em memória: simulam uma base de dados temporária durante a fase inicial do projeto.
- **middlewares/**: camada preparada para comportamentos intermediários, como autenticação via JWT.

No estágio atual, a API trabalha com dados em memória, sem banco de dados real. Isso facilita o desenvolvimento inicial e os testes dos fluxos principais antes da introdução de ORM, persistência e autenticação completa nas próximas sprints.

---

## 🔧 Tecnologias

- **Node.js 18+**: ambiente de execução JavaScript no backend.
- **Express.js**: framework utilizado para criação da API REST.
- **CORS**: middleware para permitir requisições entre frontend e backend em ambientes diferentes.
- **JSON**: formato padrão de entrada e saída de dados da API.
- **bcryptjs**: biblioteca prevista/utilizada para criptografia de senhas de usuários.
- **jsonwebtoken**: biblioteca prevista/utilizada para autenticação com tokens JWT.
- **Nodemon**: ferramenta de apoio ao desenvolvimento para reiniciar o servidor automaticamente.
- **Prettier**: ferramenta para padronização da formatação do código.
- **OpenAPI 3.1**: padrão adotado para documentação progressiva dos endpoints da API.

---

## ⚙️ Como Executar Localmente

### Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

- Node.js 18 ou superior
- npm
- Git

### Passo a passo

1. Clone o repositório:

```bash
git clone https://github.com/italloferreira/bulbe-energia-api-grupo1.git
```

2. Acesse a pasta do projeto:

```bash
cd bulbe-energia-api-grupo1
```

3. Instale as dependências:

```bash
npm install
```

4. Crie o arquivo `.env` com base no `.env.example`:

```bash
cp .env.example .env
```

Exemplo de configuração:

```env
PORT=3000
JWT_SECRET=chave-secreta-dev
```

5. Execute a aplicação:

```bash
npm start
```

Ou, em ambiente de desenvolvimento:

```bash
npm run dev
```

6. Acesse a API no navegador ou em uma ferramenta como Postman/Insomnia:

```text
http://localhost:3000
```

Resposta esperada:

```json
{
  "mensagem": "API Bulbe Energia funcionando!"
}
```

### Exemplos de rotas disponíveis no estágio atual

```text
GET    /api/v1/catalogo/home
GET    /api/v1/produtos
GET    /api/v1/produtos?search=lampada
GET    /api/v1/produtos/destaques
GET    /api/v1/produtos/ofertas
GET    /api/v1/produtos/categoria/casa
GET    /api/v1/produtos/1
GET    /api/v1/carrinho
POST   /api/v1/carrinho/itens
PATCH  /api/v1/carrinho/itens/1
DELETE /api/v1/carrinho/itens/1
```

> Observação: antes de executar, verifique se o caminho de importação dos produtos está correto no controller. No projeto atual, o arquivo de produtos está em `src/produtos.js`, então o import em `produtoController.js` deve apontar para `../produtos` ou o arquivo deve ser movido para `src/data/produtos.js`.
