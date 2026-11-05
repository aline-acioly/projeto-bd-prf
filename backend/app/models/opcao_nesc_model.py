from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.database import Base


class OpcaoNesc(Base):
    __tablename__ = "opcao_nesc"

    id_opcao_nesc: Mapped[int] = mapped_column(primary_key=True)
    categoria: Mapped[str] = mapped_column(String(20))
    subtipo: Mapped[str] = mapped_column(String(20))
    descricao: Mapped[str] = mapped_column(Text)
