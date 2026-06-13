# AGENTS.md

Instructions for AI coding assistants in the **WireTex** repository.

## Project

WireTex is a markdown-like language for UI wireframes. Pipeline:

`lib/wiretex/grammar.pegjs` → Peggy parser → `lib/wiretex/parse.ts` → `lib/wiretex/renderer.ts` → HTML preview

Key paths:

| Path | Purpose |
|------|---------|
| `lib/wiretex/` | Grammar, parser, renderer — core language |
| `lib/site/` | Docs data, themes, sample markup |
| `lib/generator/` | AI system prompt and `/chat` generation |
| `app/sandbox/` | Live editor |
| `app/chat/` | AI wireframe generator |

Run locally: `npm install && npm run dev` → http://localhost:3000

## Wireframe generation

When the user asks for wireframes, WireTex markup, UI sketches, mockups, or screen layouts:

1. Read **`skills/wiretex-wireframes/instructions.md`**
2. Use **`skills/wiretex-wireframes/syntax.md`** for full syntax detail when needed
3. Validate markup with the parser when you can run shell commands (see `skills/README.md`)

Do not invent syntax — follow the grammar in `lib/wiretex/grammar.pegjs`.

## Conventions

- British English in user-facing copy (`customise`, `colour`, etc.) where the project already uses it
- Keep changes focused; match existing code style
- Parser is regenerated from grammar on `npm run dev` and `npm run build`

## More

- Human docs: `/docs` route
- Skill install notes for other tools: `skills/README.md`
