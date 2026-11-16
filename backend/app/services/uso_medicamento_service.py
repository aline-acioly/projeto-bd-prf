from fastapi import HTTPException

from app.repositories.pessoa_repository import PacienteRepository
from app.repositories.uso_medicamento_repository import UsoMedicamentoRepository
from app.schemas.uso_medicamento_schema import (
    UsoMedicamentoCreate,
    UsoMedicamentoUpdate,
)


class UsoMedicamentoService:
    def __init__(
        self,
        repository: UsoMedicamentoRepository,
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

    def get_by_id(self, cpf_paciente: str, id_medicamento: int):
        self._checar_paciente(cpf_paciente)
        uso = self.repository.get_by_id(cpf_paciente, id_medicamento)
        if not uso:
            raise HTTPException(
                status_code=404, detail="Este paciente não usa este medicamento"
            )
        return uso

    def create(self, cpf_paciente: str, uso: UsoMedicamentoCreate):
        # Medicamento inexistente → FK (409); mesmo medicamento duas vezes → PK pk_uso (409).
        self._checar_paciente(cpf_paciente)
        return self.repository.create(cpf_paciente, uso)

    def update(self, cpf_paciente: str, id_medicamento: int, uso: UsoMedicamentoUpdate):
        return self.repository.update(self.get_by_id(cpf_paciente, id_medicamento), uso)

    def delete(self, cpf_paciente: str, id_medicamento: int):
        self.repository.delete(self.get_by_id(cpf_paciente, id_medicamento))
