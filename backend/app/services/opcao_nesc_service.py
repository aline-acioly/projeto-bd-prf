from typing import Optional

from fastapi import HTTPException

from app.repositories.opcao_nesc_repository import OpcaoNescRepository
from app.schemas.opcao_nesc_schema import OpcaoNescCreate, OpcaoNescUpdate


class OpcaoNescService:
    def __init__(self, repository: OpcaoNescRepository):
        self.repository = repository

    def get_all(self, skip: int = 0, limit: int = 50, categoria: Optional[str] = None):
        return self.repository.get_all(skip=skip, limit=limit, categoria=categoria)

    def get_by_id(self, id_opcao_nesc: int):
        opcao = self.repository.get_by_id(id_opcao_nesc)
        if not opcao:
            raise HTTPException(status_code=404, detail="Opção NESC não encontrada")
        return opcao

    def create(self, opcao: OpcaoNescCreate):
        return self.repository.create(opcao)

    def update(self, id_opcao_nesc: int, opcao: OpcaoNescUpdate):
        return self.repository.update(self.get_by_id(id_opcao_nesc), opcao)

    def delete(self, id_opcao_nesc: int):
        self.repository.delete(self.get_by_id(id_opcao_nesc))
