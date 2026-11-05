from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class Medicamento(Base):
    __tablename__ = "medicamento"
    __table_args__ = (
        UniqueConstraint("nome", "forma_farmaceutica", name="uq_medicamento"),
    )

    id_medicamento: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(150))
    forma_farmaceutica: Mapped[str] = mapped_column(String(50))
