from typing import Optional

from fastapi import HTTPException

from app.repositories.suspeita_repository import SuspeitaRepository
from app.schemas.suspeita_schema import SuspeitaCreate, SuspeitaUpdate


class SuspeitaService:
    def __init__(self, repository: SuspeitaRepository):
        self.repository = repository

    def get_all(self, skip: int = 0, limit: int = 50, id_avaliacao: Optional[int] = None):
        return self.repository.get_all(skip=skip, limit=limit, id_avaliacao=id_avaliacao)

    def get_by_id(self, id_suspeita: int):
        db_suspeita = self.repository.get_by_id(id_suspeita)
        if not db_suspeita:
            raise HTTPException(status_code=404, detail="Suspeita não encontrada")
        return db_suspeita

    def create(self, suspeita: SuspeitaCreate):
        return self.repository.create(suspeita)

    def update(self, id_suspeita: int, suspeita: SuspeitaUpdate):
        return self.repository.update(self.get_by_id(id_suspeita), suspeita)

    def delete(self, id_suspeita: int):
        self.repository.delete(self.get_by_id(id_suspeita))
