# Sistema de Avaliação PRF

Projeto da disciplina de Banco de Dados (CIn/UFPE). É um sistema de acompanhamento em farmacoterapia: registra pacientes, profissionais de saúde e estagiários, as consultas agendadas, a avaliação feita em cada consulta, as suspeitas de problemas com os medicamentos que o paciente usa (classificadas pela NESC: Necessidade, Efetividade, Segurança e Cumprimento) e as intervenções feitas sobre cada suspeita.

O esquema (12 tabelas, domínio `TIPO_CPF`, PKs, FKs, UNIQUEs, CHECKs e triggers) é criado pelos scripts SQL de `db/init`. A API só mapeia essas tabelas e traduz os erros do banco em respostas em português. A interface web tem uma página por recurso e uma página de relatórios com as consultas SQL da disciplina.

## Stack

- **Banco de dados:** PostgreSQL 16, com pgAdmin
- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2 e Pydantic v2
- **Frontend:** React, TypeScript, Vite, Tailwind CSS e React Router, organizado em Atomic Design e servido pelo nginx no Docker
- **Ambiente:** Docker Compose

## Estrutura de pastas

```
projeto-bd-prf/
├── docker-compose.yml        # postgres, pgadmin, backend e frontend
├── pgadmin/                  # servidor "PRF" pré-cadastrado no pgAdmin
│   ├── servers.json          # importado na 1ª subida do pgAdmin
│   └── pgpass                # senha do banco, para o pgAdmin não pedir
├── db/init/                  # rodam na 1ª subida do Postgres, em ordem
│   ├── 01_schema.sql         # tabelas, domínio TIPO_CPF e constraints
│   ├── 02_triggers.sql       # regras R1 a R4
│   └── 03_seed.sql           # dados de exemplo
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example          # DATABASE_URL para rodar fora do Docker
│   └── app/
│       ├── main.py           # cria a API, registra rotas, CORS e handlers de erro
│       ├── controllers/      # rotas HTTP (uma por recurso)
│       ├── services/         # regras da aplicação (404, checagens antes de gravar)
│       ├── repositories/     # consultas e gravações com SQLAlchemy (relatórios em SQL puro)
│       ├── models/           # mapeamento das tabelas existentes (sem create_all)
│       ├── schemas/          # entrada e saída com Pydantic (Create, Update, Response)
│       ├── database/         # engine e sessão
│       └── infra/errors.py   # erros do banco → {"erro", "codigo"} em português
├── requests/                 # um .http por recurso (extensão REST Client do VS Code)
└── frontend/                 # detalhes em frontend/README.md
    ├── Dockerfile            # build com Node, servido pelo nginx
    └── src/
        ├── components/
        │   ├── atoms/        # Badge, Button, Input, Label, Select, Tooltip
        │   │                 # (+ badgesDoDominio: tipo, situação, papel, categoria NESC)
        │   ├── molecules/    # FormField, Modal, PageHeader, SqlBlock, StatCard
        │   ├── organisms/    # ConfirmDialog, CrudSection, DataTable, RelatorioSection,
        │   │                 # ResourceForm, Sidebar, Toast
        │   └── templates/    # MainLayout (menu lateral + conteúdo)
        ├── pages/            # Início, uma página por recurso, ficha do paciente e relatórios
        ├── services/         # cliente HTTP e uma função por rota da API
        ├── hooks/            # useListaPaginada, useToast
        ├── types/            # tipos que espelham as respostas da API
        └── utils/            # formatação, rótulos, situação da consulta, opções dos selects
```

Uma requisição percorre `controllers → services → repositories → models`, e os `schemas` validam a entrada e formatam a saída.

## Como rodar (Docker)

Pré-requisito: Docker com Docker Compose. Um único comando sobe tudo: frontend, backend, banco e pgAdmin. O banco já vem com o esquema, as triggers e o seed.

```bash
docker compose up -d --build
```

