from typing import TYPE_CHECKING

from sqlalchemy import CHAR, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.pessoa_model import Pessoa


class Estagiario(Base):
    __tablename__ = "estagiario"

    cpf: Mapped[str] = mapped_column(
        CHAR(11),
        ForeignKey("pessoa.cpf", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )
    instituicao_ensino: Mapped[str] = mapped_column(String(150))
    curso: Mapped[str] = mapped_column(String(100))

    pessoa: Mapped["Pessoa"] = relationship(back_populates="estagiario")
