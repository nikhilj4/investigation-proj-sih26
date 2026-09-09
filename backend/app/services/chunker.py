"""Smart Chunker — Split documents into overlapping chunks with metadata"""

from dataclasses import dataclass
from app.config import settings


@dataclass
class Chunk:
    index: int
    content: str
    page_start: int
    page_end: int
    token_count: int


class SmartChunker:
    """Split text into semantically meaningful chunks with overlap."""

    def __init__(self, chunk_size: int = None, chunk_overlap: int = None):
        self.chunk_size = chunk_size or settings.CHUNK_SIZE
        self.chunk_overlap = chunk_overlap or settings.CHUNK_OVERLAP

    def chunk_text(self, text: str, pages: list = None) -> list[Chunk]:
        """
        Split text into chunks:
        1. Split by paragraphs first (semantic boundaries)
        2. Merge small paragraphs until chunk_size reached
        3. Split large paragraphs by sentences
        4. Apply overlap between consecutive chunks
        """
        if not text or not text.strip():
            return []

        # Build page map: character offset → page number
        page_map = self._build_page_map(text, pages)

        # Split into paragraphs
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

        # If no paragraphs found, split by single newlines
        if len(paragraphs) <= 1:
            paragraphs = [p.strip() for p in text.split("\n") if p.strip()]

        # Merge small paragraphs and split large ones
        segments = self._normalize_segments(paragraphs)

        # Build chunks with overlap
        chunks = []
        current_text = ""
        chunk_idx = 0

        for segment in segments:
            # Check if adding this segment exceeds chunk size
            test_text = (current_text + "\n\n" + segment).strip() if current_text else segment
            test_tokens = self._estimate_tokens(test_text)

            if test_tokens > self.chunk_size and current_text:
                # Save current chunk
                page_start, page_end = self._get_page_range(current_text, text, page_map)
                chunks.append(Chunk(
                    index=chunk_idx,
                    content=current_text,
                    page_start=page_start,
                    page_end=page_end,
                    token_count=self._estimate_tokens(current_text),
                ))
                chunk_idx += 1

                # Start new chunk with overlap
                overlap_text = self._get_overlap(current_text)
                current_text = (overlap_text + "\n\n" + segment).strip() if overlap_text else segment
            else:
                current_text = test_text

        # Don't forget the last chunk
        if current_text.strip():
            page_start, page_end = self._get_page_range(current_text, text, page_map)
            chunks.append(Chunk(
                index=chunk_idx,
                content=current_text,
                page_start=page_start,
                page_end=page_end,
                token_count=self._estimate_tokens(current_text),
            ))

        return chunks

    def _normalize_segments(self, paragraphs: list[str]) -> list[str]:
        """Merge tiny paragraphs and split huge ones."""
        segments = []
        for para in paragraphs:
            tokens = self._estimate_tokens(para)
            if tokens > self.chunk_size * 1.5:
                # Split by sentences
                sentences = self._split_sentences(para)
                segments.extend(sentences)
            else:
                segments.append(para)
        return segments

    def _split_sentences(self, text: str) -> list[str]:
        """Split text into sentences."""
        import re
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip()]

    def _get_overlap(self, text: str) -> str:
        """Get the last N tokens of text for overlap."""
        words = text.split()
        overlap_words = words[-self.chunk_overlap:] if len(words) > self.chunk_overlap else words
        return " ".join(overlap_words)

    def _estimate_tokens(self, text: str) -> int:
        """Estimate token count (rough: ~0.75 tokens per word for English)."""
        return int(len(text.split()) * 1.3)

    def _build_page_map(self, full_text: str, pages: list = None) -> dict:
        """Map character positions to page numbers."""
        if not pages:
            return {}

        page_map = {}
        for page in pages:
            pos = full_text.find(page.text[:50])
            if pos >= 0:
                page_map[pos] = page.page_num
        return page_map

    def _get_page_range(self, chunk_text: str, full_text: str, page_map: dict) -> tuple[int, int]:
        """Determine which pages a chunk spans."""
        if not page_map:
            return 1, 1

        chunk_pos = full_text.find(chunk_text[:50])
        if chunk_pos < 0:
            return 1, 1

        chunk_end = chunk_pos + len(chunk_text)

        page_start = 1
        page_end = 1
        for pos, page_num in sorted(page_map.items()):
            if pos <= chunk_pos:
                page_start = page_num
            if pos <= chunk_end:
                page_end = page_num

        return page_start, page_end


# Singleton
chunker = SmartChunker()
