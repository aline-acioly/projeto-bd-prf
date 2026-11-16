from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.repositories.relatorio_repository import RelatorioRepository
from app.schemas.comum import CpfRota
from app.schemas.relatorio_schema import (
    AvaliacaoEstagiarioLinha,
    HistoricoPacienteLinha,
    IntervencoesPorTipoLinha,
    MedicamentoMaisSuspeitasLinha,
    PacientePolifarmaciaLinha,
    PacienteSemAvaliacaoLinha,
    Relatorio,
    RetornoPendenteLinha,
    SuspeitasPorCategoriaLinha,
)
from app.services.relatorio_service import RelatorioService

RelatorioRouter = APIRouter(prefix="/relatorios", tags=["Relatórios"])


def get_relatorio_service(db: Session = Depends(get_db)) -> RelatorioService:
    return RelatorioService(RelatorioRepository(db))


@RelatorioRouter.get(
    "/historico-paciente/{cpf}",
    response_model=Relatorio[HistoricoPacienteLinha],
    summary="Histórico do paciente: consultas, avaliações e suspeitas (JOIN e LEFT JOIN)",
)
def historico_paciente(cpf: CpfRota, service: RelatorioService = Depends(get_relatorio_service)):
    return service.historico_paciente(cpf)


@RelatorioRouter.get(
    "/suspeitas-por-categoria",
    response_model=Relatorio[SuspeitasPorCategoriaLinha],
    summary="Suspeitas por categoria NESC (GROUP BY + COUNT)",
)
def suspeitas_por_categoria(service: RelatorioService = Depends(get_relatorio_service)):
    return service.suspeitas_por_categoria()


@RelatorioRouter.get(
    "/pacientes-sem-avaliacao",
    response_model=Relatorio[PacienteSemAvaliacaoLinha],
    summary="Pacientes que nunca foram avaliados (NOT EXISTS)",
)
def pacientes_sem_avaliacao(service: RelatorioService = Depends(get_relatorio_service)):
    return service.pacientes_sem_avaliacao()


@RelatorioRouter.get(
    "/retornos-pendentes",
    response_model=Relatorio[RetornoPendenteLinha],
    summary="Consultas de retorno ainda sem avaliação (NOT EXISTS)",
)
def retornos_pendentes(service: RelatorioService = Depends(get_relatorio_service)):
    return service.retornos_pendentes()


@RelatorioRouter.get(
    "/avaliacoes-estagiarios",
    response_model=Relatorio[AvaliacaoEstagiarioLinha],
    summary="Avaliações feitas por estagiários e seus supervisores (PESSOA com aliases)",
)
def avaliacoes_estagiarios(service: RelatorioService = Depends(get_relatorio_service)):
    return service.avaliacoes_estagiarios()


@RelatorioRouter.get(
    "/medicamentos-mais-suspeitas",
    response_model=Relatorio[MedicamentoMaisSuspeitasLinha],
    summary="Medicamentos com mais suspeitas (HAVING + >= ALL)",
)
def medicamentos_mais_suspeitas(service: RelatorioService = Depends(get_relatorio_service)):
    return service.medicamentos_mais_suspeitas()


@RelatorioRouter.get(
    "/pacientes-polifarmacia",
    response_model=Relatorio[PacientePolifarmaciaLinha],
    summary="Pacientes com mais de um medicamento em uso (GROUP BY + HAVING)",
)
def pacientes_polifarmacia(service: RelatorioService = Depends(get_relatorio_service)):
    return service.pacientes_polifarmacia()


@RelatorioRouter.get(
    "/intervencoes-por-tipo",
    response_model=Relatorio[IntervencoesPorTipoLinha],
    summary="Intervenções por tipo (GROUP BY + ORDER BY)",
)
def intervencoes_por_tipo(service: RelatorioService = Depends(get_relatorio_service)):
    return service.intervencoes_por_tipo()
