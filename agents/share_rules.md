# Shared Rules of Engagement

## 🛠 Standard Operational Procedures

### Tool Usage & Environment
- **Internal Tools First**: Use internal tools for reading, writing, and editing files instead of OS commands (e.g., do not use `cat`, `type`, `grep`, or `echo >` for file operations).
- **Windows Command Separator**: When running multiple commands in a single line on Windows, use `;` as the separator instead of `&&`.

### Pre-Check & Instruction Refresh
- **Read this entire instruction set aloud** (including shared rules) before starting any task to ensure zero steps are skipped.

### Database Synchronization
- **Immediate DB Updates**: Never wait until the end of a file to update the database. Sync every term or persona as soon as it is identified.
- **Database Filter**: **DO NOT** add generic words (e.g., "the", "is", "and"). Only add proper nouns, technical terms, and unique expressions.
- **Key Consistency**: Always use the **Japanese** word as the primary key and the **Thai** translation in the `alias` field.
- **Conflict Handling**: If an update throws a consistency error (duplicate Thai alias), use `--overwrite` only if you are certain the new data is more accurate.

### Content & Structural Integrity
- **Structural Integrity**: Do not alter HTML tags. Only modify the text content within them.
- **No Mixing**: The final output should not contain original language characters (Japanese/English) in the story text, unless they are intentional.

### Process Completion
- **Context Management**: After processing each file, forget its content (clear local context) before moving to the next file to reduce AI context usage.
- **Recursive Completion**: After completing a file or batch, return to Phase 1 to verify if new files have appeared or remain in the queue.

---

## ⚠️ Strict Rules for All Agents
- **Tools allowance**: Only allow to use internal read/writ/replace tools and `bun` command.
- **Follow Instructions Strictly**: Never deviate from the given instructions.  
- **No Code Generation**: Execute the process steps only. Do not write or suggest code scripts unless explicitly requested.
- **CLI Reference**: See [database.readme.md](../database.readme.md) for command syntax.
