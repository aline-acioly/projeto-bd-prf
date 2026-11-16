from typing import Optional

from sqlalchemy import delete, select
from sqlalchemy.orm import Session, joinedload

from app.models.suspeita_model import Suspeita
from app.schemas.suspeita_schema import SuspeitaCreate, SuspeitaUpdate

# Medicamento e opção NESC no mesmo SELECT.
CARREGAR_DETALHES = (joinedload(Suspeita.medicamento), joinedload(Suspeita.opcao_nesc))


class SuspeitaRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 50, id_avaliacao: Optional[int] = None):
        consulta = select(Suspeita).options(*CARREGAR_DETALHES).order_by(Suspeita.id_suspeita)
        if id_avaliacao is not None:
            consulta = consulta.where(Suspeita.id_avaliacao == id_avaliacao)
        return self.db.scalars(consulta.offset(skip).limit(limit)).all()

    def get_by_id(self, id_suspeita: int) -> Optional[Suspeita]:
        return self.db.get(Suspeita, id_suspeita, options=CARREGAR_DETALHES)

    def create(self, suspeita: SuspeitaCreate):
        # Paciente diferente do da avaliação e data antes dela: trigger R4 (400).
        # Medicamento que o paciente não usa: FK composta fk_suspeita_uso (409).
        db_suspeita = Suspeita(**suspeita.model_dump())
        self.db.add(db_suspeita)
        self.db.commit()
        self.db.refresh(db_suspeita)
        return db_suspeita

    def update(self, db_suspeita: Suspeita, suspeita: SuspeitaUpdate):
        for campo, valor in suspeita.model_dump(exclude_unset=True).items():
            setattr(db_suspeita, campo, valor)
        self.db.commit()
        self.db.refresh(db_suspeita)
        return db_suspeita

    def delete(self, db_suspeita: Suspeita) -> None:
        # O banco leva as intervenções por CASCADE.
        self.db.execute(delete(Suspeita).where(Suspeita.id_suspeita == db_suspeita.id_suspeita))
        self.db.commit()
