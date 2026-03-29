# Database CLI Documentation

## Usage Note

Keys are Japanese or Thai words. Use the `search` command to check for existing entries and the `add` command to add new entries. Data is stored in `novel_data.json`.

## CLI Details

### Terminology Commands

- **bun database.ts terminology add --word "ジラソーレ" --description "ชื่อปาร์ตี้นักผจญภัยแรงค์ A ของพวกอเลเซีย" --alias "Girasole" --alias "จิราโซเล่" --invalid-translation "Jirasole" --invalid-translation "คำแปลผิด"**: Add new terminology.
  - `--word`: Must be Japanese or Thai (required)
  - `--description`: Must be Thai (required)
  - `--alias`: Can specify multiple; must include at least one Thai translation and at most one Thai translation (required)
  - `--invalid-translation`: Can specify multiple; strings that should not be used as translations (optional)
  - `--overwrite`: Optional flag to overwrite existing entry (optional). **⚠️ Caution**: Overwriting may cause inconsistencies with previous chapter translations. A confirmation prompt (Y/N) will be displayed.

- **bun database.ts terminology update --word "ジラソーレ" --description "คำอธิบายใหม่" --alias "NewAlias"**: Update existing terminology.
  - `--word`: Must be Japanese or Thai (required)
  - `--description`: Must be Thai; updates if provided (optional)
  - `--alias`: Can specify multiple; **only NON-THAI aliases allowed**, will be merged with existing aliases (optional)

### Personas Commands

- **bun database.ts personas add --name "豊海　航" --gender "ชาย" --description "ตัวละครหลัก นักผจญภัยรุ่นใหม่" --base_style "พูดจาแบบคนรุ่นใหม่ สุภาพแต่ไม่ทางการมาก ขี้เกรงใจ" --negative_constraints "อย่าใช้คำราชาศัพท์หรือลิเก" --example "สวัสดีครับ ผมชื่อวาตารุครับ" --alias "Toyoumi Wataru" --alias "โทโยมิ วาตารุ" --invalid-translation "Toyomi Wataru" --invalid-translation "โทโยมิ วาทารุ"**: Add new persona.
  - `--name`: Must be Japanese or Thai (required)
  - `--gender`: Optional gender (optional)
  - `--description`: Must be Thai (required)
  - `--base_style`: Must be Thai (required)
  - `--negative_constraints`: Must be Thai (required)
  - `--example`: Must be Thai; can specify multiple (required for new entries)
  - `--alias`: Can specify multiple; must include at least one Thai translation and at most one Thai translation (required)
  - `--invalid-translation`: Can specify multiple; strings that should not be used as translations (optional)
  - `--overwrite`: Optional flag to overwrite existing entry (optional). **⚠️ Caution**: Overwriting may cause inconsistencies with previous chapter translations. A confirmation prompt (Y/N) will be displayed.

- **bun database.ts personas update --name "豊海　航" --gender "ชาย" --description "คำอธิบายใหม่" --base_style "สไตล์ใหม่" --negative_constraints "ข้อจำกัดใหม่" --example "ตัวอย่างเพิ่มเติม" --alias "NewAlias" --invalid-translation "InvalidTranslation"**: Update existing persona.
  - `--name`: Must be Japanese or Thai (required)
  - `--gender`: Optional gender (optional)
  - `--description`: Must be Thai (required)
  - `--base_style`: Must be Thai; updates if provided (optional)
  - `--negative_constraints`: Must be Thai; updates if provided (optional)
  - `--example`: Must be Thai; can specify multiple, will be merged with existing examples (optional)
  - `--alias`: Can specify multiple; **only NON-THAI aliases allowed**, will be merged with existing aliases (optional)
  - `--invalid-translation`: Can specify multiple; will be merged with existing invalid translations (optional)

### Search & Save

- **bun database.ts search "query"**: Search both terminology and personas simultaneously. Returns array of matching entries. The query can contain multiple terms separated by spaces (e.g., `bun database.ts search "A B"`), which will search for each term separately (each term is searched individually). Search includes exact matches and fuzzy matches using Fuse.js. Searches in name, alias, and invalid_translation fields.

- **bun database.ts save [filename]**: Saves current data to `novel_data.json` or the specified filename.
