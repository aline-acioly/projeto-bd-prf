from typing import Optional

from fastapi import HTTPException

from app.repositories.intervencao_repository import IntervencaoRepository
from app.schemas.intervencao_schema import IntervencaoCreate, IntervencaoUpdate


class IntervencaoService:
    def __init__(self, repository: IntervencaoRepository):
        self.repository = repository

    def get_all(self, skip: int = 0, limit: int = 50, id_suspeita: Optional[int] = None):
        return self.repository.get_all(skip=skip, limit=limit, id_suspeita=id_suspeita)

    def get_by_id(self, id_intervencao: int):
        db_intervencao = self.repository.get_by_id(id_intervencao)
        if not db_intervencao:
            raise HTTPException(status_code=404, detail="Intervenção não encontrada")
        return db_intervencao

    def create(self, intervencao: IntervencaoCreate):
        return self.repository.create(intervencao)

    def update(self, id_intervencao: int, intervencao: IntervencaoUpdate):
        return self.repository.update(self.get_by_id(id_intervencao), intervencao)

    def delete(self, id_intervencao: int):
        self.repository.delete(self.get_by_id(id_intervencao))
