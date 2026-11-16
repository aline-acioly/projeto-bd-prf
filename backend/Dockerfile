FROM python:3.12-slim

# Sem .pyc no container e logs do uvicorn sem buffer (aparecem na hora no docker compose logs).
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Dependências primeiro: a camada fica em cache enquanto o requirements.txt não mudar.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000

# DATABASE_URL vem do docker-compose.yml (o .env local não entra na imagem).
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
