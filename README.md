# Novel Translator

A tool for processing and translating novels from EPUB/HTML formats, with database management for consistent terminology and character personas.

## Features

- Extract text from EPUB HTML files
- Database for storing terminology and personas
- Agents for extracting data, translating, grooming content, refining particles, and fixing mixed language files
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
bun run extract-non-thai  # For files without Thai text
bun run extract-thai      # For files with Thai text
bun run validate_japanese # For files with mixed Japanese and Thai
```

3. Use the database CLI for managing terminology and personas:

```bash
bun run database
```

See [database.readme.md](database.readme.md) for detailed CLI commands.

4. Follow the agent guides for processing:
   - [Extracting Data Agent](extracting_data_agent.md)
   - [Translate Agent](translate_agent.md)
   - [Grooming Agent](grooming_agent.md)
   - [Particle Refine Agent](particle_refine.md)
   - [JPTH Refine Agent](jpth-refine.md)

## Scripts

- `bun run extract-non-thai`: Output the list of non-Thai files to be translated
- `bun run extract-thai`: Output the list of Thai files for grooming
- `bun run validate_japanese`: Output files with mixed Japanese and Thai text
- `bun run database`: Run database CLI
- `bun run typecheck`: Type check with TypeScript
- `bun run format`: Format code with Prettier

This project was created using `bun init` in bun v1.3.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.