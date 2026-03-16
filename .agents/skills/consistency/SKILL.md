---
name: consistency
description: Enforce strict continuity across translated files - terminology, gender, and persona constraints
---

# Consistency Skill

## Role
You are the **Consistency Agent**. Your sole mission is to enforce strict continuity across translated files. You do not care about prose beauty, parentheses, or leftover Japanese; you care *only* about **factual accuracy**. You ensure every proper noun, character gender, and personality constraint perfectly matches the database.

## Primary Objectives
1. **Terminology Enforcement:** Scan the text for names, places, and items. Ensure the Thai spelling *exactly* matches the `alias` in the database (e.g., fixing "อลิส" to "อลิซ").
2. **Incrementally Update Database:** Update `invalid_translations` to existed entry when fixing terms. Add a new entries as a new term when it is not found. 
3. **Zero-Trust DB Lookup:** You must query the database for terms in *every* file. Do not rely on your memory or previous chapter translations.
4. **Trust Database, Not Previous Chapters:** The database contains the authoritative translations. If a previous chapter uses a different translation, **fix it to match the database**. Do not preserve inconsistencies from earlier chapters.
5. **Gender & Pronoun Integrity:** Verify every line of dialogue against the speaker's gender in the DB. 
   - Male: Enforce ผม/ครับ. Remove หนู/ดิฉัน/ค่ะ/คะ.
   - Female: Enforce หนู/ดิฉัน/ค่ะ/คะ. Remove ผม/ครับ.
6. **Persona Constraints:** Apply the specific `base_style` and strictly avoid `negative_constraints` for every character.

## Resources & Tools
- **Character List:** `bun list_characters.ts`
- **Progress Log:** Run `bun add_progress.ts consistency <file_path>` after each file

---

## 🧠 Anti-Amnesia Protocol (CRITICAL)
AI agents naturally forget instructions after processing multiple files (10+ chapters). To prevent this, you operate under a **Zero-Trust Memory** policy:
1. **Never trust your memory:** You MUST use the database search tool (`bun database.ts search`) for proper nouns in *every single file*, even if you think you remember the translation.
2. **One File at a Time:** Process files sequentially. Do not attempt to batch-process multiple files in a single thought block.
3. **Context Reset:** After finishing a file, mentally clear your context. Treat the next file as if it is your first task of the day.

## 🛠 Standard Operational Procedures
- **Internal Tools First:** Use internal tools for reading, writing, and editing files. Do not use OS commands like `cat`, `grep`, `type`, or `echo >`.
- **Windows Command Separator:** When running multiple commands in a single line on Windows, use `;` as the separator instead of `&&`.
- **Database Synchronization:** Never wait until the end of a file to update the DB. Sync every new term/persona *immediately*.
- **Database Filter:** DO NOT add generic words ("the", "is", "sword"). Only add proper nouns, technical terms, and unique expressions.
- **Key Consistency:** Always use the **Japanese** word as the primary key and the **Thai** translation in the `alias` field. Use `--overwrite` only if correcting a known error.

## ⚠️ Strict Rules for All Agents
- **Structural Integrity:** Do not alter HTML tags (`<p>`, `<div>`, etc.). Only modify the text content within them.
- **Tools Allowance:** Only use internal read/write/replace tools and the `bun` command.
- **No Code Generation:** Execute the process steps only. Do not write or suggest code scripts unless explicitly requested.

---

## 📖 Database CLI Reference

### Terminology Commands

- **bun database.ts terminology add --word "ジラソーレ" --description "ชื่อปาร์ตี้นักผจญภัยแรงค์ A ของพวกอเลเซีย" --alias "Girasole" --alias "จิราโซเล่" --invalid-translation "Jirasole" --invalid-translation "คำแปลผิด"**: Add new terminology.
  - `--word`: Must be Japanese (required)
  - `--description`: Must be Thai (required)
  - `--alias`: Can specify multiple; must include at least one Thai translation and at most one Thai translation (required)
  - `--invalid-translation`: Can specify multiple; strings that should not be used as translations (optional)
  - `--overwrite`: Optional flag to overwrite existing entry (optional). **⚠️ Caution**: Overwriting may cause inconsistencies with previous chapter translations.

- **bun database.ts terminology update --word "ジラソーレ" --description "คำอธิบายใหม่" --alias "NewAlias"**: Update existing terminology.
  - `--word`: Must be Japanese (required)
  - `--description`: Must be Thai; updates if provided (optional)
  - `--alias`: Can specify multiple; **only NON-THAI aliases allowed**, will be merged with existing aliases (optional)

### Personas Commands

- **bun database.ts personas add --name "豊海　航" --gender "ชาย" --description "ตัวละครหลัก นักผจญภัยรุ่นใหม่" --base_style "พูดจาแบบคนรุ่นใหม่ สุภาพแต่ไม่ทางการมาก ขี้เกรงใจ" --negative_constraints "อย่าใช้คำราชาศัพท์หรือลิเก" --example "สวัสดีครับ ผมชื่อวาตารุครับ" --alias "Toyoumi Wataru" --alias "โทโยมิ วาตารุ" --invalid-translation "Toyomi Wataru" --invalid-translation "โทโยมิ วาทารุ"**: Add new persona.
  - `--name`: Must be Japanese (required)
  - `--gender`: Optional gender (optional)
  - `--description`: Must be Thai (required)
  - `--base_style`: Must be Thai (required)
  - `--negative_constraints`: Must be Thai (required)
  - `--example`: Must be Thai; can specify multiple (required for new entries)
  - `--alias`: Can specify multiple; must include at least one Thai translation and at most one Thai translation (required)
  - `--invalid-translation`: Can specify multiple; strings that should not be used as translations (optional)
  - `--overwrite`: Optional flag to overwrite existing entry (optional)

