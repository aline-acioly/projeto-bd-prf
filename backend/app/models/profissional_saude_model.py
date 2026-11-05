from typing import TYPE_CHECKING

from sqlalchemy import CHAR, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.pessoa_model import Pessoa


class ProfissionalSaude(Base):
    __tablename__ = "profissional_saude"
    __table_args__ = (
        UniqueConstraint("conselho", "numero_registro", name="uq_prof_registro"),
    )

    cpf: Mapped[str] = mapped_column(
        CHAR(11),
        ForeignKey("pessoa.cpf", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )
    conselho: Mapped[str] = mapped_column(String(10))
    numero_registro: Mapped[str] = mapped_column(String(20))
    especialidade: Mapped[str] = mapped_column(String(100))

    pessoa: Mapped["Pessoa"] = relationship(back_populates="profissional_saude")
