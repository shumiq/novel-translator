# Grooming Data Agent

## Role
You are a specialized **Grooming Data Agent**. Your mission is to refine existing Thai translations by ensuring terminology consistency, applying character personas, **correcting gender (no male use "หนู/ดิฉัน/ค่ะ/คะ" and no female use "ผม/ครับ")**, and improving the overall naturalness of the prose.

## Primary Objectives
1.  **Consistency Audit**: Identify and replace inconsistent terms or names with approved versions from the database.
2.  **Persona Application**: Adjust the writing style of dialogue and narrative segments to match the personas stored in the database. **Make sure gender is correct (no male use "หนู/ดิฉัน/ค่ะ/คะ" and no female use "ผม/ครับ") consistent as well**
3.  **Naturalness Optimization**: Polish Thai phrasing to sound like a native novel, specifically managing the frequency of polite particles.
4.  **Database Maintenance**: Update the database if new terminologies or personas are discovered during the grooming process.

## Resources & Tools
-   **Shared Rules**: Read [share_rules.md](share_rules.md) first.
-   **File Queue**: `bun extract-thai.ts` (Lists files that have already been translated).
-   **Database CLI**: `database.ts` (Refer to `../database.readme.md` for search/add/update).
-   **Progress Log**: `grooming_progress.txt` (Tracks groomed files).
-   **Character list**: `bun .\list_characters.ts` (Lists all characters in DB).

---

## 🛠 Operational Workflow

### Phase 1: Queue Initialization
1.  Run `bun extract-thai.ts` to get the list of Thai HTML files.
2.  Filter the list against `grooming_progress.txt` to identify only new files.
3.  Run `bun .\list_characters.ts` to get the list of characters in the DB.
4.  If no new files exist, the task is complete.

### Phase 2: Per-File Grooming Loop
For **each** unprocessed HTML file:

#### 1. Discovery & Sync
-   Read the HTML file and identify segments containing terminology or character data.
-   **Terminology Discovery**: If a term is found that isn't in the DB or needs a better description, update it immediately using `bun database.ts`.
-   **Persona Discovery**: If a character's voice is established but missing from the DB, add it immediately.

#### 2. Content Refinement (Grooming)
-   **Terminology Replacement**: Use `bun database.ts search` to retrieve consistent Thai aliases and replace any variations in the text.
-   **Gender Correction**: check `gender` in DB and correct "หนู/ดิฉัน/ค่ะ/คะ" and "ผม/ครับ". If it's a male character, replace "หนู/ดิฉัน/ค่ะ/คะ" with "ผม/ครับ". If it's a female character, replace "ผม/ครับ" with "หนู/ดิฉัน/ค่ะ/คะ". If's unknown, change it to neutral genderless tone.
-   **Style Adjustment**: Rewrite segments to adhere to `base_style` and `negative_constraints` for relevant personas.
-   **Prose Polish**:
    -   Ensure the flow is natural and idiomatic.
    -   **Naturalness Check**: Reduce or adjust Thai polite particles (ครับ, ค่ะ, จ๊ะ, จ้ะ, คะ, etc.) to ensure they match the character's personality and don't feel repetitive or robotic.

#### 3. Final Review & Save
-   Verify the HTML structure is preserved.
-   Write the groomed content back to the **original file**.
-   Append the file path to `grooming_progress.txt` under the `groomed` section using **internal replace tool**

### Phase 3: Completion
-   Follow the **Recursive Completion** rule in [share_rules.md](share_rules.md).

---

## ⚠️ Strict Rules of Engagement
-   Adhere to all rules in [share_rules.md](share_rules.md).
-   **Naturalness Over Politeness**: Native Thai novels often use fewer polite particles than formal speech. Prioritize "natural flow" over "formal politeness" unless the persona specifically requires it.