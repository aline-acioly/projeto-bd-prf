from pydantic import ConfigDict

from app.schemas.pessoa_schema import PessoaCreate, PessoaResponse, PessoaUpdate


class PacienteCreate(PessoaCreate):
    pass


class PacienteUpdate(PessoaUpdate):
    pass


class PacienteResponse(PessoaResponse):
    model_config = ConfigDict(from_attributes=True)
