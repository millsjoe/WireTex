# GitHub Copilot — WireTex

Follow [AGENTS.md](../AGENTS.md) for project context.

## Wireframe tasks

When the user asks for wireframes, WireTex markup, UI sketches, or screen layouts:

1. Read `skills/wiretex-wireframes/instructions.md`
2. Consult `skills/wiretex-wireframes/syntax.md` for edge cases
3. Validate markup with `parseWireTex` from `lib/wiretex/parse.ts` when possible

Grammar source of truth: `lib/wiretex/grammar.pegjs`. Do not invent syntax.

## Quick pitfalls

- Email/password inputs need underscores: `@@@___`, `***___`
- `***` alone on a line is a horizontal rule, not a password field
- Two-column layout: `:::` … `----` … `:::` (four dashes between columns)
- Cards close with `---` (three dashes)
