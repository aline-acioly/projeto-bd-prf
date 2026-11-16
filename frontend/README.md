# Frontend — Sistema de Avaliação PRF

Interface web do sistema: uma página por recurso (tabela, formulário em modal e exclusão com confirmação), a ficha do paciente com os contatos e os medicamentos em uso dele, e a página de relatórios, que mostra o resultado e o SQL de cada consulta.

React 18, TypeScript, Vite, Tailwind CSS e React Router. Os componentes foram escritos do zero, sem biblioteca de componentes, e estão organizados em Atomic Design.

## Estrutura

```
frontend/
├── Dockerfile            # build com node:20-alpine, servido pelo nginx:alpine
├── nginx.conf            # fallback para index.html (rotas do React Router)
├── .env.example          # VITE_API_URL
└── src/
    ├── main.tsx, App.tsx # entrada e rotas
    ├── components/
    │   ├── atoms/        # Badge, Button, Input, Label, Select, Tooltip
    │   │                 # badgesDoDominio: tipo e situação da consulta, papel, categoria NESC
    │   ├── molecules/    # FormField (label + campo + erro), Modal, PageHeader,
    │   │                 # SqlBlock (SQL recolhível), StatCard (card de indicador)
    │   ├── organisms/    # DataTable, ResourceForm, ConfirmDialog, ToastProvider,
    │   │                 # CrudSection (tabela + formulário + exclusão), RelatorioSection, Sidebar
    │   └── templates/    # MainLayout (menu lateral + conteúdo centralizado)
    ├── pages/            # InicioPage, uma página por recurso, PacienteDetalhePage e RelatoriosPage
    ├── services/         # cliente HTTP (fetch) e uma função por rota da API
    ├── hooks/            # useToast, useListaPaginada
    ├── types/            # tipos que espelham os schemas de resposta do backend
    └── utils/            # formatação (data, CPF, telefone, sexo), rótulos dos domínios do banco,
                          # situação da consulta e opções dos selects carregadas da API
```

### Como as peças se encaixam

- **Estilo:** as cores existem só como tokens em `tailwind.config.ts`: `primary` (verde-petróleo, em escala), `accent` (âmbar) e os neutros `stone`. Nenhum componente usa cor em hex. As fontes são IBM Plex Sans (texto) e IBM Plex Mono (CPF, ids, números e SQL), carregadas no `index.html`.
- **Atoms e molecules** são visuais e não conhecem a API.
- **Organisms genéricos** recebem tudo por props. O `ResourceForm` recebe a lista de campos (`text`, `date`, `number` ou `select`) e suporta:
  - selects carregados da API, inclusive os que dependem de outro campo;
  - campos condicionais;
  - chaves que só podem ser preenchidas na criação.

  O `CrudSection` junta `DataTable`, `ResourceForm`, `ConfirmDialog` e os toasts. Por isso cada página só declara colunas, campos e as chamadas à API.
- **Services:** `services/api.ts` faz as requisições. Quando a API devolve erro, ele lê o `{"erro", "codigo"}` do backend e lança um `ApiError` com a mensagem em português, que aparece no toast. Erros de validação (422) também são mostrados embaixo do campo correspondente.
- **Selects no lugar de chaves:** o usuário nunca digita CPF ou id de outra tabela. Paciente, atendente, supervisor, medicamento, opção NESC, consulta, avaliação e suspeita são escolhidos em selects carregados da API.

## Como rodar

### Com Docker (junto com o resto do sistema)

Na raiz do projeto:

```bash
docker compose up -d --build
```

O frontend fica em http://localhost:8080. A URL da API (`VITE_API_URL`) é gravada no JavaScript durante o build, por isso é passada como build arg no `docker-compose.yml`, com o padrão `http://localhost:8000`.

### Local (para desenvolver)

Pré-requisitos: Node.js 20 ou mais recente e a API rodando em http://localhost:8000. Se o container `prf-frontend` estiver de pé, pare-o antes, porque ele também usa a porta 8080 (`docker compose stop frontend`).

```bash
cd frontend
npm install
cp .env.example .env    # opcional: só se a API não estiver em http://localhost:8000
npm run dev             # http://localhost:8080
```

Outros scripts:

| Script | O que faz |
|---|---|
| `npm run build` | checa os tipos (`tsc`) e gera o `dist/` |
| `npm run lint` | ESLint |
| `npm run preview` | serve o `dist/` gerado |
