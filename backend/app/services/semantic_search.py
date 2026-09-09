"""Semantic Search — cosine similarity over embeddings"""

import numpy as np
from sqlalchemy.orm import Session
from app.models.chunk import DocumentChunk
from app.models.document import Document
from app.services.embeddings import embedding_service


class SemanticSearch:
    """Search chunks using semantic similarity (cosine distance on embeddings)."""

    def search(
        self,
        db: Session,
        query: str,
        case_id: int = None,
        top_k: int = 50,
    ) -> list[dict]:
        """
        1. Embed the query
        2. Load chunk embeddings from DB
        3. Compute cosine similarity
        4. Return top-K
        """
        # Embed query
        query_embedding = embedding_service.embed_query(query)
        query_vec = np.array(query_embedding, dtype=np.float32)

        # Get chunks with embeddings
        chunk_query = db.query(DocumentChunk).filter(DocumentChunk.embedding.isnot(None))
        if case_id:
            chunk_query = chunk_query.filter(DocumentChunk.case_id == case_id)

        chunks = chunk_query.all()
        if not chunks:
            return []

        # Compute similarities
        scored = []
        for chunk in chunks:
            if not chunk.embedding:
                continue

            chunk_vec = np.array(chunk.embedding, dtype=np.float32)
            similarity = self._cosine_similarity(query_vec, chunk_vec)

            if similarity > 0.1:  # Threshold to filter noise
                doc = db.query(Document).filter(Document.id == chunk.document_id).first()
                scored.append({
                    "chunk_id": chunk.id,
                    "document_id": chunk.document_id,
                    "document_name": doc.original_name if doc else "Unknown",
                    "case_id": chunk.case_id,
                    "content": chunk.content,
                    "page_start": chunk.page_start,
                    "page_end": chunk.page_end,
                    "score": float(similarity),
                })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

    def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        """Compute cosine similarity between two vectors."""
        dot = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)


# Singleton
semantic_search = SemanticSearch()
