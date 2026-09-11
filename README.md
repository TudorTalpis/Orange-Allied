# Orange-Allied

AI-powered intelligent document processing and retrieval system.

## Project Description

Orange-Allied is a system designed to store, process, organize, and search
large collections of documents such as PDFs, photos, and scanned files.

The system uses OCR and AI/LLM technologies to identify document types,
extract structured information, and provide both traditional and semantic search.

Users can also interact with the system through an AI chat interface and ask
natural-language questions about their documents.

## Technology Stack

### Frontend
- TypeScript
- React
- Vite
- Tailwind CSS

### Backend
- Python
- FastAPI
- Pydantic

### Database
- PostgreSQL
- pgvector

### AI / Document Processing
- LLM
- Ollama
- MCP

### DevOps
- Docker
- GitHub Actions

## Main Features

- PDF and image upload
- Batch document upload
- AI document classification
- Metadata extraction
- Keyword search
- Filter-based search
- Semantic search
- Vector search
- AI chat
- Document references
- Local and cloud AI support

## Running the project

Requires Docker Desktop.

```bash
cp .env.example .env
# Generate a signing key and put it in .env as JWT_SECRET_KEY:
python -c "import secrets; print(secrets.token_hex(32))"
docker compose up -d
```

The backend refuses to start without a `JWT_SECRET_KEY` of at least 32
characters — a weak key would let anyone forge access tokens.

This starts PostgreSQL (with pgvector) and the backend. Database migrations run
automatically when the backend container starts.

- API: http://localhost:8000
- Interactive API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

```bash
docker compose logs -f backend   # follow logs
docker compose down              # stop (data is kept)
```

### Running the backend without Docker

The database still comes from Docker; only the API runs locally.

```bash
docker compose up -d db
cd backend
python -m venv venv
venv/Scripts/activate            # Windows; use: source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

### Tests

The backend tests need PostgreSQL running; they use a separate
`orange_allied_test` database, so development data is left alone.

```bash
docker compose up -d db
cd backend
python -m pytest
```

### Database migrations

After changing a model, create and apply a migration:

```bash
cd backend
alembic revision --autogenerate -m "describe the change"
alembic upgrade head
```

Inside Docker: `docker compose exec backend alembic upgrade head`.

## Project Structure

- `frontend/` – React + TypeScript frontend
- `backend/` – FastAPI backend and AI processing
- `docs/` – project documentation
- `tests/` – integration and system tests
- `.github/workflows/` – GitHub Actions workflows

## Status

Project under development.
