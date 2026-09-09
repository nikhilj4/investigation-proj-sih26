"""Hybrid Search — combines BM25 + Semantic search with configurable fusion"""

from sqlalchemy.orm import Session
from app.config import settings
from app.models.case import Case
from app.services.bm25_engine import bm25_engine
from app.services.semantic_search import semantic_search


class HybridSearch:
    """Merge and rerank BM25 + Semantic results with weighted fusion."""

    def __init__(self):
        self.bm25_weight = settings.BM25_WEIGHT
        self.semantic_weight = settings.SEMANTIC_WEIGHT

    def search(
        self,
        db: Session,
        query: str,
        case_id: int = None,
        top_k: int = None,
    ) -> list[dict]:
        """
        1. Run BM25 search → top 50
        2. Run Semantic search → top 50
        3. Normalize scores to [0, 1]
        4. Fuse: final = α * bm25_norm + (1-α) * semantic_norm
        5. Deduplicate by chunk_id
        6. Return top K
        """
        top_k = top_k or settings.SEARCH_TOP_K

        # Get results from both engines
        bm25_results = bm25_engine.search(db, query, case_id=case_id, top_k=50)
        semantic_results = semantic_search.search(db, query, case_id=case_id, top_k=50)

        # Normalize scores
        bm25_results = self._normalize_scores(bm25_results)
        semantic_results = self._normalize_scores(semantic_results)

        # Build lookup by chunk_id
        merged = {}

        for r in bm25_results:
            cid = r["chunk_id"]
            merged[cid] = {
                **r,
                "bm25_score": r["score"],
                "semantic_score": 0.0,
            }

        for r in semantic_results:
            cid = r["chunk_id"]
            if cid in merged:
                merged[cid]["semantic_score"] = r["score"]
            else:
                merged[cid] = {
                    **r,
                    "bm25_score": 0.0,
                    "semantic_score": r["score"],
                }

        # Compute hybrid score
        results = []
        for cid, data in merged.items():
            hybrid_score = (
                self.bm25_weight * data["bm25_score"]
                + self.semantic_weight * data["semantic_score"]
            )

            # Get case number
            case = db.query(Case).filter(Case.id == data["case_id"]).first()

            results.append({
                "chunk_id": data["chunk_id"],
                "document_id": data["document_id"],
                "document_name": data["document_name"],
                "case_id": data["case_id"],
                "case_number": case.case_number if case else "Unknown",
                "content": data["content"],
                "page_start": data.get("page_start"),
                "page_end": data.get("page_end"),
                "bm25_score": round(data["bm25_score"], 4),
                "semantic_score": round(data["semantic_score"], 4),
                "hybrid_score": round(hybrid_score, 4),
            })

        results.sort(key=lambda x: x["hybrid_score"], reverse=True)
        return results[:top_k]

    def _normalize_scores(self, results: list[dict]) -> list[dict]:
        """Min-max normalize scores to [0, 1]."""
        if not results:
            return results

        scores = [r["score"] for r in results]
        min_score = min(scores)
        max_score = max(scores)
        score_range = max_score - min_score

        for r in results:
            if score_range > 0:
                r["score"] = (r["score"] - min_score) / score_range
            else:
                r["score"] = 1.0

        return results


# Singleton
hybrid_search = HybridSearch()
