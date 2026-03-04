# Novel Translator

A tool for processing and translating novels from EPUB/HTML formats, with database management for consistent terminology and character personas.

## Features

- Extract text from EPUB HTML files
- Database for storing terminology and personas
- Agents for extracting data, translating, consistency checking, editing, and purifying mixed language files
- Progress tracking for incremental processing

## Installation

To install dependencies:

```bash
bun install
```

## Usage

1. Place your novel EPUB files in the `books/` directory.

2. Generate lists of files to process:

```bash
bun run extract-non-thai  # For files without English text (untranslated)
bun run extract-thai      # For files with English text (translated)
bun run validate_japanese # For files with mixed Japanese and English
```

3. Use the database CLI for managing terminology and personas:

```bash
bun run database
```

See [database.readme.md](database.readme.md) for detailed CLI commands.

4. Follow the agent guides for processing:
   - [Extractor Agent](agents/01_extractor_agent.md)
   - [Translator Agent](agents/02_translator_agent.md)
   - [Consistency Agent](agents/03_consistency_agent.md)
   - [Editor Agent](agents/04_editor_agent.md)
   - [Japanese Purifier Agent](agents/05_japanese_purifier_agent.md)

## Scripts

- `bun run extract-non-thai`: Output the list of untranslated files (no English text)
- `bun run extract-thai`: Output the list of translated files (with English text)
- `bun run validate_japanese`: Output files with mixed Japanese and English text
- `bun run database`: Run database CLI
- `bun run typecheck`: Type check with TypeScript
- `bun run format`: Format code with Prettier

This project was created using `bun init` in bun v1.3.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.