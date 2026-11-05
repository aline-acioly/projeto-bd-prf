from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.repositories.medicamento_repository import MedicamentoRepository
from app.schemas.comum import IdRota, Paginacao
from app.schemas.medicamento_schema import (
    MedicamentoCreate,
    MedicamentoResponse,
    MedicamentoUpdate,
)
from app.services.medicamento_service import MedicamentoService

MedicamentoRouter = APIRouter(prefix="/medicamentos", tags=["Medicamentos"])


def get_medicamento_service(db: Session = Depends(get_db)) -> MedicamentoService:
    return MedicamentoService(MedicamentoRepository(db))


@MedicamentoRouter.get("", response_model=List[MedicamentoResponse])
def get_all(
    paginacao: Paginacao = Depends(),
    nome: Optional[str] = None,
    service: MedicamentoService = Depends(get_medicamento_service),
):
    return service.get_all(skip=paginacao.skip, limit=paginacao.limit, nome=nome)


@MedicamentoRouter.get("/{id_medicamento}", response_model=MedicamentoResponse)
def get_by_id(
    id_medicamento: IdRota,
    service: MedicamentoService = Depends(get_medicamento_service),
):
    return service.get_by_id(id_medicamento)


@MedicamentoRouter.post("", response_model=MedicamentoResponse, status_code=201)
def create(
    medicamento: MedicamentoCreate,
    service: MedicamentoService = Depends(get_medicamento_service),
):
    return service.create(medicamento)


@MedicamentoRouter.patch("/{id_medicamento}", response_model=MedicamentoResponse)
def update(
    id_medicamento: IdRota,
    medicamento: MedicamentoUpdate,
    service: MedicamentoService = Depends(get_medicamento_service),
):
    return service.update(id_medicamento, medicamento)


@MedicamentoRouter.delete("/{id_medicamento}", status_code=204)
def delete(
    id_medicamento: IdRota,
    service: MedicamentoService = Depends(get_medicamento_service),
):
    service.delete(id_medicamento)
