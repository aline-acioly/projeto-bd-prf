# Sistema de Avaliação PRF

Projeto da disciplina de Banco de Dados (CIn/UFPE): sistema de acompanhamento em farmacoterapia, com pacientes, profissionais de saúde, estagiários, consultas, avaliações, suspeitas de problemas com medicamentos e intervenções.

## Stack

- **Backend:** Python, FastAPI, SQLAlchemy 2 e Pydantic
- **Frontend:** React, TypeScript, Vite, Tailwind CSS e React Router, organizado em Atomic Design
- **Banco de dados:** PostgreSQL 16

## Estrutura de pastas

```
projeto-bd-prf/
├── backend/
│   ├── app/
│   │   ├── controllers/     # Rotas da API
│   │   ├── services/        # Regras de negócio
│   │   ├── repositories/    # Acesso ao banco de dados
│   │   ├── models/          # Mapeamento das tabelas (SQLAlchemy)
│   │   ├── schemas/         # Validação de dados (Pydantic)
│   │   ├── database/        # Conexão com o banco
│   │   └── main.py          # Ponto de entrada da API
│   ├── .env.example
│   └── requirements.txt
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   ├── atoms/       # Peças indivisíveis
        │   ├── molecules/   # Combinações simples de atoms
        │   ├── organisms/   # Blocos completos, como o menu lateral
        │   └── templates/   # Estrutura das páginas
        └── pages/           # Telas ligadas às rotas
```

## Como rodar

Em construção.
