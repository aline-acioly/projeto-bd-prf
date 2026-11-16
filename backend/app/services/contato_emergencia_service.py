from fastapi import HTTPException

from app.repositories.contato_emergencia_repository import ContatoEmergenciaRepository
from app.repositories.pessoa_repository import PacienteRepository
from app.schemas.contato_emergencia_schema import (
    ContatoEmergenciaCreate,
    ContatoEmergenciaUpdate,
)


class ContatoEmergenciaService:
    def __init__(
        self,
        repository: ContatoEmergenciaRepository,
        paciente_repository: PacienteRepository,
    ):
        self.repository = repository
        self.paciente_repository = paciente_repository

    def _checar_paciente(self, cpf_paciente: str) -> None:
        # Antes de gravar: sem isto, o POST cairia na FK (409) em vez de 404.
        if not self.paciente_repository.get_by_cpf(cpf_paciente):
            raise HTTPException(status_code=404, detail="Paciente não encontrado")

    def get_all(self, cpf_paciente: str, skip: int = 0, limit: int = 50):
        self._checar_paciente(cpf_paciente)
        return self.repository.get_all(cpf_paciente, skip=skip, limit=limit)

    def get_by_nome(self, cpf_paciente: str, nome: str):
        self._checar_paciente(cpf_paciente)
        contato = self.repository.get_by_nome(cpf_paciente, nome)
        if not contato:
            raise HTTPException(status_code=404, detail="Contato de emergência não encontrado")
        return contato

    def create(self, cpf_paciente: str, contato: ContatoEmergenciaCreate):
        # Contato repetido: a PK pk_contatos recusa e o handler dá 409.
        self._checar_paciente(cpf_paciente)
        return self.repository.create(cpf_paciente, contato)

    def update(self, cpf_paciente: str, nome: str, contato: ContatoEmergenciaUpdate):
        return self.repository.update(self.get_by_nome(cpf_paciente, nome), contato)

    def delete(self, cpf_paciente: str, nome: str):
        self.repository.delete(self.get_by_nome(cpf_paciente, nome))
