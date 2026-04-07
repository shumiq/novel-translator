# Translation Database CLI (`database.ts`)

This CLI tool manages a JSON database (`novel_data.json`) used for Japanese-to-Thai novel translation. It stores and retrieves **Terminology** (general vocabulary/lore) and **Personas** (character profiles, speaking styles, and constraints).

## Core Rules & Constraints (CRITICAL)

To use this tool correctly, you **MUST** adhere to the following language and formatting rules:

1. **Japanese Keys:** `--word` (for terminology) and `--name` (for personas) **MUST** contain Japanese characters.
2. **Thai Content:** `--description`, `--base_style`, `--negative_constraints`, and `--example` **MUST** contain Thai characters.
3. **The "One Thai Alias" Rule:** 
   - When using `add`, you **MUST** provide exactly **ONE** Thai translation via the `--alias` flag.
   - When using `update`, you **CANNOT** add Thai aliases. You may only add non-Thai aliases (e.g., English romaji) during an update.
4. **Gender Strictness:** `--gender` **MUST** be exactly one of: `ชาย` (Male), `หญิง` (Female), or `ไม่ระบุ` (Unspecified).
5. **Repeatable Flags:** `--alias`, `--invalid-translation`, and `--example` can be used multiple times in a single command to add multiple items.
6. **Overwriting:** If an entry or its primary Thai alias already exists, the CLI will block the `add` command to prevent translation inconsistencies. You must explicitly pass the `--overwrite` flag to bypass this.

---

## Commands

### 1. Terminology Management

Manage general vocabulary, places, magic spells, or items.

#### `terminology add`
Creates a new terminology entry.
* **Required:**
  * `--word <text>`: The Japanese term.
  * `--description <text>`: Thai explanation of the term.
  * `--alias <text>`: The official Thai translation (exactly one).
* **Optional:**
  * `--invalid-translation <text>`: Known bad translations to avoid (repeatable).
  * `--overwrite`: Force overwrite if the word already exists.

**Example:**
```bash
bun database.ts terminology add --word "魔法" --description "พลังงานลึกลับที่ใช้ร่ายเวท" --alias "เวทมนตร์" --invalid-translation "magic" --invalid-translation "มายิก"
```

#### `terminology update`
Updates an existing terminology entry.
* **Required:**
  * `--word <text>`: The Japanese term (must already exist).
* **Optional:**
  * `--description <text>`: New Thai description.
  * `--alias <text>`: Additional **Non-Thai** aliases (repeatable).
  * `--invalid-translation <text>`: Additional invalid translations (repeatable).

**Example:**
```bash
bun database.ts terminology update --word "魔法" --invalid-translation "เวทย์มนต์"
```

---

### 2. Persona Management

Manage character profiles, ensuring consistent tone, gender, and speaking styles.

#### `personas add`
Creates a new character persona.
* **Required:**
  * `--name <text>`: Character's Japanese name.
  * `--gender <ชาย|หญิง|ไม่ระบุ>`: Character's gender.
  * `--description <text>`: Thai description of the character.
  * `--base_style <text>`: Thai instructions on how they speak (e.g., tone, politeness).
  * `--negative_constraints <text>`: Thai instructions on what they should *never* say.
  * `--example <text>`: Thai dialogue examples (repeatable, at least one required).
  * `--alias <text>`: The official Thai translated name (exactly one).
* **Optional:**
  * `--invalid-translation <text>`: Incorrect name translations (repeatable).
  * `--overwrite`: Force overwrite if the persona already exists.

**Example:**
```bash
bun database.ts personas add \
  --name "田中" \
  --gender "ชาย" \
  --description "เด็กหนุ่มขี้อายและสุภาพ" \
  --base_style "พูดจาสุภาพเรียบร้อย ลงท้ายด้วย 'ครับ' เสมอ แทนตัวเองว่า 'ผม'" \
  --negative_constraints "ห้ามใช้คำหยาบคายเด็ดขาด ห้ามพูดเสียงดัง" \
  --example "สวัสดีครับ ผมทานากะครับ" \
  --example "เอ่อ... ขอโทษนะครับที่รบกวน" \
  --alias "ทานากะ"
```

#### `personas update`
Updates an existing character persona.
* **Required:**
  * `--name <text>`: Character's Japanese name (must already exist).
* **Optional:**
  * `--gender <ชาย|หญิง|ไม่ระบุ>`: New gender.
  * `--description <text>`: New Thai description.
  * `--base_style <text>`: New speaking style rules.
  * `--negative_constraints <text>`: New negative constraints.
  * `--example <text>`: Additional Thai dialogue examples (repeatable).
  * `--alias <text>`: Additional **Non-Thai** aliases (repeatable).
  * `--invalid-translation <text>`: Additional invalid translations (repeatable).

**Example:**
```bash
bun database.ts personas update --name "田中" --example "ขอบคุณมากครับ!" --alias "Tanaka"
```

---

### 3. Search

Search the database using fuzzy matching. It searches against Japanese names/words, aliases, and invalid translations.

```bash
bun database.ts search <query>
```

**Example:**
```bash
bun database.ts search "魔法"
bun database.ts search "ทานากะ"
```
*Note: The search output is wrapped in `=== SEARCH_RESULT_START ===` and `=== SEARCH_RESULT_END ===` blocks for easy parsing.*

---

### 4. Save

Manually trigger a save to the JSON file (though `add` and `update` commands save automatically).

```bash
bun database.ts save
bun database.ts save custom_file.json
```

---

### 5. Help

Print the built-in help menu.

```bash
bun database.ts help
```