# System Architecture

## 1. Architecture Overview

Orange-Allied is designed as an API-first intelligent document processing
and retrieval system.

The planned architecture separates the frontend, backend, storage,
database, OCR, AI processing, search, and infrastructure components.

Main technologies and services include:

- React + Vite + TypeScript frontend
- FastAPI + Pydantic backend
- Supabase Storage for original document files
- Supabase PostgreSQL for structured application data
- pgvector for vector embeddings and semantic search
- Google Cloud Vision / Document AI for OCR
- LLM services for document understanding and information extraction
- Ollama for optional local AI processing
- MCP for controlled AI tool integration
- Docker for containerized development
- GitHub Actions for continuous integration

Some components described in this document are architectural targets and
are not yet fully implemented.

---

## 2. High-Level Architecture

User  
↓  
React + Vite + TypeScript Frontend  
↓  
HTTP / REST API  
↓  
FastAPI + Pydantic Backend  
↓  
Supabase Storage / Processing Queue  
↓  
Background Worker  
↓  
Google Cloud Vision / Document AI  
↓  
LLM / AI Processing  
↓  
Supabase PostgreSQL + pgvector  
↓  
Search / Retrieval / RAG  
↓  
AI Chat

The frontend communicates with application services through the FastAPI
backend.

The frontend should not communicate directly with Google OCR or other
internal processing services.

---

## 3. Frontend Architecture

The planned frontend technology stack is:

- React
- Vite
- TypeScript
- Tailwind CSS

Main frontend responsibilities include:

- user authentication interface
- document upload
- document management
- document preview
- category management
- document search
- search filters
- semantic search interface
- AI chat interface
- document processing status display

The frontend communicates with the backend using HTTP APIs.

For document processing, the frontend does not wait for OCR and AI
processing to finish inside the original upload request.

Instead, it receives the document identifier and can request the current
processing status from the backend.

---

## 4. Backend Architecture

The planned backend technology stack is:

- Python
- FastAPI
- Pydantic

Main backend responsibilities include:

- exposing REST API endpoints
- authentication and authorization
- file upload and validation
- document management
- communication with Supabase Storage
- creation of document processing jobs
- OCR orchestration
- document classification
- metadata extraction
- search orchestration
- embedding generation
- AI / LLM integration
- RAG processing
- MCP integration
- processing status management

The backend acts as the main orchestration layer between the frontend and
external or internal services.

---

## 5. Database and Storage Architecture

### Supabase Storage

Supabase Storage is planned to store original uploaded documents such as:

- PDF files
- scanned PDF documents
- photos
- scanned images

The original document should be preserved independently of the result of
OCR or AI processing.

### Supabase PostgreSQL

Supabase PostgreSQL is planned to store structured application data.

Main entities include:

- users
- documents
- categories
- extracted metadata
- processing status
- document chunks
- document-category relationships
- processing errors where applicable

Document metadata may include:

- document type
- company
- dates
- amounts
- currencies
- invoice numbers
- other document-specific information

### pgvector

pgvector is planned to store vector embeddings generated from document
chunks.

These vectors will support:

- semantic search
- document similarity
- retrieval for RAG

---

## 6. Asynchronous Document Processing Pipeline

Document processing must not be performed synchronously inside the initial
upload HTTP request.

The upload endpoint should store the original file, create the document
record, and schedule the document for background processing.

The planned processing flow is:

User uploads document  
↓  
FastAPI receives and validates the file  
↓  
Original file is stored in Supabase Storage  
↓  
Document record is created  
↓  
status = `UPLOADED`  
↓  
Processing job is added to a queue  
↓  
status = `QUEUED`  
↓  
Background worker receives the job  
↓  
status = `PROCESSING`  
↓  
Google Cloud Vision / Document AI performs OCR  
↓  
Extracted text  
↓  
LLM performs classification and metadata extraction  
↓  
Text chunking  
↓  
Embedding generation  
↓  
Metadata and chunks are stored in PostgreSQL  
↓  
Embeddings are stored using pgvector  
↓  
status = `COMPLETED`

If an unrecoverable processing error occurs:

