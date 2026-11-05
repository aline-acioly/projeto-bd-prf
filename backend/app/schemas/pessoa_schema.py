from datetime import date
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.comum import Cpf, DataNascimento, EntradaBase

Sexo = Literal["M", "F"]

CAMPOS_PESSOA = ("nome", "data_nasc", "sexo", "telefone")


class PessoaCreate(EntradaBase):
    cpf: Cpf
    nome: str = Field(max_length=150)
    data_nasc: DataNascimento
    sexo: Sexo
    telefone: str = Field(max_length=20)


class PessoaUpdate(EntradaBase):
    nome: str = Field(None, max_length=150)
    data_nasc: DataNascimento = None
    sexo: Sexo = None
    telefone: str = Field(None, max_length=20)


class PessoaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    cpf: Cpf
    nome: str
    data_nasc: date
    sexo: Sexo
    telefone: str

    @model_validator(mode="before")
    @classmethod
    def juntar_pessoa(cls, dados: Any) -> Any:
        """Os campos de PESSOA estão em subclasse.pessoa, não na própria subclasse."""
        pessoa = getattr(dados, "pessoa", None)
        if pessoa is None:
            return dados
        return {
            campo: getattr(pessoa if campo in CAMPOS_PESSOA else dados, campo)
            for campo in cls.model_fields
        }
