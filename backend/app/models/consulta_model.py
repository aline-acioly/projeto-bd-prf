from datetime import date
from typing import TYPE_CHECKING, Optional

from sqlalchemy import CHAR, Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.avaliacao_model import Avaliacao


class Consulta(Base):
    __tablename__ = "consulta"

    id_consulta: Mapped[int] = mapped_column(primary_key=True)
    data_agendada: Mapped[date] = mapped_column(Date)
    tipo: Mapped[str] = mapped_column(String(10), server_default="inicial")
    cpf_paciente: Mapped[str] = mapped_column(
        CHAR(11), ForeignKey("paciente.cpf", onupdate="CASCADE")
    )
    cpf_atendente: Mapped[str] = mapped_column(
        CHAR(11), ForeignKey("pessoa.cpf", onupdate="CASCADE")
    )
    # FK circular com AVALIACAO: use_alter espelha o ALTER TABLE do 01_schema.sql.
    id_avaliacao_origem: Mapped[Optional[int]] = mapped_column(
        ForeignKey(
            "avaliacao.id_avaliacao",
            name="fk_consulta_avaliacao_origem",
            use_alter=True,
        )
    )

    # Há duas FKs entre CONSULTA e AVALIACAO, então o caminho precisa ser explícito.
    avaliacao: Mapped[Optional["Avaliacao"]] = relationship(
        back_populates="consulta",
        foreign_keys="Avaliacao.id_consulta",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
