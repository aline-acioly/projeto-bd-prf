from pydantic import BaseModel, ConfigDict, Field

from app.schemas.comum import Cpf, EntradaBase


class ContatoEmergenciaCreate(EntradaBase):
    # O nome é parte da chave e vai na URL: vazio não poderia ser buscado depois.
    nome: str = Field(min_length=1, max_length=150)
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
