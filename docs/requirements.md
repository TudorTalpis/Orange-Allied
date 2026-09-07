# Project Requirements

## 1. Functional Requirements

### FR-01 — User Authentication
The system shall allow users to authenticate and access their own document collection.

### FR-02 — Single Document Upload
The system shall allow users to upload individual PDF files, images, and scanned documents.

### FR-03 — Batch Document Upload
The system shall allow users to upload multiple documents in a single operation.

### FR-04 — Document Processing
The system shall automatically process uploaded documents.

### FR-05 — OCR
The system shall extract text from scanned documents and images using OCR technologies.

### FR-06 — Document Classification
The system shall automatically identify the type of uploaded document.

Supported document types may include:
- invoices
- receipts
- contracts
- reports
- other / unknown documents

### FR-07 — Metadata Extraction
The system shall extract structured information from documents, including:
- dates
- amounts
- currencies
- names
- companies
- invoice numbers
- document-specific metadata

### FR-08 — Metadata Storage
The system shall store extracted metadata together with the original document.

### FR-09 — Document Categories
Users shall be able to create, rename, and delete custom categories.

### FR-10 — Category Assignment
Users shall be able to assign documents to categories.

### FR-11 — Keyword Search
The system shall allow users to search documents using keywords.

### FR-12 — Metadata Filtering
The system shall allow users to filter documents by:
- document type
- date
- category
- amount
- other available metadata

### FR-13 — Semantic Search
The system shall support semantic document search using vector embeddings.

### FR-14 — Vector Search
Document embeddings shall be stored and searched using PostgreSQL with pgvector.

### FR-15 — Natural Language Queries
The system shall allow users to search documents using natural-language requests.

Example:

"Find me five invoices from 2025–2026 with a total amount greater than $25,000."

### FR-16 — Query Interpretation
The system shall convert relevant natural-language conditions into structured search filters.

### FR-17 — AI Chat
The system shall provide an AI chat interface through which users can ask questions about their documents.

### FR-18 — Source References
AI responses shall include references to the corresponding source documents when applicable.

### FR-19 — Document Preview
Users shall be able to preview stored documents.

### FR-20 — Processing Status
The system shall display the processing status of uploaded documents.

### FR-21 — Local AI Processing
The system shall support local AI/LLM processing through Ollama.

### FR-22 — Cloud AI Processing
The system shall support cloud-based AI/LLM providers.

### FR-23 — MCP Integration
The system shall use MCP as a controlled interface through which AI components can access application capabilities such as document search and retrieval.


## 2. Non-Functional Requirements

### NFR-01 — Security
User documents and metadata shall be protected from unauthorized access.

### NFR-02 — User Data Isolation
Users shall only be able to access their own documents and associated data.

### NFR-03 — API-First Architecture
Backend functionality shall be exposed through clearly defined APIs.

### NFR-04 — Maintainability
The application shall use a modular architecture to simplify maintenance and future development.

### NFR-05 — Reproducible Development Environment
The development environment shall be reproducible using Docker.

### NFR-06 — Automated Testing
Automated checks and tests shall be executed through GitHub Actions.

### NFR-07 — Scalability
The system architecture should support increasing numbers of users and documents.

### NFR-08 — Search Performance
Document search should return results within a reasonable response time.

### NFR-09 — Reliability
Document processing failures shall be handled without losing the original uploaded document.

### NFR-10 — Extensibility
The system shall support multiple OCR, LLM, embedding, and storage providers.

### NFR-11 — Local / Cloud Configuration
The system shall support local, cloud, and hybrid processing configurations.

### NFR-12 — Privacy
The system shall allow configurations that minimize sending sensitive document data to external services.


## 3. Minimum Viable Product (MVP)

The initial MVP shall demonstrate the complete document-processing workflow.

### MVP Workflow

1. User uploads a PDF or image.
2. The backend receives and stores the document.
3. OCR extracts text where required.
4. AI identifies the document type.
5. Relevant metadata is extracted.
6. Metadata is stored in PostgreSQL.
7. Text is divided into searchable chunks.
8. Embeddings are generated.
9. Embeddings are stored using pgvector.
10. User can search using keywords and filters.
11. User can perform semantic search.
12. User can ask a natural-language question through AI chat.
13. The system retrieves relevant documents.
14. The response includes references to source documents.

## 4. MVP Example

A user uploads several invoices and asks:

> Find me five invoices from 2025–2026 with a total amount greater than $25,000.

The system should:

1. interpret the requested date range;
2. interpret the amount condition;
3. identify invoices;
4. query stored metadata and document embeddings;
5. return matching documents;
6. display references to the original documents.
