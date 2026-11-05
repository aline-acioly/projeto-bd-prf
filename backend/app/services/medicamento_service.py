from typing import Optional

from fastapi import HTTPException

from app.repositories.medicamento_repository import MedicamentoRepository
from app.schemas.medicamento_schema import MedicamentoCreate, MedicamentoUpdate


class MedicamentoService:
    def __init__(self, repository: MedicamentoRepository):
        self.repository = repository

    def get_all(self, skip: int = 0, limit: int = 50, nome: Optional[str] = None):
        return self.repository.get_all(skip=skip, limit=limit, nome=nome)

    def get_by_id(self, id_medicamento: int):
        medicamento = self.repository.get_by_id(id_medicamento)
        if not medicamento:
            raise HTTPException(status_code=404, detail="Medicamento não encontrado")
        return medicamento

    def create(self, medicamento: MedicamentoCreate):
        return self.repository.create(medicamento)

    def update(self, id_medicamento: int, medicamento: MedicamentoUpdate):
        return self.repository.update(self.get_by_id(id_medicamento), medicamento)

    def delete(self, id_medicamento: int):
        self.repository.delete(self.get_by_id(id_medicamento))
