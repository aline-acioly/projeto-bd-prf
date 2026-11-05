from datetime import date
from typing import TYPE_CHECKING, Optional

from sqlalchemy import CHAR, Date, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.estagiario_model import Estagiario
    from app.models.paciente_model import Paciente
    from app.models.profissional_saude_model import ProfissionalSaude


class Pessoa(Base):
    __tablename__ = "pessoa"

    cpf: Mapped[str] = mapped_column(CHAR(11), primary_key=True)
    nome: Mapped[str] = mapped_column(String(150))
    data_nasc: Mapped[date] = mapped_column(Date)
    sexo: Mapped[str] = mapped_column(CHAR(1))
    telefone: Mapped[str] = mapped_column(String(20))

    paciente: Mapped[Optional["Paciente"]] = relationship(
        back_populates="pessoa", cascade="all, delete-orphan", passive_deletes=True
    )
    profissional_saude: Mapped[Optional["ProfissionalSaude"]] = relationship(
        back_populates="pessoa", cascade="all, delete-orphan", passive_deletes=True
    )
    estagiario: Mapped[Optional["Estagiario"]] = relationship(
        back_populates="pessoa", cascade="all, delete-orphan", passive_deletes=True
    )
