# Sistema de Avaliação PRF

Projeto da disciplina de Banco de Dados (CIn/UFPE). É um sistema de acompanhamento em farmacoterapia: registra pacientes, profissionais de saúde e estagiários, as consultas agendadas, a avaliação feita em cada consulta, as suspeitas de problemas com os medicamentos que o paciente usa (classificadas pela NESC: Necessidade, Efetividade, Segurança e Cumprimento) e as intervenções feitas sobre cada suspeita.

O esquema (12 tabelas, domínio `TIPO_CPF`, PKs, FKs, UNIQUEs, CHECKs e triggers) é criado pelos scripts SQL de `db/init`. A API só mapeia essas tabelas e traduz os erros do banco em respostas em português.

## Stack

- **Banco de dados:** PostgreSQL 16, com pgAdmin
- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2 e Pydantic v2
- **Frontend:** React, TypeScript, Vite, Tailwind CSS e React Router, organizado em Atomic Design (em construção)
- **Ambiente:** Docker Compose

## Estrutura de pastas

```
projeto-bd-prf/
├── docker-compose.yml        # postgres, pgadmin e backend
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
│       ├── repositories/     # consultas e gravações com SQLAlchemy
│       ├── models/           # mapeamento das tabelas existentes (sem create_all)
│       ├── schemas/          # entrada e saída com Pydantic (Create, Update, Response)
│       ├── database/         # engine e sessão
│       └── infra/errors.py   # erros do banco → {"erro", "codigo"} em português
├── requests/                 # um .http por recurso (extensão REST Client do VS Code)
└── frontend/
    └── src/
        ├── components/
        │   ├── atoms/        # peças indivisíveis
        │   ├── molecules/    # combinações simples de atoms
        │   ├── organisms/    # blocos completos, como o menu lateral
        │   └── templates/    # estrutura das páginas
        └── pages/            # telas ligadas às rotas
```

Uma requisição percorre `controllers → services → repositories → models`, e os `schemas` validam a entrada e formatam a saída.

## Como rodar (Docker)

Pré-requisito: Docker com Docker Compose.

```bash
docker compose up -d --build
```

| Serviço | Endereço | Acesso |
|---|---|---|
| API | http://localhost:8000 | `/health` confere a conexão com o banco |
| Documentação da API (Swagger) | http://localhost:8000/docs | |
| pgAdmin | http://localhost:16543 | `admin@prf.com` / `admin123` |
| PostgreSQL (do seu PC) | `localhost:15432` | banco `avaliacao_prf`, usuário `prf`, senha `prf123` |

No pgAdmin, cadastre o servidor com host `postgres`, porta `5432` e o usuário e senha acima.

Os scripts de `db/init` só rodam quando o volume do banco é criado. Para voltar ao seed:

```bash
docker compose down -v && docker compose up -d --build
```

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

Pacientes, profissionais e estagiários são subclasses de PESSOA. O `POST` grava PESSOA e a subclasse numa única transação, e o `GET` devolve os campos das duas juntos. Nas chaves compostas, o `PATCH` não altera a chave (o CPF de uma pessoa, o nome de um contato, o medicamento de um uso).

### Exemplos de requisição

A pasta `requests/` tem um `.http` por recurso: um exemplo de cada rota e os casos de erro (CHECK, UNIQUE, FK e cada trigger), com o status esperado no título. Abra no VS Code com a extensão REST Client e clique em "Send Request". A sequência "Criar → Atualizar → Apagar" de cada arquivo deixa o banco igual ao seed.

### Erros

Toda resposta de erro tem o formato `{"erro": "...", "codigo": "..."}`:

| Situação | Status | `codigo` |
|---|---|---|
| Validação do Pydantic (campo ausente, CPF fora do padrão, tipo fora da lista) | 422 | `validacao` |
| Não encontrado | 404 | `http_404` |
| PK, UNIQUE, FK ou CHECK do banco | 409 | SQLSTATE (`23505`, `23503`, `23514`...); `http_409` no CPF repetido, que é checado antes de gravar |
| Regra de trigger (`RAISE EXCEPTION`) | 400 | `P0001` |
| Erro inesperado | 500 | mensagem genérica, sem detalhes internos |

## Regras garantidas por trigger

Ficam em `db/init/02_triggers.sql`. São regras que PK, FK e CHECK não conseguem expressar sozinhos:

1. **R1. Especialização disjunta de PESSOA:** um CPF só pode ser paciente, profissional de saúde ou estagiário, nunca dois papéis. É uma trigger em cada subclasse (3 triggers).
2. **R2. Consulta válida:** o atendente precisa ser profissional de saúde ou estagiário. Uma consulta de retorno precisa ser do mesmo paciente da avaliação de origem e não pode ser agendada antes dela.
3. **R3. Avaliação válida:** a avaliação feita por estagiário exige supervisor, e a feita por profissional não tem supervisor (RN04). A avaliação também não pode ser anterior à data da consulta.
4. **R4. Suspeita válida:** o medicamento suspeito é de um uso do mesmo paciente da consulta avaliada, e a data de registro não pode ser anterior à avaliação.

Ao todo são 6 triggers. Outras regras ficam em constraints: retorno exige avaliação de origem (CHECK `ck_consulta_origem`), cada consulta tem no máximo uma avaliação (UNIQUE `uq_avaliacao_consulta`), e a suspeita só pode citar um medicamento que o paciente usa (FK composta `fk_suspeita_uso`).
