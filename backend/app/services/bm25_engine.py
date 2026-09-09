"""BM25 Search Engine — keyword-based search over document chunks"""

import math
from collections import Counter
from sqlalchemy.orm import Session
from app.models.chunk import DocumentChunk
from app.models.document import Document


class BM25Engine:
    """BM25 ranking over document chunks."""

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b

    def search(
        self,
        db: Session,
        query: str,
        case_id: int = None,
        top_k: int = 50,
    ) -> list[dict]:
        """
        Search chunks using BM25 scoring.
        Returns list of {chunk_id, document_id, score, content, ...}
        """
        query_terms = self._tokenize(query)
        if not query_terms:
            return []

        # Get all chunks (filtered by case if specified)
        chunk_query = db.query(DocumentChunk)
        if case_id:
            chunk_query = chunk_query.filter(DocumentChunk.case_id == case_id)

        chunks = chunk_query.all()
        if not chunks:
            return []

        # Build corpus statistics
        doc_count = len(chunks)
        avg_dl = sum(len(self._tokenize(c.content)) for c in chunks) / doc_count if doc_count > 0 else 1.0

        # Count document frequency for each term
        df = Counter()
        for chunk in chunks:
            terms = set(self._tokenize(chunk.content))
            for term in query_terms:
                if term in terms:
                    df[term] += 1

        # Score each chunk
        scored = []
        for chunk in chunks:
            chunk_terms = self._tokenize(chunk.content)
            tf = Counter(chunk_terms)
            dl = len(chunk_terms)
            score = 0.0

            for term in query_terms:
                if term not in tf:
                    continue

                term_tf = tf[term]
                term_df = df.get(term, 0)

                # IDF
                idf = math.log((doc_count - term_df + 0.5) / (term_df + 0.5) + 1.0)

                # BM25 TF
                numerator = term_tf * (self.k1 + 1)
                denominator = term_tf + self.k1 * (1 - self.b + self.b * (dl / avg_dl))
                score += idf * (numerator / denominator)

            if score > 0:
                # Get document info
                doc = db.query(Document).filter(Document.id == chunk.document_id).first()
                scored.append({
                    "chunk_id": chunk.id,
                    "document_id": chunk.document_id,
                    "document_name": doc.original_name if doc else "Unknown",
                    "case_id": chunk.case_id,
                    "content": chunk.content,
                    "page_start": chunk.page_start,
                    "page_end": chunk.page_end,
                    "score": score,
                })

        # Sort by score descending
        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

    def _tokenize(self, text: str) -> list[str]:
        """Simple whitespace tokenization with lowercasing and cleanup."""
        import re
        text = text.lower()
        tokens = re.findall(r'\b\w+\b', text)
        # Remove very short tokens
        return [t for t in tokens if len(t) > 1]


# Singleton
bm25_engine = BM25Engine()
