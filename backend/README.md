# Backend — Sistema de Avaliação PRF

API em Python 3.12 com FastAPI, SQLAlchemy 2 e Pydantic v2. Ela só **mapeia** as tabelas criadas pelos scripts de `db/init` (nunca usa `create_all`) e traduz os erros do banco em respostas `{"erro", "codigo"}` em português.

A visão geral do projeto, a lista de rotas, as regras das triggers e como subir tudo com o Docker estão no [README da raiz](../README.md).

## Estrutura

```
backend/
├── Dockerfile            # python:3.12-slim + uvicorn em 0.0.0.0:8000
├── requirements.txt
├── .env.example          # DATABASE_URL para rodar fora do Docker
└── app/
    ├── main.py           # cria a API, registra as rotas, o CORS e os handlers de erro
    ├── controllers/      # rotas HTTP, uma por recurso (+ relatorio_controller)
    ├── services/         # regras da aplicação: 404, checagens antes de gravar
    ├── repositories/     # consultas e gravações com SQLAlchemy; relatórios em SQL puro (text())
    ├── models/           # mapeamento das 12 tabelas existentes
    ├── schemas/          # entrada e saída com Pydantic (Create, Update, Response); comum.py tem
    │                     # CPF, ids, paginação e filtros reutilizáveis
    ├── database/         # engine e sessão (get_db)
    └── infra/errors.py   # IntegrityError → 409, trigger (P0001) → 400, validação → 422...
```

## Camadas

Cada recurso segue o mesmo caminho, no padrão dos arquivos de medicamento:

```
controller  →  service  →  repository  →  model
 (rota HTTP)   (regras)    (SQLAlchemy)   (tabela)
```

- Os **schemas** validam o que entra (`*Create`, `*Update`) e formatam o que sai (`*Response`).
- As regras que o banco já garante (PK, FK, UNIQUE, CHECK e triggers) não são repetidas no Python: o banco recusa e o `infra/errors.py` transforma o erro em resposta.
- Pacientes, profissionais e estagiários gravam PESSOA e a subclasse na mesma transação (`pessoa_repository.py`).

## Como rodar local

O banco continua no Docker. Na raiz do projeto:

```bash
docker compose up -d postgres pgadmin   # o container "backend" também usaria a porta 8000
cd backend
python -m venv .venv
source .venv/bin/activate               # Windows (PowerShell): .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env                    # Windows: copy .env.example .env
uvicorn app.main:app --reload
```

A API fica em http://localhost:8000. A documentação interativa fica em http://localhost:8000/docs, e http://localhost:8000/health confere a conexão com o banco.

Para testar, os arquivos de `../requests/` (extensão REST Client do VS Code) têm um exemplo de cada rota e os casos de erro, com o status esperado no título.
