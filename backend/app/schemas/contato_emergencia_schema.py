from pydantic import BaseModel, ConfigDict, Field

from app.schemas.comum import Cpf, EntradaBase


class ContatoEmergenciaCreate(EntradaBase):
    nome: str = Field(max_length=150)
    telefone: str = Field(max_length=20)
    relacao: str = Field(max_length=50)


class ContatoEmergenciaUpdate(EntradaBase):
    telefone: str = Field(None, max_length=20)
    relacao: str = Field(None, max_length=50)


class ContatoEmergenciaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    cpf_paciente: Cpf
    nome: str
    telefone: str
    relacao: str
