from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.repositories.intervencao_repository import IntervencaoRepository
from app.schemas.comum import IdFiltro, IdRota, Paginacao
from app.schemas.intervencao_schema import (
    IntervencaoCreate,
    IntervencaoResponse,
    IntervencaoUpdate,
)
from app.services.intervencao_service import IntervencaoService

IntervencaoRouter = APIRouter(prefix="/intervencoes", tags=["Intervenções"])


def get_intervencao_service(db: Session = Depends(get_db)) -> IntervencaoService:
    return IntervencaoService(IntervencaoRepository(db))


@IntervencaoRouter.get("", response_model=List[IntervencaoResponse])
def get_all(
    paginacao: Paginacao = Depends(),
    id_suspeita: IdFiltro = None,
    service: IntervencaoService = Depends(get_intervencao_service),
):
    return service.get_all(skip=paginacao.skip, limit=paginacao.limit, id_suspeita=id_suspeita)


@IntervencaoRouter.get("/{id_intervencao}", response_model=IntervencaoResponse)
def get_by_id(
    id_intervencao: IdRota,
    service: IntervencaoService = Depends(get_intervencao_service),
):
    return service.get_by_id(id_intervencao)


@IntervencaoRouter.post("", response_model=IntervencaoResponse, status_code=201)
def create(
    intervencao: IntervencaoCreate,
    service: IntervencaoService = Depends(get_intervencao_service),
):
    return service.create(intervencao)


@IntervencaoRouter.patch("/{id_intervencao}", response_model=IntervencaoResponse)
def update(
    id_intervencao: IdRota,
    intervencao: IntervencaoUpdate,
    service: IntervencaoService = Depends(get_intervencao_service),
):
    return service.update(id_intervencao, intervencao)


@IntervencaoRouter.delete("/{id_intervencao}", status_code=204)
def delete(
    id_intervencao: IdRota,
    service: IntervencaoService = Depends(get_intervencao_service),
):
    service.delete(id_intervencao)
