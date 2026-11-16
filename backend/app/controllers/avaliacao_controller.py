from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.repositories.avaliacao_repository import AvaliacaoRepository
from app.schemas.comum import CpfFiltro, IdRota, Paginacao
from app.schemas.avaliacao_schema import (
    AvaliacaoCreate,
    AvaliacaoResponse,
    AvaliacaoUpdate,
)
from app.services.avaliacao_service import AvaliacaoService

AvaliacaoRouter = APIRouter(prefix="/avaliacoes", tags=["Avaliações"])


def get_avaliacao_service(db: Session = Depends(get_db)) -> AvaliacaoService:
    return AvaliacaoService(AvaliacaoRepository(db))


@AvaliacaoRouter.get("", response_model=List[AvaliacaoResponse])
def get_all(
    paginacao: Paginacao = Depends(),
    cpf_paciente: CpfFiltro = None,
    service: AvaliacaoService = Depends(get_avaliacao_service),
):
    return service.get_all(skip=paginacao.skip, limit=paginacao.limit, cpf_paciente=cpf_paciente)


@AvaliacaoRouter.get("/{id_avaliacao}", response_model=AvaliacaoResponse)
def get_by_id(
    id_avaliacao: IdRota,
    service: AvaliacaoService = Depends(get_avaliacao_service),
):
    return service.get_by_id(id_avaliacao)


@AvaliacaoRouter.post("", response_model=AvaliacaoResponse, status_code=201)
def create(
    avaliacao: AvaliacaoCreate,
    service: AvaliacaoService = Depends(get_avaliacao_service),
):
    return service.create(avaliacao)


@AvaliacaoRouter.patch("/{id_avaliacao}", response_model=AvaliacaoResponse)
def update(
    id_avaliacao: IdRota,
    avaliacao: AvaliacaoUpdate,
    service: AvaliacaoService = Depends(get_avaliacao_service),
):
    return service.update(id_avaliacao, avaliacao)


@AvaliacaoRouter.delete("/{id_avaliacao}", status_code=204)
def delete(
    id_avaliacao: IdRota,
    service: AvaliacaoService = Depends(get_avaliacao_service),
):
    service.delete(id_avaliacao)
