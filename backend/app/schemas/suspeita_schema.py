from datetime import date

from pydantic import BaseModel, ConfigDict

from app.schemas.comum import Cpf, EntradaBase, Id
from app.schemas.medicamento_schema import MedicamentoResponse
from app.schemas.opcao_nesc_schema import OpcaoNescResponse


class SuspeitaCreate(EntradaBase):
    data_registro: date
    id_avaliacao: Id
    cpf_paciente: Cpf
    id_medicamento: Id
    id_opcao_nesc: Id


class SuspeitaUpdate(EntradaBase):
    data_registro: date = None
    id_avaliacao: Id = None
    cpf_paciente: Cpf = None
    id_medicamento: Id = None
    id_opcao_nesc: Id = None


class SuspeitaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_suspeita: Id
    data_registro: date
    id_avaliacao: Id
    cpf_paciente: Cpf
    id_medicamento: Id
    id_opcao_nesc: Id
    medicamento: MedicamentoResponse
    opcao_nesc: OpcaoNescResponse
