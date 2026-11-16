from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.contato_emergencia_model import ContatoEmergencia
from app.schemas.contato_emergencia_schema import (
    ContatoEmergenciaCreate,
    ContatoEmergenciaUpdate,
)


class ContatoEmergenciaRepository:
    """Contatos de emergência: entidade fraca, chave (cpf_paciente, nome)."""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self, cpf_paciente: str, skip: int = 0, limit: int = 50):
        consulta = (
            select(ContatoEmergencia)
            .where(ContatoEmergencia.cpf_paciente == cpf_paciente)
            .order_by(ContatoEmergencia.nome)
        )
        return self.db.scalars(consulta.offset(skip).limit(limit)).all()

    def get_by_nome(self, cpf_paciente: str, nome: str) -> Optional[ContatoEmergencia]:
        return self.db.get(ContatoEmergencia, (cpf_paciente, nome))

    def create(self, cpf_paciente: str, contato: ContatoEmergenciaCreate):
        db_contato = ContatoEmergencia(cpf_paciente=cpf_paciente, **contato.model_dump())
        self.db.add(db_contato)
        self.db.commit()
        self.db.refresh(db_contato)
        return db_contato

    def update(self, db_contato: ContatoEmergencia, contato: ContatoEmergenciaUpdate):
        for campo, valor in contato.model_dump(exclude_unset=True).items():
            setattr(db_contato, campo, valor)
        self.db.commit()
        self.db.refresh(db_contato)
        return db_contato

    def delete(self, db_contato: ContatoEmergencia):
        self.db.delete(db_contato)
        self.db.commit()