| Serviço | Endereço | Acesso |
|---|---|---|
| Frontend | http://localhost:8080 | a interface do sistema |
| API | http://localhost:8000 | `/health` confere a conexão com o banco |
| Documentação da API (Swagger) | http://localhost:8000/docs | |
| pgAdmin | http://localhost:16543 | `admin@prf.com` / `admin123` |

Os scripts de `db/init` só rodam quando o volume do banco é criado. Para voltar ao seed:

```bash
docker compose down -v && docker compose up -d --build
```

### pgAdmin

Ao entrar em http://localhost:16543 (`admin@prf.com` / `admin123`), o servidor **PRF** já aparece em *Servers*. Basta clicar nele: a conexão abre sem pedir senha e o banco é o `avaliacao_prf`.

Como funciona:
- O `pgadmin/servers.json` é importado na primeira subida do pgAdmin, pela variável `PGADMIN_SERVER_JSON_FILE` da imagem `dpage/pgadmin4`.
- A senha vem do `pgadmin/pgpass`. Ao iniciar, o container copia esse arquivo para a pasta do usuário do pgAdmin com permissão 600, porque o PostgreSQL ignora um arquivo de senha com permissões abertas.
- O pgAdmin não tem volume: a importação se repete toda vez que o container é recriado.

Se o servidor não aparecer, ou se pedir senha, cadastre à mão em *Register → Server*:

| Campo | Valor |
|---|---|
| Name | PRF (qualquer nome) |
| Host name/address | `postgres` (o nome do serviço no compose, não `localhost`) |
| Port | `5432` (a porta de dentro da rede do compose) |
| Maintenance database | `avaliacao_prf` |
| Username | `prf` |
| Password | `prf123` |

### Acesso direto ao banco (DBeaver, psql)

Do seu PC, o PostgreSQL fica em `localhost:15432` (banco `avaliacao_prf`, usuário `prf`, senha `prf123`), por exemplo:

```bash
psql -h localhost -p 15432 -U prf -d avaliacao_prf
```

Essa porta é do protocolo do PostgreSQL, não HTTP: abrir `localhost:15432` no navegador não mostra nada. Para ver o banco pelo navegador, use o pgAdmin em http://localhost:16543.

## Como rodar o backend local (sem Docker para a API)

O banco continua no Docker. Suba só ele (e o pgAdmin, se quiser), porque o container do backend também usa a porta 8000:

```bash
docker compose up -d postgres pgadmin
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows (PowerShell): .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env               # Windows: copy .env.example .env
uvicorn app.main:app --reload
```

O `.env` aponta para `localhost:15432`, e o serviço `backend` do compose usa o host `postgres` na porta `5432`.

## Como rodar o frontend local

Com a API em http://localhost:8000, pelo Docker ou local. Pare o container do frontend, porque ele usa a mesma porta 8080:

```bash
docker compose stop frontend
cd frontend
npm install
npm run dev                         # http://localhost:8080
```

Mais detalhes, incluindo a organização em Atomic Design, em [`frontend/README.md`](frontend/README.md).

## Interface

- **Início:** cards com os números principais e a lista de atendimentos pendentes (consultas sem avaliação, as atrasadas primeiro).
- **Menu lateral:** uma página por recurso, cada uma com tabela paginada, formulário de criar/editar num modal e exclusão com confirmação.
- **Chaves:** são escolhidas em selects carregados da API, nunca digitadas. Isso vale para paciente, atendente, supervisor, medicamento, medicamento em uso, opção NESC, consulta, avaliação e suspeita.
- **Ficha do paciente:** acessada clicando no nome do paciente na tabela de Pacientes. Mostra os contatos de emergência e os medicamentos em uso, cada um com o seu CRUD.
- **Situação da consulta:** tem três estados: **Realizada** (tem avaliação), **Não realizada** (sem avaliação e com data anterior a hoje) e **Agendada** (sem avaliação, de hoje em diante). Não existe coluna no banco para isso: a situação é calculada a partir da avaliação e da data, em `frontend/src/utils/situacao.ts`. O comentário desse arquivo traz a mesma regra em SQL (`CASE` com `LEFT JOIN` em AVALIACAO).
- **Rótulos:** por causa dos CHECKs, o banco guarda valores canônicos (`'retorno'`, `'quantitativo'`, `'orientação sobre medicamento'`...). As telas mostram rótulos ("Retorno", "Quantitativo", "Orientação sobre medicamento"), e os selects continuam enviando o valor do banco. Os Relatórios mostram o resultado cru do SQL, sem rótulos; só data, CPF e telefone são formatados.
- **Regras nos formulários:** os campos que dependem das triggers têm um tooltip (?) explicando a regra:
  - avaliação de origem do retorno (R2);
  - supervisor da avaliação (R3);
  - medicamento da suspeita (R4).
