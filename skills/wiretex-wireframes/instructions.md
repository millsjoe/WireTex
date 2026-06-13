# WireTex wireframe generation

Generate **valid WireTex markup** that parses with `lib/wiretex/grammar.pegjs` and renders via `lib/wiretex/renderer.ts`.

Use this guide when the user asks for wireframes, WireTex markup, UI sketches, low-fidelity mockups, or screen layouts in this language.

## Workflow

1. **Clarify the screen** (only if the prompt is ambiguous): page purpose, primary actions, key sections.
2. **Plan structure**: heading → nav/breadcrumb → cards/forms → tables/modals as needed.
3. **Write markup** using the syntax below. Prefer realistic copy, not lorem ipsum.
4. **Validate** when you have shell access to this repository:
   ```bash
   npm run generate-parser
   npx tsx -e "import { parseWireTex } from './lib/wiretex/parse.ts'; parseWireTex(\`...\`); console.log('OK');"
   ```
5. **Deliver** the markup in a fenced code block. If editing the app, update `lib/site/sample.ts` or the user's target file.

## Output rules

- One construct per line unless combining inline buttons/images in a text line.
- Use `#` placeholders for wireframe images: `![Profile photo](#)`.
- Label fields with a text line above the input, not inline in the input token.
- Keep screens cohesive — don't showcase every syntax element unless asked.
- Use cards (`---Title---`) to group related content; modals for confirmations/destructive actions.

## Critical pitfalls

| Mistake | Fix |
|---------|-----|
| `@@@` or `***` alone | Use `@@@___` (email), `***___` (password) |
| `***` on its own line | Horizontal rule, not password field |
| `[Upload]` inside nav | Nav uses `[ [Link](/path) ]`; buttons use `[Label]` on their own line |
| Dropdown as `[Option]` | Use `<[Option]>` one item per line |
| Table without pipes | Each row: `\|cell\|cell\|`; prefix with `*` for headers: `\|*Name\|*Email\|` |
| Modal without footer buttons | Close with `===[>OK<][Cancel]===` |
| Two-column divider as `---` | Use `----` (four dashes) between columns; cards close with `---` (three dashes) |

## Syntax quick reference

### Structure
```
# Page title
[/Section/Subsection]
[ [Home](/) [Settings](/settings) ]
```

### Form in a card
```
---Sign in---
Email
@@@___
Password
***___
[>Log in<]
---
```

### Form fieldset with choices
```
!!!Preferences!!!
[x] Email updates
[] SMS alerts
(x) Real-time
() Daily
[>Save<] [!Reset!]
!!!
```

### Table + pager
```
|*Date|*Action|
|Today|Login|
|Yesterday|Update|

[1,2,3]
```

### Modal
```
===Delete item?===
This action cannot be undone.
===[>Delete<][Cancel]===
```

### Image group (equal columns)
```
{
![A](#)
![B](#)
![C](#)
![D](#)
}
```

### Other
- Textarea: stack `[___]` lines (one row each)
- Progress: `% 68 %`
- Code block: fenced with triple backticks
- Inline: `**bold**`, `*italic*`, `` `code` ``, `~~strike~~`, `{Badge}`
- HR: `***` on its own line
- Bullet list: `- item` per line
- Tabs: `[ Home | Settings ]` (must contain `|`)
- Slider: `~ 50 ~`
- Loading: `( ... )`
- Chart: `[[Title]]`
- Two columns: `:::` … `----` … `:::` (four dashes between columns)
- Search / file: `?___` / `^___`

## Prompt → markup mapping

| User asks for… | WireTex approach |
|----------------|------------------|
| Login / sign up | Card + email/password inputs + submit button |
| Settings page | Heading, breadcrumb, multiple cards, form fieldsets |
| Dashboard | Nav, progress/stats line, table or cards |
| Checkout | Card with inputs, table for line items, primary CTA |
| Confirm delete | Modal with warning text + primary/secondary buttons |
| Profile | Image placeholder, text inputs, textarea bio |
| Gallery / logos | Image group `{ ... }` |
| Wizard / steps | Breadcrumb or headings + one card per step |

## Example

**Prompt:** "Mobile-friendly password reset screen"

**Output:**
```
# Reset password

[/Account/Reset]

Enter your email and we'll send a reset link.

---Reset---
Work email
@@@___
[>Send link<]
[Back to login]
---

===Link sent===
Check your inbox for further instructions.
===[OK]===
```

## More detail

Full syntax tables and edge cases: [syntax.md](syntax.md)

Source of truth: `lib/wiretex/grammar.pegjs`, `lib/wiretex/renderer.ts`, `lib/site/sample.ts`, `lib/site/docs.ts`.