status = `FAILED`

This architecture allows the upload request to return without waiting for
OCR, LLM processing, chunking, and embedding generation to finish.

---

## 7. Processing Statuses

The planned document processing lifecycle uses the following statuses:

- `UPLOADED` — the original document has been accepted and stored
- `QUEUED` — the document is waiting for background processing
- `PROCESSING` — OCR and/or AI processing is currently running
- `COMPLETED` — document processing completed successfully
- `FAILED` — document processing failed

Additional statuses may be introduced later if the processing pipeline
requires more detailed state tracking.

The frontend can use these statuses to display information such as:

- Uploaded
- Waiting for processing
- Processing
- Processed
- Processing failed

---

## 8. Queue and Worker Architecture

Document processing is planned to use a queue and background worker
mechanism.

The queue is responsible for holding processing jobs until they can be
handled.

The worker is responsible for executing tasks such as:

- OCR
- AI classification
- metadata extraction
- text chunking
- embedding generation
- database updates

The exact queue and worker technology has not yet been finalized by the
team.

Possible implementation technology must be selected together with the
backend and DevOps requirements.

Status: **To be implemented**

---

## 9. OCR Architecture

Google Cloud Vision / Document AI is planned to provide OCR capabilities.

Its main responsibility is extracting text and document data from:

- PDFs
- scanned PDFs
- photos
- scanned images

Conceptual flow:

Document  
↓  
Google Cloud Vision / Document AI  
↓  
Extracted text  
↓  
LLM / AI processing

Google OCR is not responsible for application business logic or database
management.

Status: **To be integrated**

---

## 10. AI Architecture

The AI layer is responsible for understanding the OCR output and extracting
structured information.

Possible extracted information includes:

- document type
- company
- dates
- amounts
- currencies
- names
- invoice numbers
- other document-specific metadata

The architecture supports both local and cloud AI providers.

### Local AI

Ollama may be used for local LLM execution.

### Cloud AI

Cloud-based LLM services may also be supported.

### Provider Abstraction

The backend should use an abstraction layer that allows the AI provider to
be changed without changing the main application architecture.

Possible providers include:

- Ollama
- cloud LLM APIs
- custom LLM APIs

Status: **To be implemented / integrated**

---

## 11. Search Architecture

The application is planned to support several retrieval methods.

### Keyword Search

Search based on words or phrases found in document content.

### Metadata Search

Search using structured fields such as:

- document type
- date
- category
- amount
- currency

### Semantic Search

Semantic search uses document embeddings stored using pgvector.

This allows documents to be retrieved based on semantic similarity rather
than only exact keyword matching.

### Hybrid Search

Hybrid search may combine:

- structured metadata filters
- keyword search
- semantic similarity

Status: **To be implemented**

---

## 12. Natural Language Query Processing

Users will be able to submit document queries using natural language.

Example:

“Find me five invoices from 2025–2026 with a total amount greater than
$25,000.”

The planned query flow is:

User Query  
↓  
Query Interpretation  
↓  
Entity / Date / Numeric Condition Extraction  
↓  
Structured Filters  
↓  
Metadata / Keyword / Semantic Search  
↓  
Ranked Results  
↓  
Response

Status: **To be implemented**

---

## 13. RAG Architecture

The system is planned to use Retrieval-Augmented Generation for answering
questions based on stored documents.

Planned flow:

User Question  
↓  
Query Interpretation  
↓  
Document Retrieval  
↓  
Relevant Document Chunks  
↓  
Context Construction  
↓  
LLM  
↓  
Answer + Source References

Responses should reference the corresponding source documents whenever
applicable.

Status: **To be implemented**

---

## 14. MCP Architecture

MCP is planned to provide a controlled interface through which AI components
can access application capabilities.

Initial planned MCP tools include:

- `search_documents`
- `get_document`
- `get_metadata`

MCP access must respect:

- authentication
- user permissions
- document ownership
- authorization rules
- input validation

Status: **To be implemented**

---

## 15. Authentication Architecture

The final authentication contract between the frontend and backend has not
yet been finalized.

The team must select one consistent authentication approach.