- **Erros:** qualquer erro da API aparece num aviso (toast) com a mensagem do backend, inclusive as mensagens das triggers.
- **Relatórios:** a página mostra o resultado de cada consulta e, embaixo, o SQL executado, num bloco recolhível.

## Rotas

Todo recurso tem `GET` de lista (com `?skip=` e `?limit=`, padrão 50 e máximo 200), `GET` por chave, `POST` (201), `PATCH` (só os campos enviados) e `DELETE` (204).

| Recurso | Rota | Chave | Filtros da lista |
|---|---|---|---|
| Pacientes | `/pacientes` | `cpf` | `?nome=` (parcial) |
| Profissionais de saúde | `/profissionais` | `cpf` | `?nome=` |
| Estagiários | `/estagiarios` | `cpf` | `?nome=` |
| Contatos de emergência | `/pacientes/{cpf}/contatos` | `nome` | |
| Medicamentos em uso | `/pacientes/{cpf}/medicamentos` | `id_medicamento` | |
| Medicamentos (catálogo) | `/medicamentos` | `id_medicamento` | `?nome=` |
| Opções NESC | `/opcoes-nesc` | `id_opcao_nesc` | `?categoria=` |
| Consultas | `/consultas` | `id_consulta` | `?tipo=`, `?cpf_paciente=` |
| Avaliações | `/avaliacoes` | `id_avaliacao` | `?cpf_paciente=` |
| Suspeitas | `/suspeitas` | `id_suspeita` | `?id_avaliacao=` |
| Intervenções | `/intervencoes` | `id_intervencao` | `?id_suspeita=` |

### Relatórios

Ficam em `/relatorios` e só têm `GET`. As consultas são SQL puro, executado com `text()` do SQLAlchemy (`backend/app/repositories/relatorio_repository.py`). Cada resposta traz `{"sql": "...", "linhas": [...]}`: o comando executado e o resultado.

| Rota | O que mostra | SQL |
|---|---|---|
| `/relatorios/historico-paciente/{cpf}` | consultas, avaliações, medicamentos suspeitos e problema NESC de um paciente | JOIN e LEFT JOIN |
| `/relatorios/suspeitas-por-categoria` | suspeitas por categoria NESC | GROUP BY + COUNT |
| `/relatorios/pacientes-sem-avaliacao` | pacientes que nunca foram avaliados | NOT EXISTS |
| `/relatorios/retornos-pendentes` | retornos ainda sem avaliação | NOT EXISTS |
| `/relatorios/avaliacoes-estagiarios` | avaliações de estagiários e o supervisor de cada uma | PESSOA com aliases |
| `/relatorios/medicamentos-mais-suspeitas` | medicamento(s) com mais suspeitas, com empates | HAVING + `>= ALL` |
| `/relatorios/pacientes-polifarmacia` | pacientes com mais de um medicamento em uso | GROUP BY + HAVING |
| `/relatorios/intervencoes-por-tipo` | intervenções por tipo | GROUP BY + ORDER BY |
| `/relatorios/resumo` | contagens da página Início (pacientes, consultas sem avaliação, retornos pendentes, suspeitas) | subconsultas escalares + NOT EXISTS |
| `/relatorios/proximos-atendimentos` | lista "Atendimentos pendentes" da Início: consultas ainda sem avaliação, por data (as atrasadas primeiro), com o papel do atendente | NOT EXISTS + CASE WHEN EXISTS |

