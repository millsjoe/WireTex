<p align="center">
  <img src="public/wiretex.png" alt="WireTex" width="360" />
</p>

WireTex is a markdown-like language for sketching UI wireframes in plain text. Write compact markup on the left, preview styled wireframes on the right.

This repo contains the **grammar**, **HTML renderer**, and a **Next.js live editor**.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page, or go directly to the [sandbox](/sandbox) editor and [docs](/docs).

The parser is generated from `lib/grammar.pegjs` on every `dev` and `build`:

```bash
npm run generate-parser
```

## How it works

```
WireTex markup  →  lib/grammar.pegjs (Peggy)  →  AST  →  lib/renderer.ts  →  HTML  →  preview
```

1. **Author markup** in the editor (or any text file). Syntax is line-oriented, similar to markdown with UI-specific tokens.
2. **Parse** with Peggy. The grammar lives in `lib/grammar.pegjs`; the compiled parser is written to `lib/parser.generated.js` (gitignored, rebuilt automatically).
3. **Render** the AST to HTML in `lib/renderer.ts`. Output uses `utext-*` CSS classes and theme CSS variables (`--wt-bg`, `--wt-accent`, etc.).
4. **Preview** in the sandbox at `/sandbox`. The editor parses on every change and injects HTML into an isolated preview pane (imperative `innerHTML`, not React children, so app controls stay interactive).

### Project layout

| Path | Purpose |
|------|---------|
| `lib/grammar.pegjs` | Source grammar — edit this to add syntax |
| `lib/renderer.ts` | AST → HTML — swap for React, Tailwind, etc. |
| `lib/parse.ts` | Thin wrapper around generated parser |
| `lib/docs.ts` | Component reference data for `/docs` |
| `lib/themes.ts` | Built-in themes and CSS variable keys |
| `lib/sample.ts` | Default sandbox example |
| `app/` | Next.js routes: landing, sandbox, docs |
| `components/EditorApp.tsx` | Split editor + toolbar |
| `.cursor/skills/wiretex-wireframes/` | Cursor skill for generating markup from prompts |

## Editor features

- **Live preview** — left panel for markup, right panel for rendered wireframe
- **Themes** — Sketch, Blueprint, Dark, Paper; customise with hex values in the header
- **Device frames** — Web (~960px) and Mobile (~390px) preview containers
- **Parse errors** — shown below the editor when markup is invalid

## WireTex syntax (cheat sheet)

### Text and structure

| Syntax | Output |
|--------|--------|
| `# Title` | Heading (supports `#` … `######`) |
| Plain line | Paragraph |
| `**bold**` `*italic*` `~~strike~~` `` `code` `` | Inline formatting |
| `***` alone on a line | Horizontal rule |

### Inputs

| Syntax | Field type |
|--------|------------|
| `___` | Text |
| `@@@___` | Email |
| `***___` | Password |
| `#___` | Number |
| `__-__-____` | Date |
| `[___]` per line | Textarea (one row per line) |

**Important:** prefixes (`@`, `*`, `#`) set the field type; **`___` is required**. `@@@` alone is plain text; `***` alone is a horizontal rule.

### Buttons

| Syntax | Type |
|--------|------|
| `[Save]` | Button |
| `[>Submit<]` | Primary / submit |
| `[!Reset!]` | Secondary / reset |

### Blocks

| Syntax | Block |
|--------|-------|
| `---Title---` … `---` | Card |
| `===Title===` … `===[btn][btn]===` | Modal |
| `!!!Legend!!!` … `!!!` | Form fieldset |

### Lists and data

| Syntax | Output |
|--------|--------|
| `[x] Label` / `[] Label` | Checkbox group |
| `(x) Label` / `() Label` | Radio group |
| `<[Option]>` per line | Dropdown (`-` in text marks disabled) |
| `\|*A\|*B\|` / `\|a\|b\|` | Table (`*` prefix = header cell) |
| `% 65 %` | Progress bar |
| `~ 65 ~` | Slider |
| `( ... )` / `(...)` | Loading indicator |
| `- Item` | Bullet list (one per line) |
| `{Badge}` | Badge (inline or on its own line) |
| `?___` | Search field |
| `^___` | File upload |
| `[ Home \| Settings ]` | Tabs (must contain `\|`) |
| `[[Chart title]]` | Chart placeholder |
| `:::` … `----` … `:::` | Two-column layout |
| `[/Home/Settings]` | Breadcrumb |
| `[ [Home](/) [About](/about) ]` | Nav bar |

### Images

| Syntax | Output |
|--------|--------|
| `![Label](#)` | Placeholder image (use `#` for wireframes) |
| `![Label](https://…)` | Real image |
| `{` … `}` wrapping multiple `![…](…)` lines | Equal-width image group in a fixed-height row |

### Code

````markdown
```lang
line one
line two
```
````

## Themes

Built-in themes define CSS variables consumed by `.wiretex-content` in `app/globals.css`:

`bg`, `text`, `cardBg`, `btnPrimaryBg`, `btnPrimaryText`, `btnSecondaryBg`, `btnSecondaryText`, `surface`, `muted`, `border`, `accent`, `accentText`, `inputBg`, `codeBg`, `shadow`

Click **Customise theme** in the sandbox to edit hex values (and `rgba(...)` for shadow).

## Extending WireTex

1. Add rules to `lib/grammar.pegjs`
2. Run `npm run generate-parser`
3. Add node types and HTML output in `lib/renderer.ts`
4. Style new classes in `app/globals.css`
5. Add an entry to `lib/docs.ts` for the `/docs` page

To target a different output (React components, PDF, Figma plugin), replace or alternate `lib/renderer.ts` — the grammar and AST stay the same.

## Generating wireframes with Cursor

Use the project skill when you want markup from a natural-language prompt:

> Follow the **wiretex-wireframes** skill and create a wireframe for a checkout page.

Skill path: `.cursor/skills/wiretex-wireframes/SKILL.md`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Generate parser + start dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run generate-parser` | Compile `lib/grammar.pegjs` only |