The currently considered options are:

### Option A — Supabase Auth

React  
↓  
Supabase Auth  
↓  
Access Token  
↓  
Authorization: Bearer token  
↓  
FastAPI validates the token  
↓  
Authenticated user

### Option B — FastAPI-managed JWT

React  
↓  
FastAPI authentication endpoint  
↓  
JWT issued by backend  
↓  
Authorization: Bearer token  
↓  
FastAPI validates JWT  
↓  
Authenticated user

Frontend and backend must use the same authentication contract.

The application should not implement incompatible authentication flows on
the frontend and backend.

Status: **Team decision required / To be implemented**

---

## 16. Security Architecture

The architecture should include:

- secure authentication
- token validation
- API authorization
- document ownership validation
- user data isolation
- secure file access
- file type validation
- file size limits
- input validation
- prompt injection protection
- LLM permission boundaries
- MCP tool authorization
- secrets management
- API key protection

Secrets and credentials must not be committed to GitHub.

Local secrets must be provided through environment variables.

Status: **Partially configured / further implementation required**

---

## 17. Environment Configuration

The repository contains:

`.env.example`

This file documents the expected environment variable names and may be
committed to the repository.

Each developer should create a local:

`.env`

file containing the real local configuration and credentials.

The `.env` file must not be committed to GitHub.

Docker Compose and local services should use `.env`, not `.env.example`,
for runtime configuration.

---

## 18. Local / Cloud / Hybrid Architecture

The project is designed to support different processing configurations.

### Local Mode

Possible local components include:

- local backend
- local AI through Ollama
- local development services

### Cloud Mode

Cloud components may include:

- Supabase PostgreSQL
- Supabase Storage
- Google Cloud Vision / Document AI
- cloud LLM services

### Hybrid Mode

Possible combinations include:

- cloud storage + local AI
- cloud OCR + local LLM
- configurable AI provider selection

The final deployment configuration will depend on the project environment.

Status: **To be finalized**

---

## 19. DevOps Architecture

The project uses:

- Git
- GitHub
- Docker
- Docker Compose
- GitHub Actions

The DevOps layer is responsible for creating a consistent development and
integration environment.

Planned CI activities include:

- build checks
- linting
- unit tests
- integration tests

Docker configuration will be expanded as frontend and backend
implementations become available.

Status: **Partially configured**

---

## 20. Planned Project Structure

Orange-Allied/

- frontend/
- backend/
- docs/
  - requirements.md
  - architecture.md
  - development-environment.md
  - git-workflow.md
- tests/
- .github/
  - workflows/
    - ci.yml
- docker-compose.yml
- .env.example
- .gitignore
- README.md

---

## 21. Implementation Status

This architecture document describes both existing project configuration
and planned system components.

### Currently Configured / Documented

The following items are currently present or documented in the repository:

- Git repository structure
- `main`, `develop`, and personal development branch workflow
- Pull Request workflow
- code review process
- project requirements documentation
- architecture documentation
- `.gitignore`
- `.env.example`
- GitHub CI skeleton

### To Be Implemented / Finalized

The following components are planned but are not yet fully implemented or
integrated:

- asynchronous processing queue
- background processing worker
- final authentication contract between frontend and backend
- Google Cloud Vision / Document AI integration
- Supabase Storage integration
- Supabase PostgreSQL integration
- LLM processing pipeline
- document classification
- metadata extraction
- text chunking
- embedding generation
- pgvector semantic search
- RAG pipeline
- MCP integration
- complete Docker configuration
- complete CI pipeline
- production deployment configuration

This section should be updated as project development progresses.

---

## 22. Summary

The architecture separates the system into independent layers:

1. Frontend
2. Backend API
3. File storage
4. Asynchronous document processing
5. Queue and workers
6. OCR
7. Database and vector storage
8. AI / LLM services
9. Search and retrieval
10. RAG
11. MCP integration
12. Authentication and security
13. DevOps infrastructure

The asynchronous processing architecture prevents long-running OCR and AI
operations from blocking document uploads.

The modular design also allows individual components to be implemented,
tested, and replaced independently as the project evolves.
