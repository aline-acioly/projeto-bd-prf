from fastapi import Depends, FastAPI, HTTPException
from app.controllers.medicamento_controller import MedicamentoRouter
from app.controllers.opcao_nesc_controller import OpcaoNescRouter
from app.controllers.paciente_controller import PacienteRouter
from app.controllers.profissional_saude_controller import ProfissionalSaudeRouter
from app.controllers.estagiario_controller import EstagiarioRouter
from app.controllers.contato_emergencia_controller import ContatoEmergenciaRouter
from app.controllers.uso_medicamento_controller import UsoMedicamentoRouter
from app.controllers.consulta_controller import ConsultaRouter
from app.controllers.avaliacao_controller import AvaliacaoRouter
from app.controllers.suspeita_controller import SuspeitaRouter
from app.controllers.intervencao_controller import IntervencaoRouter
from app.controllers.relatorio_controller import RelatorioRouter
from app.database.database import get_db
from app.infra.errors import registrar_handlers
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

app = FastAPI(title="Sistema de Avaliação PRF")
registrar_handlers(app)


@app.get("/health", tags=["Health"])
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Banco de dados indisponível")
    return {"status": "ok"}


app.include_router(MedicamentoRouter)
app.include_router(OpcaoNescRouter)
app.include_router(PacienteRouter)
app.include_router(ProfissionalSaudeRouter)
app.include_router(EstagiarioRouter)
app.include_router(ContatoEmergenciaRouter)
app.include_router(UsoMedicamentoRouter)
app.include_router(ConsultaRouter)
app.include_router(AvaliacaoRouter)
app.include_router(SuspeitaRouter)
app.include_router(IntervencaoRouter)
app.include_router(RelatorioRouter)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
)
