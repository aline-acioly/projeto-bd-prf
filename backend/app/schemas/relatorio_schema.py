from datetime import date
from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel

from app.schemas.comum import Cpf

Linha = TypeVar("Linha")


class Relatorio(BaseModel, Generic[Linha]):
    """Resultado de um relatório: o SQL executado (para exibir no front) e as linhas."""

    sql: str
    linhas: List[Linha]


class HistoricoPacienteLinha(BaseModel):
    id_consulta: int
    data_agendada: date
    tipo: str
    atendente: str
    # Vazios (LEFT JOIN) quando a consulta ainda não teve avaliação ou não houve suspeita.
    id_avaliacao: Optional[int]
    data_realizacao: Optional[date]
    id_suspeita: Optional[int]
    medicamento: Optional[str]
    categoria_nesc: Optional[str]
    problema: Optional[str]


class SuspeitasPorCategoriaLinha(BaseModel):
    categoria: str
    total: int


class PacienteSemAvaliacaoLinha(BaseModel):
    cpf: Cpf
    nome: str
    telefone: str
    total_consultas: int


class RetornoPendenteLinha(BaseModel):
    id_consulta: int
    data_agendada: date
    paciente: str
    atendente: str
    id_avaliacao_origem: int


class AvaliacaoEstagiarioLinha(BaseModel):
    id_avaliacao: int
    data_realizacao: date
    paciente: str
    estagiario: str
    supervisor: str


class MedicamentoMaisSuspeitasLinha(BaseModel):
    id_medicamento: int
    nome: str
    forma_farmaceutica: str
    total_suspeitas: int


class PacientePolifarmaciaLinha(BaseModel):
    cpf: Cpf
    nome: str
    total_medicamentos: int
    medicamentos: str


class IntervencoesPorTipoLinha(BaseModel):
    tipo: str
    total: int


class ResumoLinha(BaseModel):
    pacientes: int
    consultas_sem_avaliacao: int
    retornos_pendentes: int
    suspeitas: int


class ProximoAtendimentoLinha(BaseModel):
    id_consulta: int
    data_agendada: date
    tipo: str
    paciente: str
    atendente: str
    papel_atendente: str
