from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.comum import Cpf, EntradaBase, Id
from app.schemas.consulta_schema import ConsultaResponse


class AvaliacaoCreate(EntradaBase):
    id_consulta: Id
    data_realizacao: date
    cpf_supervisor: Optional[Cpf] = None


class AvaliacaoUpdate(EntradaBase):
    id_consulta: Id = None
    data_realizacao: date = None
    cpf_supervisor: Optional[Cpf] = None


class AvaliacaoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_avaliacao: Id
    id_consulta: Id
    data_realizacao: date
    cpf_supervisor: Optional[Cpf]
    # Data, tipo, paciente e atendente vêm da consulta (1:1).
    consulta: ConsultaResponse
