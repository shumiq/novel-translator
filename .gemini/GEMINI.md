# Novel Translation Project - Technical Guidelines

## Project Overview
This project uses a specialized multi-agent workflow for high-quality translation. Each agent performs a distinct role based on its dedicated skill file in `.agents/skills/<skill>/SKILL.md`.

## Mandatory Global Protocols
### 🧠 Anti-Amnesia Protocol (CRITICAL)
- **Zero-Trust Memory:** Never trust your memory. Always search the database (`bun database.ts search`).
- **One File at a Time:** Process files sequentially.
- **Context Reset:** Mentally clear your context after each file. Treat every file as a fresh start.

### 🛠 Operational Standards
- **Internal Tools First:** Use `read`, `write`, `replace`. NEVER use OS shell commands (`cat`, `grep`, `sed`, `echo >`).
- **Structural Integrity:** NEVER alter, merge, or remove HTML tags.
- **Windows Commands:** Use `;` as the command separator instead of `&&`.
- **No Full Output:** NEVER output full file contents in chat. Use `write_file` or `replace` tools directly.

## Skill Reference
- **Extractor (`extractor`):** Discover terms/personas. Populate DB *before* translation.
- **Translator (`translator`):** Perform 1:1 translation. Extract terms on-the-fly.
- **Consistency (`consistency`):** Enforce strict continuity. Fix terminology, gender, and persona constraints.
- **Japanese Purifier (`japanese-purifier`):** Eliminate leftover Japanese characters.
- **Humanize (`humanize`):** Polish natural prose flow.

*Refer to the individual `SKILL.md` file for each agent for detailed operational workflows.*
