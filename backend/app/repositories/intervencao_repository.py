from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.intervencao_model import Intervencao
from app.schemas.intervencao_schema import IntervencaoCreate, IntervencaoUpdate


class IntervencaoRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 50, id_suspeita: Optional[int] = None):
        consulta = select(Intervencao).order_by(Intervencao.id_intervencao)
        if id_suspeita is not None:
            consulta = consulta.where(Intervencao.id_suspeita == id_suspeita)
        return self.db.scalars(consulta.offset(skip).limit(limit)).all()

    def get_by_id(self, id_intervencao: int) -> Optional[Intervencao]:
        return self.db.get(Intervencao, id_intervencao)

    def create(self, intervencao: IntervencaoCreate):
        # Suspeita inexistente: FK fk_intervencao_suspeita (409).
        db_intervencao = Intervencao(**intervencao.model_dump())
        self.db.add(db_intervencao)
        self.db.commit()
        self.db.refresh(db_intervencao)
        return db_intervencao

    def update(self, db_intervencao: Intervencao, intervencao: IntervencaoUpdate):
        for campo, valor in intervencao.model_dump(exclude_unset=True).items():
            setattr(db_intervencao, campo, valor)
        self.db.commit()
        self.db.refresh(db_intervencao)
        return db_intervencao

    def delete(self, db_intervencao: Intervencao) -> None:
        self.db.delete(db_intervencao)
        self.db.commit()
