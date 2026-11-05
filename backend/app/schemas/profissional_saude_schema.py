from pydantic import ConfigDict, Field

from app.schemas.pessoa_schema import PessoaCreate, PessoaResponse, PessoaUpdate


class ProfissionalSaudeCreate(PessoaCreate):
    conselho: str = Field(max_length=10)
    numero_registro: str = Field(max_length=20)
    especialidade: str = Field(max_length=100)


class ProfissionalSaudeUpdate(PessoaUpdate):
    conselho: str = Field(None, max_length=10)
    numero_registro: str = Field(None, max_length=20)
    especialidade: str = Field(None, max_length=100)


class ProfissionalSaudeResponse(PessoaResponse):
    model_config = ConfigDict(from_attributes=True)

    conselho: str
    numero_registro: str
    especialidade: str
