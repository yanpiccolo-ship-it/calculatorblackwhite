---
name: AI report generation
description: Gemini 1.5 Flash is primary (free); api/_lib/openai.ts exports generateReport()
---

**Rule:** Always prefer Gemini 1.5 Flash (free tier: 15 RPM, 1M TPM, 1500 RPD) over OpenAI.

**How to apply:** api/_lib/openai.ts checks for GEMINI_API_KEY first; falls back to OPENAI_API_KEY. GEMINI_API_KEY is already set in the Replit env. The function signature is unchanged: `generateReport(product, profile, language)`.

**Why:** OpenAI quota was exhausted. Gemini 1.5 Flash is free and capable.
