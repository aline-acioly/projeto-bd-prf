from typing import Optional

from fastapi import HTTPException

from app.repositories.consulta_repository import ConsultaRepository
from app.schemas.consulta_schema import ConsultaCreate, ConsultaUpdate


class ConsultaService:
    def __init__(self, repository: ConsultaRepository):
        self.repository = repository

    def get_all(self, skip: int = 0, limit: int = 50, tipo: Optional[str] = None, cpf_paciente: Optional[str] = None):
        return self.repository.get_all(skip=skip, limit=limit, tipo=tipo, cpf_paciente=cpf_paciente)

    def get_by_id(self, id_consulta: int):
        db_consulta = self.repository.get_by_id(id_consulta)
        if not db_consulta:
            raise HTTPException(status_code=404, detail="Consulta não encontrada")
        return db_consulta

    def create(self, consulta: ConsultaCreate):
        return self.repository.create(consulta)

    def update(self, id_consulta: int, consulta: ConsultaUpdate):
        return self.repository.update(self.get_by_id(id_consulta), consulta)

    def delete(self, id_consulta: int):
        self.repository.delete(self.get_by_id(id_consulta))
