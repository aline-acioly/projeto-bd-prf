from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, model_validator

from app.schemas.comum import Cpf, EntradaBase, Id

TipoConsulta = Literal["inicial", "retorno"]


def _validar_origem(tipo: str, id_avaliacao_origem: Optional[int]) -> None:
    if tipo == "retorno" and id_avaliacao_origem is None:
        raise ValueError("consulta de retorno exige id_avaliacao_origem")
    if tipo == "inicial" and id_avaliacao_origem is not None:
        raise ValueError("consulta inicial não pode ter id_avaliacao_origem")


class ConsultaCreate(EntradaBase):
    data_agendada: date
    tipo: TipoConsulta = "inicial"
    cpf_paciente: Cpf
    cpf_atendente: Cpf
    id_avaliacao_origem: Optional[Id] = None

    @model_validator(mode="after")
    def validar_origem(self) -> "ConsultaCreate":
        _validar_origem(self.tipo, self.id_avaliacao_origem)
        return self


class ConsultaUpdate(EntradaBase):
    data_agendada: date = None
    tipo: TipoConsulta = None
    cpf_paciente: Cpf = None
    cpf_atendente: Cpf = None
    id_avaliacao_origem: Optional[Id] = None

    @model_validator(mode="after")
    def validar_origem(self) -> "ConsultaUpdate":
        # Só dá para validar aqui se os dois vierem juntos; se vier um só,
        # a combinação com o valor gravado é conferida pelo CHECK do banco.
        if {"tipo", "id_avaliacao_origem"} <= self.model_fields_set:
            _validar_origem(self.tipo, self.id_avaliacao_origem)
        return self


class ConsultaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_consulta: Id
    data_agendada: date
    tipo: TipoConsulta
    cpf_paciente: Cpf
    cpf_atendente: Cpf
    id_avaliacao_origem: Optional[Id]
