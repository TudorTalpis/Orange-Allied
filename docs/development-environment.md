# Development Environment

## Overview

The Orange-Allied project uses a modular development environment that connects
the frontend, backend, database, OCR, storage, and AI services.

## Main Technologies

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS

### Backend
- Python
- FastAPI
- Pydantic

### Database and Storage
- Supabase PostgreSQL
- pgvector
- Supabase Storage

### OCR
- Google Cloud Vision / Document AI

### AI
- LLM
- Ollama for local AI processing
- Optional cloud LLM providers

### DevOps
- Docker
- GitHub Actions

## Service Responsibilities

### React Frontend

The frontend provides the user interface.

It is responsible for:

- file upload interface
- document management
- search interface
- AI chat interface
- displaying document processing status

The frontend communicates with the FastAPI backend.

### FastAPI Backend

FastAPI acts as the orchestration layer between the application services.

It connects:

- the frontend
- Supabase Storage
- Supabase PostgreSQL
- Google OCR
- LLM services
- pgvector

### Google Cloud Vision / Document AI

Google Cloud Vision / Document AI is responsible for OCR and document text extraction.

Processing flow:

Document
→ Google OCR
→ Extracted Text

### Supabase Storage

Supabase Storage stores original uploaded files such as:

- PDF documents
- photos
- scanned documents

### Supabase PostgreSQL

Supabase PostgreSQL stores structured application data such as:

- users
- documents
- categories
- document metadata
- document chunks
- processing status

### pgvector

pgvector stores vector embeddings used for:

- semantic search
- document similarity
- RAG

### LLM / AI

The AI layer processes OCR text and extracts structured information such as:

- document type
- company
- dates
- amounts
- currencies
- invoice numbers
- other document-specific metadata

Ollama can be used for local AI processing.

Cloud-based LLM providers may also be supported.

## Development Data Flow

User
→ React Frontend
→ FastAPI Backend
→ Supabase Storage
→ Google OCR
→ LLM / AI
→ Supabase PostgreSQL
→ pgvector
→ Search / RAG / AI Chat

## Environment Configuration

Configuration values are provided through environment variables.

Sensitive values such as API keys, passwords, and service credentials must not
be committed to the repository.

The repository contains `.env.example` as a template.

Each developer should create a local `.env` file based on `.env.example`.
