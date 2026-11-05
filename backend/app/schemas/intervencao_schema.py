from typing import Literal

from pydantic import BaseModel, ConfigDict

from app.schemas.comum import EntradaBase, Id

TipoIntervencao = Literal[
    "encaminhamento",
    "prescrição",
    "orientação sobre medicamento",
    "orientação sobre doença",
    "medidas não farmacológicas",
]


class IntervencaoCreate(EntradaBase):
    tipo: TipoIntervencao
    descricao: str
    id_suspeita: Id


class IntervencaoUpdate(EntradaBase):
    tipo: TipoIntervencao = None
    descricao: str = None
    id_suspeita: Id = None


class IntervencaoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_intervencao: Id
    tipo: TipoIntervencao
    descricao: str
    id_suspeita: Id