Pacientes, profissionais e estagiários são subclasses de PESSOA. O `POST` grava PESSOA e a subclasse numa única transação, e o `GET` devolve os campos das duas juntos. Nas chaves compostas, o `PATCH` não altera a chave (o CPF de uma pessoa, o nome de um contato, o medicamento de um uso).

### Exemplos de requisição

A pasta `requests/` tem um `.http` por recurso, mais o `relatorios.http`: um exemplo de cada rota e os casos de erro (CHECK, UNIQUE, FK e cada trigger), com o status esperado no título. Abra no VS Code com a extensão REST Client e clique em "Send Request". A sequência "Criar → Atualizar → Apagar" de cada arquivo deixa o banco igual ao seed.

### Erros

Toda resposta de erro tem o formato `{"erro": "...", "codigo": "..."}`:

| Situação | Status | `codigo` |
|---|---|---|
| Validação do Pydantic (campo ausente, CPF fora do padrão, tipo fora da lista) | 422 | `validacao` |
| Não encontrado | 404 | `http_404` |
| PK, UNIQUE, FK ou CHECK do banco | 409 | SQLSTATE (`23505`, `23503`, `23514`...); `http_409` no CPF repetido, que é checado antes de gravar |
| Valor que o banco recusa pelo tipo ou pela faixa (`DataError`), ou texto com caractere nulo (`\x00`) | 422 | SQLSTATE do banco; vazio no caractere nulo |
| Regra de trigger (`RAISE EXCEPTION`) | 400 | `P0001` |
| Erro inesperado | 500 | mensagem genérica, sem detalhes internos |

## Regras garantidas por trigger

Ficam em `db/init/02_triggers.sql`. São regras que PK, FK e CHECK não conseguem expressar sozinhos:

1. **R1. Especialização disjunta de PESSOA:** um CPF só pode ser paciente, profissional de saúde ou estagiário, nunca dois papéis. É uma trigger em cada subclasse (3 triggers).
2. **R2. Consulta válida:** o atendente precisa ser profissional de saúde ou estagiário. Uma consulta de retorno precisa ser do mesmo paciente da avaliação de origem e não pode ser agendada antes dela.
3. **R3. Avaliação válida:** a avaliação feita por estagiário exige supervisor, e a feita por profissional não tem supervisor (RN04). A avaliação também não pode ser anterior à data da consulta.
4. **R4. Suspeita válida:** o medicamento suspeito é de um uso do mesmo paciente da consulta avaliada, e a data de registro não pode ser anterior à avaliação.

Ao todo são 6 triggers. Outras regras ficam em constraints: retorno exige avaliação de origem (CHECK `ck_consulta_origem`), cada consulta tem no máximo uma avaliação (UNIQUE `uq_avaliacao_consulta`), e a suspeita só pode citar um medicamento que o paciente usa (FK composta `fk_suspeita_uso`).

**Limitação conhecida:** a R3 só roda no INSERT/UPDATE de AVALIACAO, e a R4 só no INSERT/UPDATE de SUSPEITA. Por isso, se uma consulta for alterada depois de já ter avaliação, nenhuma das duas é conferida de novo. Isso vale para a troca de atendente, de data e também de paciente, que afeta a R4. O mesmo acontece quando a data de uma avaliação muda depois que ela já tem suspeitas (R4). Os quatro casos foram testados e o banco aceita o UPDATE. A correção seria uma trigger de UPDATE em CONSULTA, por exemplo estendendo a `tg_consulta_valida`, que já roda no UPDATE, para reconferir a avaliação e as suspeitas da consulta. Para cobrir a data da avaliação, `tg_avaliacao_valida` precisaria fazer o mesmo com as suspeitas.
