from typing import Generic, Optional, TypeVar, Union

from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, contains_eager

from app.models.estagiario_model import Estagiario
from app.models.paciente_model import Paciente
from app.models.pessoa_model import Pessoa
from app.models.profissional_saude_model import ProfissionalSaude
from app.schemas.pessoa_schema import CAMPOS_PESSOA

Papel = TypeVar("Papel", bound=Union[Paciente, ProfissionalSaude, Estagiario])


class PapelPessoaRepository(Generic[Papel]):
    """CRUD de uma subclasse de PESSOA, sempre junto com a linha de PESSOA.

    Os campos de PESSOA (CAMPOS_PESSOA) ficam em `subclasse.pessoa`; os demais, na subclasse.
    """

    modelo: type[Papel]

    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 50, nome: Optional[str] = None):
        consulta = (
            select(self.modelo)
            .join(self.modelo.pessoa)
            .options(contains_eager(self.modelo.pessoa))
            .order_by(self.modelo.cpf)
        )
        if nome is not None:
            consulta = consulta.where(Pessoa.nome.icontains(nome, autoescape=True))
        return self.db.scalars(consulta.offset(skip).limit(limit)).all()

    def get_by_cpf(self, cpf: str) -> Optional[Papel]:
        return self.db.get(self.modelo, cpf)

    def get_pessoa(self, cpf: str) -> Optional[Pessoa]:
        return self.db.get(Pessoa, cpf)

    def create(self, dados: BaseModel, pessoa: Optional[Pessoa] = None) -> Papel:
        """Grava PESSOA + subclasse no mesmo commit.

        Se `pessoa` vier preenchida (o CPF já está em PESSOA), só a subclasse é inserida,
        e a trigger R1 do banco decide se o CPF pode ter este papel.
        """
        campos = dados.model_dump()
        campos_pessoa = {campo: campos.pop(campo) for campo in CAMPOS_PESSOA}
        if pessoa is None:
            pessoa = Pessoa(cpf=campos["cpf"], **campos_pessoa)
        db_papel = self.modelo(pessoa=pessoa, **campos)
        self.db.add(db_papel)
        self.db.commit()
        self.db.refresh(db_papel)
        return db_papel

    def update(self, db_papel: Papel, dados: BaseModel) -> Papel:
        for campo, valor in dados.model_dump(exclude_unset=True).items():
            destino = db_papel.pessoa if campo in CAMPOS_PESSOA else db_papel
            setattr(destino, campo, valor)
        self.db.commit()
        self.db.refresh(db_papel)
        return db_papel

    def delete(self, db_papel: Papel) -> None:
        # Apaga só a linha de PESSOA: o ON DELETE CASCADE do banco leva a subclasse
        # (e, no paciente, contatos e usos de medicamento).
        self.db.execute(delete(Pessoa).where(Pessoa.cpf == db_papel.cpf))
        self.db.commit()


class PacienteRepository(PapelPessoaRepository[Paciente]):
    modelo = Paciente


class ProfissionalSaudeRepository(PapelPessoaRepository[ProfissionalSaude]):
    modelo = ProfissionalSaude


class EstagiarioRepository(PapelPessoaRepository[Estagiario]):
    modelo = Estagiario
