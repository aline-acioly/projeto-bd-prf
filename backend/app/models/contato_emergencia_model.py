from typing import TYPE_CHECKING

from sqlalchemy import CHAR, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.paciente_model import Paciente


class ContatoEmergencia(Base):
    __tablename__ = "contatos_emergencia"

    cpf_paciente: Mapped[str] = mapped_column(
        CHAR(11),
        ForeignKey("paciente.cpf", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )
    nome: Mapped[str] = mapped_column(String(150), primary_key=True)
    telefone: Mapped[str] = mapped_column(String(20))
    relacao: Mapped[str] = mapped_column(String(50))

    paciente: Mapped["Paciente"] = relationship(back_populates="contatos")
