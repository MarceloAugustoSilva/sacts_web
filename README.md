# SACTS - Sistema de Agendamento e Controle de Transporte Sanitário

Aplicação full stack com HTML, CSS, JavaScript, Node.js, Express, MongoDB, Mongoose e autenticação JWT.

## Funcionalidades

- Registro e login com JWT
- CRUD completo de pacientes, motoristas, veículos e agendamentos
- Campo de **quilometragem (km)** nos agendamentos, usado no relatório
- **Relatórios gerenciais** com indicadores de desempenho:
  - Total de viagens e viagens por status (agendado, em andamento, concluído, cancelado)
  - Total de pacientes transportados
  - Quilometragem total percorrida
  - Motoristas mais ativos (viagens por motorista)
  - Uso da frota (viagens por veículo)
  - Gráficos de barras simples feitos só com HTML/CSS (sem bibliotecas)
- API REST em Express, front-end vanilla consumindo a API
- Validações no front-end e back-end e tratamento de erros
- Loading e toasts padronizados
- Layout responsivo e acessível (HTML semântico, foco visível, contraste)
- Organização MVC
- Seed automático com dados de demonstração (já com km preenchido)
- Deploy preparado para Vercel

## Dados de demonstração

Ao conectar no MongoDB, o sistema cria dados automaticamente se o banco estiver vazio.

Usuário demo:

```txt
E-mail: demo@sacts.com
Senha: 123456
```

Também existe um botão no sistema para recarregar os dados demo.

## Como testar os relatórios

1. Faça login com o usuário demo.
2. Clique em **Dados demo** (no topo) para garantir que existam agendamentos com quilometragem.
3. Vá até a aba **Relatórios** — você verá:
   - Cards com totais (viagens, pacientes transportados, km, frota).
   - Gráfico de barras com a distribuição por status.
   - Ranking de motoristas mais ativos e uso da frota.
4. Cadastre/edite um agendamento informando o campo **Quilometragem (km)**
   e volte aos relatórios — o total será recalculado.

Endpoint usado pelo painel:

```txt
GET /api/reports/summary   (requer token JWT)
```

## Estrutura

```txt
sacts-vercel-mvc/
├── api/
│   └── index.js
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── seed/
├── .env.example
├── .gitignore
├── package.json
├── vercel.json
└── README.md
```

## Rodar localmente

```bash
npm install
cp .env.example .env
npm run dev
```

Acesse:

```txt
http://localhost:3000
```

## Variáveis de ambiente

Crie um arquivo `.env` localmente com:

```txt
MONGODB_URI=mongodb+srv://USUARIO:SENHA@cluster.mongodb.net/sacts?retryWrites=true&w=majority
JWT_SECRET=sua_chave_secreta_grande
NODE_ENV=development
PORT=3000
```

## Checklist de entrega

- [x] HTML, CSS e JavaScript
- [x] Responsividade e design moderno
- [x] Node.js, Express e API REST
- [x] MongoDB, Mongoose e autenticação JWT
- [x] Git, GitHub e deploy na Vercel
- [x] Registro e login
- [x] CRUD completo
- [x] Dados cadastrados para demonstração
- [x] Front-end consumindo API
- [x] Validações e tratamento de erros
- [x] Organização MVC
- [x] Código limpo e legível
- [x] Boas práticas com async/await e .env
- [x] UX com loading e feedback visual
- [x] HTML semântico
- [x] README documentado
- [x] .env.example presente
- [x] .env fora do repositório

## deploy

```txt
https://SEU-LINK.vercel.app/api/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "app": "SACTS API"
}
```
