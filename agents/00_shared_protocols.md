# Shared Protocols & Rules of Engagement

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
- **CLI Reference:** See `database.readme.md` for command syntax.