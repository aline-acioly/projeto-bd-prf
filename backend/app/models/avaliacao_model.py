from datetime import date
from typing import TYPE_CHECKING, Optional

from sqlalchemy import CHAR, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.consulta_model import Consulta
    from app.models.suspeita_model import Suspeita


class Avaliacao(Base):
    __tablename__ = "avaliacao"
    __table_args__ = (UniqueConstraint("id_consulta", name="uq_avaliacao_consulta"),)

    id_avaliacao: Mapped[int] = mapped_column(primary_key=True)
    id_consulta: Mapped[int] = mapped_column(
        ForeignKey("consulta.id_consulta", ondelete="CASCADE")
    )
    data_realizacao: Mapped[date] = mapped_column(Date)
    cpf_supervisor: Mapped[Optional[str]] = mapped_column(
        CHAR(11), ForeignKey("profissional_saude.cpf", onupdate="CASCADE")
    )

    consulta: Mapped["Consulta"] = relationship(
        back_populates="avaliacao", foreign_keys=[id_consulta]
    )
    suspeitas: Mapped[list["Suspeita"]] = relationship(
        back_populates="avaliacao", cascade="all, delete-orphan", passive_deletes=True
    )
