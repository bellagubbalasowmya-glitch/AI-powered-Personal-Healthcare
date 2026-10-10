# AI/ML Pipeline Architecture (Planned)

Planned modules:
* **OCR Ingestion**: PaddleOCR / Tesseract for medical report table and text extraction.
* **Clinical Entity Recognition**: BioBERT / spaCy clinical pipelines for identifying lab analytes, reference intervals, and medication dosages.
* **RAG Pipeline**: Vector embeddings (bge-large-en or text-embedding-3-small) with vector search to ground Copilot responses with source document citations.
* **LLM Synthesis**: Structured JSON extraction and plain-language patient explanations with guardrails against diagnostic hallucination.
