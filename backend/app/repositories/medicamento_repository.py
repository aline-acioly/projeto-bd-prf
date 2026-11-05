from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.medicamento_model import Medicamento
from app.schemas.medicamento_schema import MedicamentoCreate, MedicamentoUpdate


class MedicamentoRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 50, nome: Optional[str] = None):
        consulta = select(Medicamento).order_by(Medicamento.id_medicamento)
        if nome is not None:
            consulta = consulta.where(Medicamento.nome.icontains(nome, autoescape=True))
        return self.db.scalars(consulta.offset(skip).limit(limit)).all()

    def get_by_id(self, id_medicamento: int):
        return self.db.get(Medicamento, id_medicamento)

    def create(self, medicamento: MedicamentoCreate):
        db_medicamento = Medicamento(**medicamento.model_dump())
        self.db.add(db_medicamento)
        self.db.commit()
        self.db.refresh(db_medicamento)
        return db_medicamento

    def update(self, db_medicamento: Medicamento, medicamento: MedicamentoUpdate):
        for campo, valor in medicamento.model_dump(exclude_unset=True).items():
            setattr(db_medicamento, campo, valor)
        self.db.commit()
        self.db.refresh(db_medicamento)
        return db_medicamento

    def delete(self, db_medicamento: Medicamento):
        self.db.delete(db_medicamento)
        self.db.commit()