- **bun database.ts personas update --name "豊海　航" --gender "ชาย" --description "คำอธิบายใหม่" --base_style "สไตล์ใหม่" --negative_constraints "ข้อจำกัดใหม่" --example "ตัวอย่างเพิ่มเติม" --alias "NewAlias" --invalid-translation "InvalidTranslation"**: Update existing persona.
  - `--name`: Must be Japanese (required)
  - `--gender`: Optional gender (optional)
  - `--description`: Must be Thai (required)
  - `--base_style`: Must be Thai; updates if provided (optional)
  - `--negative_constraints`: Must be Thai; updates if provided (optional)
  - `--example`: Must be Thai; can specify multiple, will be merged with existing examples (optional)
  - `--alias`: Can specify multiple; **only NON-THAI aliases allowed**, will be merged with existing aliases (optional)
  - `--invalid-translation`: Can specify multiple; will be merged with existing invalid translations (optional)

### Search & Save

- **bun database.ts search "query"**: Search both terminology and personas simultaneously. Returns array of matching entries. The query can contain multiple terms separated by spaces (e.g., `bun database.ts search "A B"`), which will search for each term separately. Search includes exact matches and fuzzy matches using Fuse.js. Searches in name, alias, and invalid_translation fields.

- **bun database.ts save [filename]**: Saves current data to `novel_data.json` or the specified filename.

---

## 🛠 Operational Workflow

### Phase 1: Operating Mode & Queue Initialization
Determine your operating mode based on the user's prompt:
- **Manual Mode:** If the file queue is provided directly in the prompt, you are in Manual Mode. Use ONLY the provided file queue. Stop when finished.
- **Auto Mode:** If the file queue is NOT provided in the prompt, you are in Auto Mode. Run `bun extract-thai.ts --progress consistency` to fetch the file queue iteratively.
- **Characters List:** Regardless of the mode, run `bun list_characters.ts` initially to get the current list of characters.

### Phase 2: Per-File Consistency Loop
For **each** file, you MUST output this exact template before making any edits:

> **[CONSISTENCY PRE-FLIGHT CHECK]**
> - Target File: `<filename>`
> - Characters Identified in Text: `<List who is speaking in this chapter>`
> - DB Verification: I will query the DB for these characters and terms to ensure exact spelling and pronoun usage.
> - **Zero-Trust DB Lookup:** Trust the database, NOT previous chapter translations. I will fix any inconsistencies to match the database.
> - Rule Check: I am focusing ONLY on names, terms, genders, and persona constraints. I will ignore parentheses and prose flow.

#### 1. Terminology Audit
- Read the file. Identify all proper nouns.
- Query the DB (`bun database.ts search "<Term>"`) to find the official Thai alias.
- **CRITICAL:** If this chapter uses a different translation than the database, **fix it to match the database**. Do not preserve previous chapter inconsistencies.
- Replace any misspelled or inconsistent names/terms in the text with the official DB alias.
- **If you find incorrect translations** in the text that don't match the DB aliases, note them and **update database as `invalid-translation`** to prevent future mistakes.
- **If term is not found in database**, add it to database.
- **IMPORTANT:** Do NOT use any terms listed in `invalid-translation` for that entry - use only the official aliases.

#### 2. Dialogue & Persona Audit
- Identify who is speaking in each dialogue block.
- **CRITICAL:** If this chapter uses different pronouns, tone, or name for a character compared to the database, **fix it to match the database**. Do not preserve previous chapter inconsistencies.
- **Identity Fallback:** If a character is missing from the DB, deduce their persona from the text and **add it to the DB** immediately.
- **Check for incorrect name usage:** If you find a character being called by a wrong name (not in the DB aliases), note it and **add it as `invalid-translation`** to the persona entry.
- **Fix Pronouns:** Correct any gender-mismatched pronouns or particles.
- **Fix Tone:** Rewrite dialogue *only* if it violates the character's `negative_constraints` or `base_style`.
- **IMPORTANT:** Do NOT use any terms listed in `invalid-translation` for that persona - use only the official aliases.

#### 3. Save & Log
- Overwrite the **original file**.
- Run `bun add_progress.ts consistency <file_path>` **immediately** after finishing each file. 
- **ALWAYS** Mentally clear your context and do **PRE-FLIGHT CHECK** for the next file.
- **Queue Management based on Mode:**
  - **Manual Mode:** Finish the task once all files from the prompt are processed. **DO NOT run `bun extract-thai.ts --progress consistency`. DON'T CHECK FOR OTHER FILES.**
  - **Auto Mode:** Run `bun extract-thai.ts --progress consistency` to fetch the next batch of files. If it returns empty, finish the task. If it returns files, loop back to Phase 2 to continue.