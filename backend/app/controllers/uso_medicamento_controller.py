from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.repositories.pessoa_repository import PacienteRepository
from app.repositories.uso_medicamento_repository import UsoMedicamentoRepository
from app.schemas.comum import CpfRota, IdRota, Paginacao
from app.schemas.uso_medicamento_schema import (
    UsoMedicamentoCreate,
    UsoMedicamentoResponse,
    UsoMedicamentoUpdate,
)
from app.services.uso_medicamento_service import UsoMedicamentoService

UsoMedicamentoRouter = APIRouter(
    prefix="/pacientes/{cpf}/medicamentos", tags=["Medicamentos em uso"]
)


def get_uso_service(db: Session = Depends(get_db)) -> UsoMedicamentoService:
    return UsoMedicamentoService(UsoMedicamentoRepository(db), PacienteRepository(db))


@UsoMedicamentoRouter.get("", response_model=List[UsoMedicamentoResponse])
def get_all(
    cpf: CpfRota,
    paginacao: Paginacao = Depends(),
    service: UsoMedicamentoService = Depends(get_uso_service),
):
    return service.get_all(cpf, skip=paginacao.skip, limit=paginacao.limit)


@UsoMedicamentoRouter.get("/{id_medicamento}", response_model=UsoMedicamentoResponse)
def get_by_id(
    cpf: CpfRota,
    id_medicamento: IdRota,
    service: UsoMedicamentoService = Depends(get_uso_service),
):
    return service.get_by_id(cpf, id_medicamento)


@UsoMedicamentoRouter.post("", response_model=UsoMedicamentoResponse, status_code=201)
def create(
    cpf: CpfRota,
    uso: UsoMedicamentoCreate,
    service: UsoMedicamentoService = Depends(get_uso_service),
):
    return service.create(cpf, uso)


@UsoMedicamentoRouter.patch("/{id_medicamento}", response_model=UsoMedicamentoResponse)
def update(
    cpf: CpfRota,
    id_medicamento: IdRota,
    uso: UsoMedicamentoUpdate,
    service: UsoMedicamentoService = Depends(get_uso_service),
):
    return service.update(cpf, id_medicamento, uso)


@UsoMedicamentoRouter.delete("/{id_medicamento}", status_code=204)
def delete(
    cpf: CpfRota,
    id_medicamento: IdRota,
    service: UsoMedicamentoService = Depends(get_uso_service),
):
    service.delete(cpf, id_medicamento)
