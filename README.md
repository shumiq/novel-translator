# Novel Translator

A tool for processing and translating novels from EPUB/HTML formats, with database management for consistent terminology and character personas.

## Features

- Extract text from EPUB HTML files
- Database for storing terminology and personas
- Agents for translating, consistency checking, editing, and purifying Japanese text
- Progress tracking for incremental processing
- Automated runner for end-to-end workflow

## Installation

To install dependencies:

```bash
bun install
```

## Project Structure

```
novel-translator/
├── agents/                  # Agent guides and protocols
│   ├── 00_shared_protocols.md
│   ├── 01_translator_agent.md
│   ├── 02_consistency_agent.md
│   ├── 03_editor_agent.md
│   └── 04_japanese_purifier_agent.md
├── books/                   # EPUB/HTML files to process
├── database.readme.md       # Database CLI documentation
├── package.json
├── README.md
├── start.bat                # Batch file to run the continuous runner
├── runner.ts                # Main automation script
├── database.ts              # Database CLI implementation
├── extract-english.ts       # Extract files with English text
├── extract-non-english.ts   # Extract files without English text
├── sanitize.ts              # Sanitize HTML files
├── stage_parity_translated.ts # Git parity check
├── add_progress.ts          # Progress tracking
└── list_characters.ts       # List characters from DB
```

## Agents

1.  **Translate Agent** (`01_translator_agent.md`): Translates raw Japanese/non-English content into English, discovers new terms/personas, and ensures structural integrity.
2.  **Consistency Agent** (`02_consistency_agent.md`): Ensures strict continuity by enforcing terminology, gender pronouns, and persona constraints from the database.
3.  **Editor Agent** (`03_editor_agent.md`): Refines translated text for natural English prose, removes artifacts, and optimizes dialogue flow.
4.  **Japanese Purifier Agent** (`04_japanese_purifier_agent.md`): Hunts down and eliminates any remaining Japanese text.

## Database CLI

Manage terminology and personas using `bun database.ts`.

**Common Commands:**
```bash
# Search for terms or personas
bun database.ts search "query"

# Add new terminology
bun database.ts terminology add --word "ジラソーレ" --description "Adventurer party name..." --alias "Girasole" --alias "Sunflower"

# Add new persona
bun database.ts personas add --name "豊海　航" --gender "male" --description "Main character..." --base_style "Speaks like a modern young person..." --negative_constraints "Do not use archaic language..." --example "Hello, my name is Wataru." --alias "Toyoumi Wataru" --alias "Wataru Toyoumi"
```

See [database.readme.md](database.readme.md) for detailed CLI commands.

## Usage Workflow

1.  Place your novel EPUB files in the `books/` directory.
2.  **Option A (Automated Runner):** Run `bun start` or `start.bat`. This script automatically:
    *   Checks for files without English text to translate.
    *   Runs the Translate Agent.
    *   Checks for English files needing consistency check.
    *   Runs the Consistency Agent.
    *   Checks for English files needing editing.
    *   Runs the Editor Agent.
    *   Sanitizes and stages files with parity checks.
3.  **Option B (Manual Steps):**
    *   **Extract Files:**
        *   `bun run extract-non-english`: List files without English text.
        *   `bun run extract-english`: List files with English text.
    *   **Process Files:** Run specific agents based on the agent guides.
    *   **Manage Database:** Use `bun run database` for CLI access.

## Scripts

- `bun run start`: Runs `start.bat` (continuous runner).
- `bun run database`: Run database CLI.
- `bun run extract-non-english`: Output list of files needing translation.
- `bun run extract-english`: Output list of translated files.
- `bun run typecheck`: Type check with TypeScript.
- `bun run format`: Format code with Prettier.

This project was created using `bun init` in bun v1.3.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
