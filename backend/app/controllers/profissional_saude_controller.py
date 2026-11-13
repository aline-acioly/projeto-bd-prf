from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.repositories.pessoa_repository import ProfissionalSaudeRepository
from app.schemas.comum import CpfRota, Paginacao
from app.schemas.profissional_saude_schema import (
    ProfissionalSaudeCreate,
    ProfissionalSaudeResponse,
    ProfissionalSaudeUpdate,
)
from app.services.pessoa_service import ProfissionalSaudeService

ProfissionalSaudeRouter = APIRouter(prefix="/profissionais", tags=["Profissionais de saúde"])


def get_profissional_service(db: Session = Depends(get_db)) -> ProfissionalSaudeService:
    return ProfissionalSaudeService(ProfissionalSaudeRepository(db))


@ProfissionalSaudeRouter.get("", response_model=List[ProfissionalSaudeResponse])
def get_all(
    paginacao: Paginacao = Depends(),
    nome: Optional[str] = None,
    service: ProfissionalSaudeService = Depends(get_profissional_service),
):
    return service.get_all(skip=paginacao.skip, limit=paginacao.limit, nome=nome)


@ProfissionalSaudeRouter.get("/{cpf}", response_model=ProfissionalSaudeResponse)
def get_by_cpf(
    cpf: CpfRota,
    service: ProfissionalSaudeService = Depends(get_profissional_service),
):
    return service.get_by_cpf(cpf)


@ProfissionalSaudeRouter.post("", response_model=ProfissionalSaudeResponse, status_code=201)
def create(
    profissional: ProfissionalSaudeCreate,
    service: ProfissionalSaudeService = Depends(get_profissional_service),
):
    return service.create(profissional)


@ProfissionalSaudeRouter.patch("/{cpf}", response_model=ProfissionalSaudeResponse)
def update(
    cpf: CpfRota,
    profissional: ProfissionalSaudeUpdate,
    service: ProfissionalSaudeService = Depends(get_profissional_service),
):
    return service.update(cpf, profissional)


@ProfissionalSaudeRouter.delete("/{cpf}", status_code=204)
def delete(
    cpf: CpfRota,
    service: ProfissionalSaudeService = Depends(get_profissional_service),
):
    service.delete(cpf)
