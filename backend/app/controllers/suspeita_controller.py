from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.repositories.suspeita_repository import SuspeitaRepository
from app.schemas.comum import IdFiltro, IdRota, Paginacao
from app.schemas.suspeita_schema import (
    SuspeitaCreate,
    SuspeitaResponse,
    SuspeitaUpdate,
)
from app.services.suspeita_service import SuspeitaService

SuspeitaRouter = APIRouter(prefix="/suspeitas", tags=["Suspeitas"])


def get_suspeita_service(db: Session = Depends(get_db)) -> SuspeitaService:
    return SuspeitaService(SuspeitaRepository(db))


@SuspeitaRouter.get("", response_model=List[SuspeitaResponse])
def get_all(
    paginacao: Paginacao = Depends(),
    id_avaliacao: IdFiltro = None,
    service: SuspeitaService = Depends(get_suspeita_service),
):
    return service.get_all(skip=paginacao.skip, limit=paginacao.limit, id_avaliacao=id_avaliacao)


@SuspeitaRouter.get("/{id_suspeita}", response_model=SuspeitaResponse)
def get_by_id(
    id_suspeita: IdRota,
    service: SuspeitaService = Depends(get_suspeita_service),
):
    return service.get_by_id(id_suspeita)


@SuspeitaRouter.post("", response_model=SuspeitaResponse, status_code=201)
def create(
    suspeita: SuspeitaCreate,
    service: SuspeitaService = Depends(get_suspeita_service),
):
    return service.create(suspeita)


@SuspeitaRouter.patch("/{id_suspeita}", response_model=SuspeitaResponse)
def update(
    id_suspeita: IdRota,
    suspeita: SuspeitaUpdate,
    service: SuspeitaService = Depends(get_suspeita_service),
):
    return service.update(id_suspeita, suspeita)


@SuspeitaRouter.delete("/{id_suspeita}", status_code=204)
def delete(
    id_suspeita: IdRota,
    service: SuspeitaService = Depends(get_suspeita_service),
):
    service.delete(id_suspeita)
