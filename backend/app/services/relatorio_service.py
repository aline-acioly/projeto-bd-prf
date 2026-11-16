from fastapi import HTTPException

from app.repositories.relatorio_repository import RelatorioRepository


class RelatorioService:
    def __init__(self, repository: RelatorioRepository):
        self.repository = repository

    def historico_paciente(self, cpf: str):
        # Sem esta checagem, CPF inexistente devolveria lista vazia, igual a paciente sem consultas.
        if not self.repository.paciente_existe(cpf):
            raise HTTPException(status_code=404, detail="Paciente não encontrado")
        return self.repository.historico_paciente(cpf)

    def suspeitas_por_categoria(self):
        return self.repository.suspeitas_por_categoria()

    def pacientes_sem_avaliacao(self):
        return self.repository.pacientes_sem_avaliacao()

    def retornos_pendentes(self):
        return self.repository.retornos_pendentes()

    def avaliacoes_estagiarios(self):
        return self.repository.avaliacoes_estagiarios()

    def medicamentos_mais_suspeitas(self):
        return self.repository.medicamentos_mais_suspeitas()

    def pacientes_polifarmacia(self):
        return self.repository.pacientes_polifarmacia()

    def intervencoes_por_tipo(self):
        return self.repository.intervencoes_por_tipo()
