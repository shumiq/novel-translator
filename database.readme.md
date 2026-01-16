# Database CLI Documentation

## Usage Note

Keys are Japanese words. Use the `search` command to check for existing entries and the `add` command to add new entries. Data is stored in `novel_data.json`.

## CLI Details

### Terminology Commands

- **bun database.ts terminology add --word "ジラソーレ" --description "ชื่อปาร์ตี้นักผจญภัยแรงค์ A ของพวกอเลเซีย" --alias "Girasole" --alias "จิราโซเล่"**: Add new terminology.
  - `--word`: Must be Japanese (required)
  - `--description`: Must be Thai (required)
  - `--alias`: Can specify multiple; must include at least one Thai translation and at most one Thai translation (required)

- **bun database.ts terminology update --word "ジラソーレ" --description "คำอธิบายใหม่" --alias "NewAlias"**: Update existing terminology.
  - `--word`: Must be Japanese (required)
  - `--description`: Must be Thai; updates if provided (optional)
  - `--alias`: Can specify multiple; **only NON-THAI aliases allowed**, will be merged with existing aliases (optional)

### Personas Commands

- **bun database.ts personas add --name "豊海　航" --gender "ชาย" --description "ตัวละครหลัก นักผจญภัยรุ่นใหม่" --base_style "พูดจาแบบคนรุ่นใหม่ สุภาพแต่ไม่ทางการมาก ขี้เกรงใจ" --negative_constraints "อย่าใช้คำราชาศัพท์หรือลิเก" --example "สวัสดีครับ ผมชื่อวาตารุครับ" --alias "Toyoumi Wataru" --alias "โทโยมิ วาตารุ"**: Add new persona.
  - `--name`: Must be Japanese (required)
  - `--gender`: Optional gender (optional)
  - `--description`: Must be Thai (required)
  - `--base_style`: Must be Thai (required)
  - `--negative_constraints`: Must be Thai (required)
  - `--example`: Must be Thai; can specify multiple (required for new entries)
  - `--alias`: Can specify multiple; must include at least one Thai translation and at most one Thai translation (required)

- **bun database.ts personas update --name "豊海　航" --gender "ชาย" --description "คำอธิบายใหม่" --base_style "สไตล์ใหม่" --negative_constraints "ข้อจำกัดใหม่" --example "ตัวอย่างเพิ่มเติม" --alias "NewAlias"**: Update existing persona.
  - `--name`: Must be Japanese (required)
  - `--gender`: Optional gender (optional)
  - `--description`: Must be Thai (required)
  - `--base_style`: Must be Thai; updates if provided (optional)
  - `--negative_constraints`: Must be Thai; updates if provided (optional)
  - `--example`: Must be Thai; can specify multiple, will be merged with existing examples (optional)
  - `--alias`: Can specify multiple; **only NON-THAI aliases allowed**, will be merged with existing aliases (optional)

### Search & Save

- **bun database.ts search "query"**: Search both terminology and personas simultaneously. Returns array of matching entries. The query can contain multiple terms separated by spaces (e.g., `bun database.ts search "A B"`), which will match entries that match ANY of the terms (OR logic).

- **bun database.ts save [filename]**: Saves current data to the specified file or `novel_data.json` if no filename provided.
