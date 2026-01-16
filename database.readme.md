# Database CLI Documentation

## Usage Note

Keys are now Japanese words. Use the `search` command to check for existing entries and the `add` command to add new entries. Use `update` to modify existing entries. Avoid using `list` for routine lookups, and reserve `import` for bulk data imports from JSON files.

## CLI Details

- **bun database.ts terminology list**: Lists all terminology entries.
- **bun database.ts terminology add --word "ジラソーレ" --description "ชื่อปาร์ตี้นักผจญภัยแรงค์ A ของพวกอเลเซีย" --alias "Girasole" --alias "จิราโซเล่"**: Add new terminology. Word must be Japanese, description must be Thai, alias must include at least one Thai translation.
- **bun database.ts terminology update --word "ジラソーレ" --description "ชื่อปาร์ตี้นักผจญภัยแรงค์ A ของพวกอเลเซีย" --alias "Girasole" [--overwrite]**: Update existing terminology. Use --overwrite to replace aliases instead of merging.

- **bun database.ts personas list**: Lists all persona entries.
- **bun database.ts personas add --name "豊海　航" --base_style "พูดจาแบบคนรุ่นใหม่ สุภาพแต่ไม่ทางการมาก ขี้เกรงใจ" --negative_constraints "อย่าใช้คำราชาศัพท์หรือลิเก" --example "สวัสดีครับ ผมชื่อวาตารุครับ" --alias "Toyoumi Wataru" --alias "โทโยมิ วาตารุ"**: Add new persona. Name must be Japanese, base_style, negative_constraints, example must be Thai, alias must include at least one Thai translation.
- **bun database.ts personas update --name "豊海　航" --base_style "..." --negative_constraints "..." --example "..." --alias "..." [--overwrite]**: Update existing persona. Use --overwrite to replace examples and aliases instead of merging.

- **bun database.ts search "query"**: Search both terminology and personas simultaneously. Returns object with `terminology` and `personas` arrays. Should use Japanese to search.

- **bun database.ts import "filename.json"**: Import terminology and personas from JSON file (format: `{"terminology":{...},"personas":{...}}`), merging data without replacing the whole database.
- **bun database.ts save [filename]**: Saves current data to the specified file or `novel_data.json` if no filename provided.
