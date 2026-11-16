from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.repositories.consulta_repository import ConsultaRepository
from app.schemas.comum import CpfFiltro, IdRota, Paginacao
from app.schemas.consulta_schema import (
    ConsultaCreate,
    ConsultaResponse,
    ConsultaUpdate,
    TipoConsulta,
)
from app.services.consulta_service import ConsultaService

ConsultaRouter = APIRouter(prefix="/consultas", tags=["Consultas"])


def get_consulta_service(db: Session = Depends(get_db)) -> ConsultaService:
    return ConsultaService(ConsultaRepository(db))


@ConsultaRouter.get("", response_model=List[ConsultaResponse])
def get_all(
    paginacao: Paginacao = Depends(),
    tipo: Optional[TipoConsulta] = None,
    cpf_paciente: CpfFiltro = None,
    service: ConsultaService = Depends(get_consulta_service),
):
    return service.get_all(
        skip=paginacao.skip, limit=paginacao.limit, tipo=tipo, cpf_paciente=cpf_paciente
    )


@ConsultaRouter.get("/{id_consulta}", response_model=ConsultaResponse)
def get_by_id(
    id_consulta: IdRota,
    service: ConsultaService = Depends(get_consulta_service),
):
    return service.get_by_id(id_consulta)


@ConsultaRouter.post("", response_model=ConsultaResponse, status_code=201)
def create(
    consulta: ConsultaCreate,
    service: ConsultaService = Depends(get_consulta_service),
):
    return service.create(consulta)


@ConsultaRouter.patch("/{id_consulta}", response_model=ConsultaResponse)
def update(
    id_consulta: IdRota,
    consulta: ConsultaUpdate,
    service: ConsultaService = Depends(get_consulta_service),
):
    return service.update(id_consulta, consulta)


@ConsultaRouter.delete("/{id_consulta}", status_code=204)
def delete(
    id_consulta: IdRota,
    service: ConsultaService = Depends(get_consulta_service),
):
    service.delete(id_consulta)
