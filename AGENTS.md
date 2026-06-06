# AGENTS.md

Instructions for AI coding assistants in the **WireTex** repository.

## Project

WireTex is a markdown-like language for UI wireframes. Pipeline:

`lib/grammar.pegjs` → Peggy parser → `lib/parse.ts` → `lib/renderer.ts` → HTML preview

Key paths:

| Path | Purpose |
|------|---------|
| `lib/grammar.pegjs` | Source grammar — edit to add syntax |
| `lib/renderer.ts` | AST → HTML |
| `lib/sample.ts` | Default sandbox example |
| `lib/docs.ts` | Component reference for `/docs` |
| `app/sandbox/` | Live editor |

Run locally: `npm install && npm run dev` → http://localhost:3000

## Wireframe generation

When the user asks for wireframes, WireTex markup, UI sketches, mockups, or screen layouts:

1. Read **`skills/wiretex-wireframes/instructions.md`**
2. Use **`skills/wiretex-wireframes/syntax.md`** for full syntax detail when needed
3. Validate markup with the parser when you can run shell commands (see `skills/README.md`)

Do not invent syntax — follow the grammar in `lib/grammar.pegjs`.

## Conventions

- British English in user-facing copy (`customise`, `colour`, etc.) where the project already uses it
- Keep changes focused; match existing code style
- Parser is regenerated from grammar on `npm run dev` and `npm run build`

## More

- Human docs: `/docs` route
- Skill install notes for other tools: `skills/README.md`
