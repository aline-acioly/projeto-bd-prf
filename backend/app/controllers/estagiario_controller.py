from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.repositories.pessoa_repository import EstagiarioRepository
from app.schemas.comum import CpfRota, Paginacao
from app.schemas.estagiario_schema import (
    EstagiarioCreate,
    EstagiarioResponse,
    EstagiarioUpdate,
)
from app.services.pessoa_service import EstagiarioService

EstagiarioRouter = APIRouter(prefix="/estagiarios", tags=["Estagiários"])


def get_estagiario_service(db: Session = Depends(get_db)) -> EstagiarioService:
    return EstagiarioService(EstagiarioRepository(db))


@EstagiarioRouter.get("", response_model=List[EstagiarioResponse])
def get_all(
    paginacao: Paginacao = Depends(),
    nome: Optional[str] = None,
    service: EstagiarioService = Depends(get_estagiario_service),
):
    return service.get_all(skip=paginacao.skip, limit=paginacao.limit, nome=nome)


@EstagiarioRouter.get("/{cpf}", response_model=EstagiarioResponse)
def get_by_cpf(
    cpf: CpfRota,
    service: EstagiarioService = Depends(get_estagiario_service),
):
    return service.get_by_cpf(cpf)


@EstagiarioRouter.post("", response_model=EstagiarioResponse, status_code=201)
def create(
    estagiario: EstagiarioCreate,
    service: EstagiarioService = Depends(get_estagiario_service),
):
    return service.create(estagiario)


@EstagiarioRouter.patch("/{cpf}", response_model=EstagiarioResponse)
def update(
    cpf: CpfRota,
    estagiario: EstagiarioUpdate,
    service: EstagiarioService = Depends(get_estagiario_service),
):
    return service.update(cpf, estagiario)


@EstagiarioRouter.delete("/{cpf}", status_code=204)
def delete(
    cpf: CpfRota,
    service: EstagiarioService = Depends(get_estagiario_service),
):
    service.delete(cpf)
