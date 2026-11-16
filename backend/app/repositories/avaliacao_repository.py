from typing import Optional

from sqlalchemy import delete, select
from sqlalchemy.orm import Session, joinedload

from app.models.avaliacao_model import Avaliacao
from app.models.consulta_model import Consulta
from app.schemas.avaliacao_schema import AvaliacaoCreate, AvaliacaoUpdate

# A consulta, com os nomes do paciente e do atendente, no mesmo SELECT.
CARREGAR_CONSULTA = (
    joinedload(Avaliacao.consulta).joinedload(Consulta.paciente),
    joinedload(Avaliacao.consulta).joinedload(Consulta.atendente),
)


class AvaliacaoRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 50, cpf_paciente: Optional[str] = None):
        consulta = select(Avaliacao).options(*CARREGAR_CONSULTA).order_by(Avaliacao.id_avaliacao)
        if cpf_paciente is not None:
            # O paciente está na consulta, não na avaliação.
            consulta = consulta.where(Avaliacao.consulta.has(Consulta.cpf_paciente == cpf_paciente))
        return self.db.scalars(consulta.offset(skip).limit(limit)).all()

    def get_by_id(self, id_avaliacao: int) -> Optional[Avaliacao]:
        return self.db.get(Avaliacao, id_avaliacao, options=CARREGAR_CONSULTA)

    def create(self, avaliacao: AvaliacaoCreate):
        # Supervisor x atendente e data antes da consulta: trigger R3 (400).
        # Segunda avaliação da mesma consulta: UNIQUE uq_avaliacao_consulta (409).
        db_avaliacao = Avaliacao(**avaliacao.model_dump())
        self.db.add(db_avaliacao)
        self.db.commit()
        self.db.refresh(db_avaliacao)
        return db_avaliacao

    def update(self, db_avaliacao: Avaliacao, avaliacao: AvaliacaoUpdate):
        for campo, valor in avaliacao.model_dump(exclude_unset=True).items():
            setattr(db_avaliacao, campo, valor)
        self.db.commit()
        self.db.refresh(db_avaliacao)
        return db_avaliacao

    def delete(self, db_avaliacao: Avaliacao) -> None:
        # O banco leva as suspeitas e intervenções por CASCADE; se a avaliação
        # originou um retorno, fk_consulta_avaliacao_origem recusa (409).
        self.db.execute(
            delete(Avaliacao).where(Avaliacao.id_avaliacao == db_avaliacao.id_avaliacao)
        )
        self.db.commit()
