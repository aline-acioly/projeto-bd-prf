from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.opcao_nesc_model import OpcaoNesc
from app.schemas.opcao_nesc_schema import OpcaoNescCreate, OpcaoNescUpdate


class OpcaoNescRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 50, categoria: Optional[str] = None):
        consulta = select(OpcaoNesc).order_by(OpcaoNesc.id_opcao_nesc)
        if categoria is not None:
            consulta = consulta.where(OpcaoNesc.categoria == categoria)
        return self.db.scalars(consulta.offset(skip).limit(limit)).all()

    def get_by_id(self, id_opcao_nesc: int):
        return self.db.get(OpcaoNesc, id_opcao_nesc)

    def create(self, opcao: OpcaoNescCreate):
        db_opcao = OpcaoNesc(**opcao.model_dump())
        self.db.add(db_opcao)
        self.db.commit()
        self.db.refresh(db_opcao)
        return db_opcao

    def update(self, db_opcao: OpcaoNesc, opcao: OpcaoNescUpdate):
        for campo, valor in opcao.model_dump(exclude_unset=True).items():
            setattr(db_opcao, campo, valor)
        self.db.commit()
        self.db.refresh(db_opcao)
        return db_opcao

    def delete(self, db_opcao: OpcaoNesc):
        self.db.delete(db_opcao)
        self.db.commit()
