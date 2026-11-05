from pydantic import ConfigDict, Field

from app.schemas.pessoa_schema import PessoaCreate, PessoaResponse, PessoaUpdate


class EstagiarioCreate(PessoaCreate):
    instituicao_ensino: str = Field(max_length=150)
    curso: str = Field(max_length=100)


class EstagiarioUpdate(PessoaUpdate):
    instituicao_ensino: str = Field(None, max_length=150)
    curso: str = Field(None, max_length=100)


class EstagiarioResponse(PessoaResponse):
    model_config = ConfigDict(from_attributes=True)

    instituicao_ensino: str
    curso: str
