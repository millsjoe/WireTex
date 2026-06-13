# Claude Code — WireTex

Follow [AGENTS.md](AGENTS.md) for project context.

When generating wireframes or WireTex markup, read and apply:

- `skills/wiretex-wireframes/instructions.md`
- `skills/wiretex-wireframes/syntax.md` (full syntax, when needed)

Validate with:

```bash
npm run generate-parser
npx tsx -e "import { parseWireTex } from './lib/wiretex/parse.ts'; parseWireTex(\`...\`); console.log('OK');"
```
