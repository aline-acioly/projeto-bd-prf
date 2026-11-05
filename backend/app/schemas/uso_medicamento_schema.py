from pydantic import BaseModel, ConfigDict, Field

from app.schemas.comum import Cpf, EntradaBase, Id


class UsoMedicamentoCreate(EntradaBase):
    id_medicamento: Id
    dose: str = Field(max_length=50)
    via_administracao: str = Field(max_length=50)
    frequencia_uso: str = Field(max_length=50)


class UsoMedicamentoUpdate(EntradaBase):
    dose: str = Field(None, max_length=50)
    via_administracao: str = Field(None, max_length=50)
    frequencia_uso: str = Field(None, max_length=50)


class UsoMedicamentoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    cpf_paciente: Cpf
    id_medicamento: Id
    dose: str
    via_administracao: str
    frequencia_uso: str
