from typing import Optional

from fastapi import HTTPException
from pydantic import BaseModel

from app.infra.errors import MENSAGENS_CONSTRAINT
from app.repositories.pessoa_repository import (
    EstagiarioRepository,
    PacienteRepository,
    PapelPessoaRepository,
    ProfissionalSaudeRepository,
)


class PapelPessoaService:
    nao_encontrado: str
    # Mesma mensagem que o handler daria para a PK da subclasse.
    ja_cadastrado: str

    def __init__(self, repository: PapelPessoaRepository):
        self.repository = repository

    def get_all(self, skip: int = 0, limit: int = 50, nome: Optional[str] = None):
        return self.repository.get_all(skip=skip, limit=limit, nome=nome)

    def get_by_cpf(self, cpf: str):
        db_papel = self.repository.get_by_cpf(cpf)
        if not db_papel:
            raise HTTPException(status_code=404, detail=self.nao_encontrado)
        return db_papel

    def create(self, dados: BaseModel):
        # Se o CPF já está em PESSOA, reaproveita a linha em vez de inserir de novo:
        # assim o INSERT na subclasse chega à trigger R1 (400) quando o CPF tem outro papel,
        # e a sessão não fica com dois objetos Pessoa de mesmo CPF (FlushError → 500).
        pessoa = self.repository.get_pessoa(dados.cpf)
        if pessoa is not None and self.repository.get_by_cpf(dados.cpf) is not None:
            # A trigger R1 roda antes da PK e também recusaria, mas com 400;
            # CPF repetido no mesmo papel é conflito (409).
            raise HTTPException(status_code=409, detail=self.ja_cadastrado)
        return self.repository.create(dados, pessoa)

    def update(self, cpf: str, dados: BaseModel):
        return self.repository.update(self.get_by_cpf(cpf), dados)

    def delete(self, cpf: str):
        self.repository.delete(self.get_by_cpf(cpf))


class PacienteService(PapelPessoaService):
    nao_encontrado = "Paciente não encontrado"
    ja_cadastrado = MENSAGENS_CONSTRAINT["paciente_pkey"]

    def __init__(self, repository: PacienteRepository):
        super().__init__(repository)


class ProfissionalSaudeService(PapelPessoaService):
    nao_encontrado = "Profissional de saúde não encontrado"
    ja_cadastrado = MENSAGENS_CONSTRAINT["profissional_saude_pkey"]

    def __init__(self, repository: ProfissionalSaudeRepository):
        super().__init__(repository)


class EstagiarioService(PapelPessoaService):
    nao_encontrado = "Estagiário não encontrado"
    ja_cadastrado = MENSAGENS_CONSTRAINT["estagiario_pkey"]

    def __init__(self, repository: EstagiarioRepository):
        super().__init__(repository)
