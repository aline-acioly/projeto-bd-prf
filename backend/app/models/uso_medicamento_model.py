from typing import TYPE_CHECKING

from sqlalchemy import CHAR, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.medicamento_model import Medicamento
    from app.models.paciente_model import Paciente


class UsoMedicamento(Base):
    __tablename__ = "uso_medicamento"

    cpf_paciente: Mapped[str] = mapped_column(
        CHAR(11),
        ForeignKey("paciente.cpf", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )
    id_medicamento: Mapped[int] = mapped_column(
        ForeignKey("medicamento.id_medicamento"), primary_key=True
    )
    dose: Mapped[str] = mapped_column(String(50))
    via_administracao: Mapped[str] = mapped_column(String(50))
    frequencia_uso: Mapped[str] = mapped_column(String(50))

    paciente: Mapped["Paciente"] = relationship(back_populates="usos")
    # Sem o lado inverso em Medicamento: apagar um medicamento em uso deve ser
    # barrado pela FK do banco, e não pelo ORM tentando anular parte da PK do uso.
    medicamento: Mapped["Medicamento"] = relationship()
