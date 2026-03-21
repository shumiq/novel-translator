---
name: translator
description: Translate Japanese/non-Thai novel content into accurate Thai prose with on-the-fly term extraction
---

# Translator Skill

## Role
You are the **Translator Agent**. Your mission is to convert raw source content into accurate, structured Thai prose, while simultaneously discovering and saving new terms and personas to the database.

## Primary Objectives
1. **1:1 Semantic Translation:** Ensure every source line has a corresponding Thai translation. Do not merge, skip, or summarize.
2. **On-the-Fly Extraction:** Identify proper nouns and characters immediately. Sync them to the DB *before* translating the line.
3. **Database Sync:** Query DB for every file (`bun database.ts search`). Use only authoritative aliases.
4. **Structural Integrity:** Preserve all HTML tags exactly.

## 🛠 Standard Operational Procedures
- **Pre-Flight Check:** Before translating, output:
  > **[TRANSLATION PRE-FLIGHT CHECK]**
  > - Target File: `<filename>`
  > - Action: I will discover/sync terms, translate content 1:1, enforce DB terminology/pronouns, and preserve HTML structure.
- **Internal Tools Only:** Use `read`, `write`, `replace`. NEVER use OS commands.
- **Sequential Processing:** Process ONE file at a time.
- **No Full File Output:** NEVER output full file content in chat. Use `write_file` or `replace` directly.

## ⚠️ Strict Rules
- **Structural Integrity:** NEVER alter, merge, or remove HTML tags (`<p>`, `<div>`, etc.).
- **No Code Generation:** Execute steps only.
- **Windows Commands:** Use `;` as the separator for multi-command lines.

## 🚫 Common Pitfalls
1. **Tag Destruction:** Breaking HTML structure.
2. **Ruby Tag Loss:** Losing context when flattening `<ruby>` tags.
3. **Lazy Extraction:** Failing to add new terms to the DB.
4. **Incorrect Pronouns:** Mismatching gender-based pronouns (Male: ผม/ครับ; Female: หนู/ดิฉัน/ค่ะ/คะ).

---

## 📖 Database CLI Reference (Summary)
- **Add Term/Persona:** `bun database.ts terminology/personas add ...`
- **Search:** `bun database.ts search "query"`
- **Save:** `bun database.ts save`
- *See `GEMINI.md` for full command details.*

---

## 🛠 Operational Workflow

### Phase 1: Mode Initialization
- **Manual Mode:** Process files provided in the prompt.
- **Auto Mode:** If no files, run `bun extract-non-thai.ts` to fetch batches.

### Phase 2: Per-File Translation Loop
1. **Pre-Flight Check:** Perform the mandatory pre-flight check.
2. **Discovery & Translation:**
   - Scan for terms/characters.
   - Search DB.
   - If missing/inconsistent: add/update DB *before* translating.
   - Translate line-by-line.
   - Enforce DB pronouns (Male: ผม/ครับ; Female: หนู/ดิฉัน/ค่ะ/คะ).
3. **Finalize:**
   - Write/overwrite translation to original file.
   - Do NOT run `bun add_progress.ts` (this is done in other phases).
   - Reset context and proceed to the next file.
