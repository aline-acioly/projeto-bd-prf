from pydantic import BaseModel, ConfigDict, Field

from app.schemas.comum import EntradaBase, Id


class MedicamentoCreate(EntradaBase):
    nome: str = Field(max_length=150)
    forma_farmaceutica: str = Field(max_length=50)


class MedicamentoUpdate(EntradaBase):
    nome: str = Field(None, max_length=150)
    forma_farmaceutica: str = Field(None, max_length=50)


class MedicamentoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_medicamento: Id
    nome: str
    forma_farmaceutica: str
