from fastapi import Depends, FastAPI, HTTPException
from app.controllers.material_controller import MaterialRouter
from app.controllers.medicamento_controller import MedicamentoRouter
from app.controllers.opcao_nesc_controller import OpcaoNescRouter
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


app.include_router(MaterialRouter)
app.include_router(MedicamentoRouter)
app.include_router(OpcaoNescRouter)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
)
