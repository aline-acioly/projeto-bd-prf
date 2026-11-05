from typing import Literal

from pydantic import BaseModel, ConfigDict

from app.schemas.comum import EntradaBase, Id

CategoriaNesc = Literal["Necessidade", "Efetividade", "Segurança", "Cumprimento"]
SubtipoNesc = Literal["quantitativo", "qualitativo", "outro"]


class OpcaoNescCreate(EntradaBase):
    categoria: CategoriaNesc
    subtipo: SubtipoNesc
    descricao: str


class OpcaoNescUpdate(EntradaBase):
    categoria: CategoriaNesc = None
    subtipo: SubtipoNesc = None
    descricao: str = None


class OpcaoNescResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_opcao_nesc: Id
    categoria: CategoriaNesc
    subtipo: SubtipoNesc
    descricao: str
