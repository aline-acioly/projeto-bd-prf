from typing import Annotated, List

from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.repositories.contato_emergencia_repository import ContatoEmergenciaRepository
from app.repositories.pessoa_repository import PacienteRepository
from app.schemas.comum import CpfRota, Paginacao
from app.schemas.contato_emergencia_schema import (
    ContatoEmergenciaCreate,
    ContatoEmergenciaResponse,
    ContatoEmergenciaUpdate,
)
from app.services.contato_emergencia_service import ContatoEmergenciaService

ContatoEmergenciaRouter = APIRouter(
    prefix="/pacientes/{cpf}/contatos", tags=["Contatos de emergência"]
)

# Chave parcial da entidade fraca. Espaço e acento vão codificados na URL (Pedro%20Lima).
NomeContatoRota = Annotated[str, Path(min_length=1, max_length=150)]


def get_contato_service(db: Session = Depends(get_db)) -> ContatoEmergenciaService:
    return ContatoEmergenciaService(
        ContatoEmergenciaRepository(db), PacienteRepository(db)
    )


@ContatoEmergenciaRouter.get("", response_model=List[ContatoEmergenciaResponse])
def get_all(
    cpf: CpfRota,
    paginacao: Paginacao = Depends(),
    service: ContatoEmergenciaService = Depends(get_contato_service),
):
    return service.get_all(cpf, skip=paginacao.skip, limit=paginacao.limit)


@ContatoEmergenciaRouter.get("/{nome}", response_model=ContatoEmergenciaResponse)
def get_by_nome(
    cpf: CpfRota,
    nome: NomeContatoRota,
    service: ContatoEmergenciaService = Depends(get_contato_service),
):
    return service.get_by_nome(cpf, nome)


@ContatoEmergenciaRouter.post("", response_model=ContatoEmergenciaResponse, status_code=201)
def create(
    cpf: CpfRota,
    contato: ContatoEmergenciaCreate,
    service: ContatoEmergenciaService = Depends(get_contato_service),
):
    return service.create(cpf, contato)


@ContatoEmergenciaRouter.patch("/{nome}", response_model=ContatoEmergenciaResponse)
def update(
    cpf: CpfRota,
    nome: NomeContatoRota,
    contato: ContatoEmergenciaUpdate,
    service: ContatoEmergenciaService = Depends(get_contato_service),
):
    return service.update(cpf, nome, contato)


@ContatoEmergenciaRouter.delete("/{nome}", status_code=204)
def delete(
    cpf: CpfRota,
    nome: NomeContatoRota,
    service: ContatoEmergenciaService = Depends(get_contato_service),
):
    service.delete(cpf, nome)
