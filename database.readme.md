# Database CLI Documentation

## Usage Note

Keys are Japanese words. Use the `search` command to check for existing entries and the `add` command to add new entries. Data is stored in `novel_data.json`.

## CLI Details

### Terminology Commands

- **bun database.ts terminology add --word "ジラソーレ" --description "Adventurer party name, A-rank party of Alessia's group" --alias "Girasole" --alias "Sunflower" --invalid-translation "Jirasole" --invalid-translation "wrong_translation"**: Add new terminology.
  - `--word`: Must be Japanese (required)
  - `--description`: Must be English (required)
  - `--alias`: Can specify multiple; must include at least one English translation and at most one English translation (required)
  - `--invalid-translation`: Can specify multiple; strings that should not be used as translations (optional)
  - `--overwrite`: Optional flag to overwrite existing entry (optional). **⚠️ Caution**: Overwriting may cause inconsistencies with previous chapter translations. A confirmation prompt (Y/N) will be displayed.

- **bun database.ts terminology update --word "ジラソーレ" --description "New description" --alias "NewAlias"**: Update existing terminology.
  - `--word`: Must be Japanese (required)
  - `--description`: Must be English; updates if provided (optional)
  - `--alias`: Can specify multiple; **only NON-ENGLISH aliases allowed**, will be merged with existing aliases (optional)

### Personas Commands

- **bun database.ts personas add --name "豊海　航" --gender "male" --description "Main character, a new adventurer" --base_style "Speaks like a modern young person, polite but not overly formal, somewhat reserved" --negative_constraints "Do not use archaic or overly formal language" --example "Hello, my name is Wataru." --alias "Toyoumi Wataru" --alias "Wataru Toyoumi" --invalid-translation "Toyomi Wataru" --invalid-translation "Wataru Toyomi"**: Add new persona.
  - `--name`: Must be Japanese (required)
  - `--gender`: Optional gender (optional)
  - `--description`: Must be English (required)
  - `--base_style`: Must be English (required)
  - `--negative_constraints`: Must be English (required)
  - `--example`: Must be English; can specify multiple (required for new entries)
  - `--alias`: Can specify multiple; must include at least one English translation and at most one English translation (required)
  - `--invalid-translation`: Can specify multiple; strings that should not be used as translations (optional)
  - `--overwrite`: Optional flag to overwrite existing entry (optional). **⚠️ Caution**: Overwriting may cause inconsistencies with previous chapter translations. A confirmation prompt (Y/N) will be displayed.

- **bun database.ts personas update --name "豊海　航" --gender "male" --description "New description" --base_style "New style" --negative_constraints "New constraints" --example "Additional example" --alias "NewAlias" --invalid-translation "InvalidTranslation"**: Update existing persona.
  - `--name`: Must be Japanese (required)
  - `--gender`: Optional gender (optional)
  - `--description`: Must be English (required)
  - `--base_style`: Must be English; updates if provided (optional)
  - `--negative_constraints`: Must be English; updates if provided (optional)
  - `--example`: Must be English; can specify multiple, will be merged with existing examples (optional)
  - `--alias`: Can specify multiple; **only NON-ENGLISH aliases allowed**, will be merged with existing aliases (optional)
  - `--invalid-translation`: Can specify multiple; will be merged with existing invalid translations (optional)

### Search & Save

- **bun database.ts search "query"**: Search both terminology and personas simultaneously. Returns array of matching entries. The query can contain multiple terms separated by spaces (e.g., `bun database.ts search "A B"`), which will search for each term separately (each term is searched individually). Search includes exact matches and fuzzy matches using Fuse.js. Searches in name, alias, and invalid_translation fields.

- **bun database.ts save [filename]**: Saves current data to `novel_data.json` or the specified filename.
