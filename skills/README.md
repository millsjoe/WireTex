# Agent skills

Tool-agnostic instructions for AI coding assistants working in this repository.

## WireTex wireframes

Generate WireTex markup from natural-language UI prompts.

| File | Purpose |
|------|---------|
| [wiretex-wireframes/instructions.md](wiretex-wireframes/instructions.md) | Workflow, pitfalls, quick reference, examples |
| [wiretex-wireframes/syntax.md](wiretex-wireframes/syntax.md) | Full syntax reference |

**When to use:** wireframes, WireTex markup, UI sketches, low-fidelity mockups, screen layouts.

## How to install by tool

### Any agent

Read [AGENTS.md](../AGENTS.md) at the repo root. It points here for wireframe tasks.

### Cursor

This repo includes `.cursor/skills/wiretex-wireframes/SKILL.md`, which loads the instructions above automatically in Cursor.

To use in other projects, copy `skills/wiretex-wireframes/` and add a Cursor skill that references `instructions.md`.

### GitHub Copilot (VS Code / Visual Studio)

Copilot loads [.github/copilot-instructions.md](../.github/copilot-instructions.md) from the workspace.

### Claude Code

Claude Code reads [CLAUDE.md](../CLAUDE.md) and [AGENTS.md](../AGENTS.md) from the project root.

### Other assistants

Add `skills/wiretex-wireframes/instructions.md` to your assistant's context, rules, or system prompt. Mention `syntax.md` for edge cases.

Examples:
- **Windsurf / Codeium rules:** `@skills/wiretex-wireframes/instructions.md`
- **Custom prompt:** "Follow `skills/wiretex-wireframes/instructions.md` when generating wireframes."

## Validating markup

From the repo root:

```bash
npm run generate-parser
npx tsx -e "import { parseWireTex } from './lib/wiretex/parse.ts'; parseWireTex(\`...\`); console.log('OK');"
```

Human-readable reference: `/docs` when the dev server is running.
