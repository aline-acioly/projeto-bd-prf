from typing import Optional

from sqlalchemy import delete, select
from sqlalchemy.orm import Session, joinedload

from app.models.consulta_model import Consulta
from app.schemas.consulta_schema import ConsultaCreate, ConsultaUpdate

# Nomes do paciente e do atendente no mesmo SELECT.
CARREGAR_PESSOAS = (joinedload(Consulta.paciente), joinedload(Consulta.atendente))


class ConsultaRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        skip: int = 0,
        limit: int = 50,
        tipo: Optional[str] = None,
        cpf_paciente: Optional[str] = None,
    ):
        consulta = select(Consulta).options(*CARREGAR_PESSOAS).order_by(Consulta.id_consulta)
        if tipo is not None:
            consulta = consulta.where(Consulta.tipo == tipo)
        if cpf_paciente is not None:
            consulta = consulta.where(Consulta.cpf_paciente == cpf_paciente)
        return self.db.scalars(consulta.offset(skip).limit(limit)).all()

    def get_by_id(self, id_consulta: int) -> Optional[Consulta]:
        return self.db.get(Consulta, id_consulta, options=CARREGAR_PESSOAS)

    def create(self, consulta: ConsultaCreate):
        # Atendente que não é profissional nem estagiário e retorno incoerente:
        # a trigger R2 recusa (400). Tipo x origem: CHECK ck_consulta_origem (409).
        db_consulta = Consulta(**consulta.model_dump())
        self.db.add(db_consulta)
        self.db.commit()
        self.db.refresh(db_consulta)
        return db_consulta

    def update(self, db_consulta: Consulta, consulta: ConsultaUpdate):
        for campo, valor in consulta.model_dump(exclude_unset=True).items():
            setattr(db_consulta, campo, valor)
        self.db.commit()
        self.db.refresh(db_consulta)
        return db_consulta

    def delete(self, db_consulta: Consulta) -> None:
        # O banco leva a avaliação (e as suspeitas e intervenções dela) por CASCADE;
        # se a avaliação originou um retorno, fk_consulta_avaliacao_origem recusa (409).
        self.db.execute(delete(Consulta).where(Consulta.id_consulta == db_consulta.id_consulta))
        self.db.commit()
