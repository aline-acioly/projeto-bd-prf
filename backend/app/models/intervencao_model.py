from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.suspeita_model import Suspeita


class Intervencao(Base):
    __tablename__ = "intervencao"

    id_intervencao: Mapped[int] = mapped_column(primary_key=True)
    tipo: Mapped[str] = mapped_column(String(40))
    descricao: Mapped[str] = mapped_column(Text)
    id_suspeita: Mapped[int] = mapped_column(
        ForeignKey("suspeita.id_suspeita", ondelete="CASCADE")
    )

    suspeita: Mapped["Suspeita"] = relationship(back_populates="intervencoes")
