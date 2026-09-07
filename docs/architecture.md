# System Architecture

## 1. Architecture Overview

Orange-Allied follows an API-first architecture for document processing, storage, retrieval, and AI-powered interaction.

The main system components are:

* React + Vite + TypeScript frontend
* FastAPI + Pydantic backend
* PostgreSQL + pgvector database
* OCR and document processing services
* LLM and embedding services
* Ollama for local AI processing
* MCP for controlled AI tool integration
* Docker for containerized development
* GitHub Actions for continuous integration

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
Document Processing / Search / AI Services
↓
OCR / Vision / PostgreSQL + pgvector / LLM / Ollama
↓
Retrieval / RAG
↓
AI Chat

---

## 3. Frontend Architecture

The frontend is implemented using:

* React
* Vite
* TypeScript
* Tailwind CSS

Main frontend responsibilities include:

* user authentication interface
* document upload
* document management
* document preview
* category management
* document search
* search filters
* semantic search interface
* AI chat interface
* processing status display

The frontend communicates with the backend through HTTP APIs.

---

## 4. Backend Architecture

The backend is implemented using:

* Python
* FastAPI
* Pydantic

Main backend responsibilities include:

* exposing REST API endpoints
* authentication and authorization
* document management
* file upload and validation
* OCR orchestration
* document classification
* metadata extraction
* search orchestration
* embedding generation
* AI/LLM integration
* RAG processing
* MCP integration

---

## 5. Database Architecture

PostgreSQL is used for structured application data.

pgvector is used for storing and searching document embeddings.

Main entities include:

* users
* documents
* categories
* extracted metadata
* processing status
* document chunks
* embeddings
* document-category relationships

The database stores both structured metadata and vector representations used for semantic search.

---

## 6. Document Processing Pipeline

The document processing workflow is:

Document Upload
↓
File Validation
↓
Document Storage
↓
Text Extraction / OCR
↓
Document Classification
↓
Metadata Extraction
↓
Text Chunking
↓
Embedding Generation
↓
PostgreSQL + pgvector
↓
Search / RAG / AI Chat

Uploaded documents may be:

* PDF files
* scanned PDF files
* photos
* scanned images

The system extracts structured information such as:

* dates
* amounts
* currencies
* names
* companies
* invoice numbers
* document-specific metadata

---

## 7. AI Architecture

The AI layer supports both local and cloud processing.

### Local AI

Ollama is used to support local LLM execution.

Local processing can be used when privacy or offline processing is required.

### Cloud AI

Cloud-based LLM and embedding services can also be integrated.

### Provider Abstraction

The backend should use a provider abstraction layer so that different AI providers can be configured without changing the main application logic.

Possible AI providers include:

* Ollama
* cloud LLM APIs
* custom LLM APIs

---

## 8. Search Architecture

The application supports several retrieval methods.

### Keyword Search

Search based on exact words or phrases found in document content.

### Metadata Search

Search using structured fields such as:

* document type
* date
* category
* amount
* currency

### Semantic Search

Semantic search uses vector embeddings stored in PostgreSQL with pgvector.

This allows the system to retrieve documents based on meaning rather than only exact keywords.

### Hybrid Search

Hybrid search combines:

* keyword search
* metadata filters
* semantic similarity

---

## 9. Natural Language Query Processing

Users can submit requests using natural language.

Example:

“Find me five invoices from 2025–2026 with a total amount greater than $25,000.”

The processing flow is:

User Query
↓
Query Interpretation
↓
Entity / Date / Numeric Extraction
↓
Structured Filters
↓
Keyword / Metadata / Semantic Search
↓
Ranked Results

---

## 10. RAG Architecture

The system uses Retrieval-Augmented Generation to generate answers based on the user's documents.

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

The generated response should include references to the corresponding source documents.

---

## 11. MCP Architecture

MCP provides a controlled interface through which AI components can interact with application capabilities.

Initial MCP tools include:

* search_documents
* get_document
* get_metadata

MCP access must respect:

* user permissions
* document ownership
* authorization rules
* input validation

---

## 12. Security Architecture

The system architecture should include the following security principles:

* secure authentication
* session or token verification
* API authorization
* document ownership validation
* user data isolation
* secure file access
* file type validation
* file size limits
* input validation
* prompt injection protection
* LLM permission boundaries
* MCP tool authorization
* secure environment variable handling
* API key protection

---

## 13. Local / Cloud / Hybrid Architecture

The system supports three operation modes.

### Local Mode

* local backend
* local PostgreSQL database
* local file storage
* local vector search
* local AI processing through Ollama

### Cloud Mode

* cloud backend
* cloud database
* cloud file storage
* cloud AI processing

### Hybrid Mode

Possible combinations include:

* local storage + cloud AI
* cloud storage + local AI
* configurable data routing

---

## 14. DevOps Architecture

The project uses:

* Git
* GitHub
* Docker
* Docker Compose
* GitHub Actions

Docker will provide a consistent development environment for:

* frontend
* backend
* PostgreSQL + pgvector
* local AI services

GitHub Actions will be used for:

* build checks
* linting
* unit tests
* integration tests

---

## 15. Planned Project Structure

Orange-Allied/

* frontend/
* backend/
* docs/

  * requirements.md
  * architecture.md
* tests/
* .github/

  * workflows/

    * ci.yml
* docker-compose.yml
* .env.example
* .gitignore
* README.md

---

## 16. Summary

The architecture separates the application into independent layers:

1. Frontend
2. Backend API
3. Document processing
4. Database and vector search
5. AI / LLM services
6. Retrieval and RAG
7. MCP tool integration
8. Security
9. DevOps infrastructure

This modular architecture allows the system to support local, cloud, and hybrid configurations while keeping components maintainable and replaceable.
