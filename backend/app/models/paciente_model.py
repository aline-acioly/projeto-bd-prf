from typing import TYPE_CHECKING

from sqlalchemy import CHAR, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.contato_emergencia_model import ContatoEmergencia
    from app.models.pessoa_model import Pessoa
    from app.models.uso_medicamento_model import UsoMedicamento


class Paciente(Base):
    __tablename__ = "paciente"

    cpf: Mapped[str] = mapped_column(
        CHAR(11),
        ForeignKey("pessoa.cpf", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )

    pessoa: Mapped["Pessoa"] = relationship(back_populates="paciente")
    contatos: Mapped[list["ContatoEmergencia"]] = relationship(
        back_populates="paciente", cascade="all, delete-orphan", passive_deletes=True
    )
    usos: Mapped[list["UsoMedicamento"]] = relationship(
        back_populates="paciente", cascade="all, delete-orphan", passive_deletes=True
    )
