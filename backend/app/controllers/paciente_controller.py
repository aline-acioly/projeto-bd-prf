from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.repositories.pessoa_repository import PacienteRepository
from app.schemas.comum import CpfRota, Paginacao
from app.schemas.paciente_schema import (
    PacienteCreate,
    PacienteResponse,
    PacienteUpdate,
)
from app.services.pessoa_service import PacienteService

PacienteRouter = APIRouter(prefix="/pacientes", tags=["Pacientes"])


def get_paciente_service(db: Session = Depends(get_db)) -> PacienteService:
    return PacienteService(PacienteRepository(db))


@PacienteRouter.get("", response_model=List[PacienteResponse])
def get_all(
    paginacao: Paginacao = Depends(),
    nome: Optional[str] = None,
    service: PacienteService = Depends(get_paciente_service),
):
    return service.get_all(skip=paginacao.skip, limit=paginacao.limit, nome=nome)


@PacienteRouter.get("/{cpf}", response_model=PacienteResponse)
def get_by_cpf(
    cpf: CpfRota,
    service: PacienteService = Depends(get_paciente_service),
):
    return service.get_by_cpf(cpf)


@PacienteRouter.post("", response_model=PacienteResponse, status_code=201)
def create(
    paciente: PacienteCreate,
    service: PacienteService = Depends(get_paciente_service),
):
    return service.create(paciente)


@PacienteRouter.patch("/{cpf}", response_model=PacienteResponse)
def update(
    cpf: CpfRota,
    paciente: PacienteUpdate,
    service: PacienteService = Depends(get_paciente_service),
):
    return service.update(cpf, paciente)


@PacienteRouter.delete("/{cpf}", status_code=204)
def delete(
    cpf: CpfRota,
    service: PacienteService = Depends(get_paciente_service),
):
    service.delete(cpf)
