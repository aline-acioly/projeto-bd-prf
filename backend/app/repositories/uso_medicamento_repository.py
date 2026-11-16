from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.uso_medicamento_model import UsoMedicamento
from app.schemas.uso_medicamento_schema import (
    UsoMedicamentoCreate,
    UsoMedicamentoUpdate,
)


class UsoMedicamentoRepository:
    """Relacionamento USA (paciente N:M medicamento), chave (cpf_paciente, id_medicamento)."""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self, cpf_paciente: str, skip: int = 0, limit: int = 50):
        consulta = (
            select(UsoMedicamento)
            .where(UsoMedicamento.cpf_paciente == cpf_paciente)
            # Traz nome e forma do medicamento no mesmo SELECT.
            .options(joinedload(UsoMedicamento.medicamento))
            .order_by(UsoMedicamento.id_medicamento)
        )
        return self.db.scalars(consulta.offset(skip).limit(limit)).all()

    def get_by_id(self, cpf_paciente: str, id_medicamento: int) -> Optional[UsoMedicamento]:
        return self.db.get(
            UsoMedicamento,
            (cpf_paciente, id_medicamento),
            options=[joinedload(UsoMedicamento.medicamento)],
        )

    def create(self, cpf_paciente: str, uso: UsoMedicamentoCreate):
        # Medicamento inexistente: a FK fk_uso_medicamento recusa e o handler dá 409.
        db_uso = UsoMedicamento(cpf_paciente=cpf_paciente, **uso.model_dump())
        self.db.add(db_uso)
        self.db.commit()
        self.db.refresh(db_uso)
        return db_uso

    def update(self, db_uso: UsoMedicamento, uso: UsoMedicamentoUpdate):
        for campo, valor in uso.model_dump(exclude_unset=True).items():
            setattr(db_uso, campo, valor)
        self.db.commit()
        self.db.refresh(db_uso)
        return db_uso

    def delete(self, db_uso: UsoMedicamento):
        # Uso com suspeitas: a FK fk_suspeita_uso recusa (MENSAGENS_FK_DELETE → 409).
        self.db.delete(db_uso)
        self.db.commit()
