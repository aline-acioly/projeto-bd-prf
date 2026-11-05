from datetime import date
from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, Field


def _nao_futura(valor: date) -> date:
    if valor > date.today():
        raise ValueError("data_nasc não pode ser futura")
    return valor


# Mesmas regras do domínio TIPO_CPF e dos tipos do 01_schema.sql.
Cpf = Annotated[str, Field(pattern=r"^[0-9]{11}$")]
# Limite do INT do Postgres: acima dele o banco dá erro de faixa, não de FK.
Id = Annotated[int, Field(ge=1, le=2147483647)]
DataNascimento = Annotated[date, AfterValidator(_nao_futura)]


class EntradaBase(BaseModel):
    """Base de Create e Update: campo desconhecido, como cpf no Update, dá 422.

    Nos Update, os campos de colunas NOT NULL são declarados como `str = None`,
    e não Optional[str]: podem ser omitidos, mas null explícito dá 422.
    Use model_dump(exclude_unset=True) para gravar só o que foi enviado.
    """

    model_config = ConfigDict(extra="forbid")
