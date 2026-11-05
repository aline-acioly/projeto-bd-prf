from fastapi import FastAPI
from app.controllers.material_controller import MaterialRouter
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Sistema de Avaliação PRF")


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}


app.include_router(MaterialRouter)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
)
