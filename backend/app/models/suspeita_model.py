from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import CHAR, Date, ForeignKey, ForeignKeyConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.avaliacao_model import Avaliacao
    from app.models.intervencao_model import Intervencao


class Suspeita(Base):
    __tablename__ = "suspeita"
    __table_args__ = (
        ForeignKeyConstraint(
            ["cpf_paciente", "id_medicamento"],
            ["uso_medicamento.cpf_paciente", "uso_medicamento.id_medicamento"],
            name="fk_suspeita_uso",
            onupdate="CASCADE",
        ),
    )

    id_suspeita: Mapped[int] = mapped_column(primary_key=True)
    data_registro: Mapped[date] = mapped_column(Date)
    id_avaliacao: Mapped[int] = mapped_column(
        ForeignKey("avaliacao.id_avaliacao", ondelete="CASCADE")
    )
    cpf_paciente: Mapped[str] = mapped_column(CHAR(11))
    id_medicamento: Mapped[int] = mapped_column()
    id_opcao_nesc: Mapped[int] = mapped_column(ForeignKey("opcao_nesc.id_opcao_nesc"))

    avaliacao: Mapped["Avaliacao"] = relationship(back_populates="suspeitas")
    intervencoes: Mapped[list["Intervencao"]] = relationship(
        back_populates="suspeita", cascade="all, delete-orphan", passive_deletes=True
    )
