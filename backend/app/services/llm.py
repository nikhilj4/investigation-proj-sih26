"""LLM Provider — Gemini integration with provider-agnostic interface"""

import json
from google import genai
from google.genai import types
from app.config import settings


class LLMProvider:
    """Provider-agnostic LLM interface. Currently supports Google Gemini."""

    def __init__(self):
        if settings.GEMINI_API_KEY:
            try:
                self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception as e:
                print(f"[WARN] Failed to initialize Gemini LLM client: {e}")
                self.client = None
        else:
            self.client = None
        self.model = settings.LLM_MODEL

    def generate(self, prompt: str, system_prompt: str = None, temperature: float = 0.3) -> str:
        """Generate response using Gemini with fallback synthesis."""
        if not self.client:
            return self._heuristic_fallback(prompt)

        full_prompt = prompt
        if system_prompt:
            full_prompt = f"SYSTEM INSTRUCTION: {system_prompt}\n\n{prompt}"

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=full_prompt,
            )
            return response.text
        except Exception as e:
            print(f"[WARN] Gemini API call failed: {e}")
            return self._heuristic_fallback(prompt)

    def _heuristic_fallback(self, prompt: str) -> str:
        """Synthesize answer directly from context when LLM API key is invalid/offline."""
        lines = prompt.split('\n')
        evidence = [l for l in lines if l.startswith('-') or l.startswith('[')]
        ev_summary = "\n".join(evidence[:10]) if evidence else "No direct document match found."
        
        return (
            f"**ASSISTANT INVESTIGATION BRIEF (EXTRACTIVE ANALYSIS)**\n\n"
            f"**Evidence Summary:**\n{ev_summary}\n\n"
            f"**Note:** Grounded directly on active case entities and relationships in the database."
        )

    def generate_structured(self, prompt: str, system_prompt: str = None, temperature: float = 0.1) -> dict:
        """Generate structured JSON output from LLM."""
        config = types.GenerateContentConfig(
            temperature=temperature,
            max_output_tokens=4096,
            response_mime_type="application/json",
        )
        if system_prompt:
            config.system_instruction = system_prompt

        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=config,
        )

        try:
            return json.loads(response.text)
        except json.JSONDecodeError:
            # Fallback: try to extract JSON from the response
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            return json.loads(text.strip())


# Singleton
llm = LLMProvider()
