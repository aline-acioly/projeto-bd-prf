from datetime import date
from typing import Any, Literal, Optional

from pydantic import BaseModel, ConfigDict, model_validator

from app.schemas.comum import Cpf, EntradaBase, Id
from app.schemas.pessoa_schema import PessoaResumo

TipoConsulta = Literal["inicial", "retorno"]
PapelAtendente = Literal["profissional", "estagiario"]


class AtendenteResumo(PessoaResumo):
    """CPF, nome e papel do atendente (a união Profissional U Estagiário da trigger R2)."""

    papel: Optional[PapelAtendente]

    @model_validator(mode="before")
    @classmethod
    def calcular_papel(cls, dados: Any) -> Any:
        # Recebe a PESSOA do ORM: o papel é a subclasse que existe para o CPF.
        if isinstance(dados, dict):
            return dados
        papel = (
            "profissional"
            if getattr(dados, "profissional_saude", None) is not None
            else "estagiario" if getattr(dados, "estagiario", None) is not None else None
        )
        return {"cpf": dados.cpf, "nome": dados.nome, "papel": papel}


class AvaliacaoDaConsulta(BaseModel):
    """A avaliação 1:1 da consulta, quando já existe (consulta realizada)."""

    model_config = ConfigDict(from_attributes=True)

    id_avaliacao: Id
    data_realizacao: date


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


class ConsultaBaseResponse(BaseModel):
    """Consulta sem a avaliação: é a que aparece dentro de AvaliacaoResponse."""

    model_config = ConfigDict(from_attributes=True)

    id_consulta: Id
    data_agendada: date
    tipo: TipoConsulta
    cpf_paciente: Cpf
    cpf_atendente: Cpf
    id_avaliacao_origem: Optional[Id]
    paciente: PessoaResumo
    atendente: AtendenteResumo


class ConsultaResponse(ConsultaBaseResponse):
    # null: a consulta ainda não foi realizada (agendada).
    avaliacao: Optional[AvaliacaoDaConsulta]
