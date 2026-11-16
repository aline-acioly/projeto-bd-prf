from typing import Optional

from fastapi import HTTPException

from app.repositories.avaliacao_repository import AvaliacaoRepository
from app.schemas.avaliacao_schema import AvaliacaoCreate, AvaliacaoUpdate


class AvaliacaoService:
    def __init__(self, repository: AvaliacaoRepository):
        self.repository = repository

    def get_all(self, skip: int = 0, limit: int = 50, cpf_paciente: Optional[str] = None):
        return self.repository.get_all(skip=skip, limit=limit, cpf_paciente=cpf_paciente)

    def get_by_id(self, id_avaliacao: int):
        db_avaliacao = self.repository.get_by_id(id_avaliacao)
        if not db_avaliacao:
            raise HTTPException(status_code=404, detail="Avaliação não encontrada")
        return db_avaliacao

    def create(self, avaliacao: AvaliacaoCreate):
        return self.repository.create(avaliacao)

    def update(self, id_avaliacao: int, avaliacao: AvaliacaoUpdate):
        return self.repository.update(self.get_by_id(id_avaliacao), avaliacao)

    def delete(self, id_avaliacao: int):
        self.repository.delete(self.get_by_id(id_avaliacao))
