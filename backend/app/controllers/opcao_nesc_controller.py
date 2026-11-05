from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.repositories.opcao_nesc_repository import OpcaoNescRepository
from app.schemas.comum import IdRota, Paginacao
from app.schemas.opcao_nesc_schema import (
    CategoriaNesc,
    OpcaoNescCreate,
    OpcaoNescResponse,
    OpcaoNescUpdate,
)
from app.services.opcao_nesc_service import OpcaoNescService

OpcaoNescRouter = APIRouter(prefix="/opcoes-nesc", tags=["Opções NESC"])


def get_opcao_nesc_service(db: Session = Depends(get_db)) -> OpcaoNescService:
    return OpcaoNescService(OpcaoNescRepository(db))


@OpcaoNescRouter.get("", response_model=List[OpcaoNescResponse])
def get_all(
    paginacao: Paginacao = Depends(),
    categoria: Optional[CategoriaNesc] = None,
    service: OpcaoNescService = Depends(get_opcao_nesc_service),
):
    return service.get_all(
        skip=paginacao.skip, limit=paginacao.limit, categoria=categoria
    )


@OpcaoNescRouter.get("/{id_opcao_nesc}", response_model=OpcaoNescResponse)
def get_by_id(
    id_opcao_nesc: IdRota,
    service: OpcaoNescService = Depends(get_opcao_nesc_service),
):
    return service.get_by_id(id_opcao_nesc)


@OpcaoNescRouter.post("", response_model=OpcaoNescResponse, status_code=201)
def create(
    opcao: OpcaoNescCreate,
    service: OpcaoNescService = Depends(get_opcao_nesc_service),
):
    return service.create(opcao)


@OpcaoNescRouter.patch("/{id_opcao_nesc}", response_model=OpcaoNescResponse)
def update(
    id_opcao_nesc: IdRota,
    opcao: OpcaoNescUpdate,
    service: OpcaoNescService = Depends(get_opcao_nesc_service),
):
    return service.update(id_opcao_nesc, opcao)


@OpcaoNescRouter.delete("/{id_opcao_nesc}", status_code=204)
def delete(
    id_opcao_nesc: IdRota,
    service: OpcaoNescService = Depends(get_opcao_nesc_service),
):
    service.delete(id_opcao_nesc)
