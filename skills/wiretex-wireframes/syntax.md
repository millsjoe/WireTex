# WireTex syntax reference

Authoritative grammar: `lib/grammar.pegjs`.

## Headings

```
# H1
## H2
### H3
#### H4
##### H5
###### H6
```

Requires a space after hashes.

## Text lines

A line of plain text and/or inline elements becomes a paragraph.

Inline elements (usable inside text lines):
- `**bold**`
- `*italic*` (single asterisk, not double)
- `~~strikethrough~~`
- `` `inline code` ``
- `![alt text](#)` image
- `[Button label]` button
- Inline inputs: `___`, `@@@___`, `***___`, `#___`, `__-__-____`, `?___`, `^___`

## Inputs (block-level)

Prefix + underscores. **Underscores are mandatory.**

| Markup | Kind |
|--------|------|
| `___` | text |
| `@___` / `@@___` / `@@@___` | email |
| `*___` / `**___` / `***___` | password |
| `#___` / `##___` / `###___` | number |
| `__-__-____` | date |

## Textarea

Each `[___]` line (optional extra `_` inside brackets) adds one row:

```
[___]
[___]
[___]
```

## Buttons

| Markup | Rendered as |
|--------|---------------|
| `[Label]` | Default button |
| `[>Label<]` | Primary / submit |
| `[!Label!]` | Secondary / reset |

Avoid `]` in normal button labels.

## Dropdown

One option per line. Items containing `-` render disabled.

```
<[Choose one]>
<[Option A]>
<[Option B -disabled]>
```

## Checkbox / radio groups

```
[x] Checked item
[] Unchecked item

(x) Selected radio
() Unselected radio
```

Space after marker is required (`[x] ` not `[x]`).

## Progress

```
% 68 %
%68%
```

## Slider

```
~ 50 ~
~50~
```

## Loading

Dots or ellipsis inside parentheses on their own line:

```
( ... )
(...)
( … )
```

Must come before radio options like `(x) Label` in the grammar.

## Bullet list

One item per line:

```
- First item
- Second item
```

## Badge

Standalone or inline in text:

```
{New}
Status {Pending review}
```

## Search and file upload

```
?___
^___
```

## Tabs

Must contain `|` (otherwise parses as a button):

```
[ Home | Settings | Billing ]
```

## Chart placeholder

```
[[Weekly sign-ins]]
```

## Two-column layout

Use `:::` markers with `----` (four dashes) between columns. Card blocks close with `---` (three dashes), so the extra dash avoids a parse conflict:

```
:::
Left column content
----
Right column content
:::
```

## Table

```
|*Header|*Header|
|Cell|Cell|
```

Leading `*` in a cell marks `<th>`.

## Navigation

```
[ [Dashboard](/dash) [Reports](/reports) ] 
```

Space after opening `[` of outer wrapper. Links optional; default `#`.

## Breadcrumb

```
[/Home/Products/Detail]
```

## Pager

```
[1,2,3,4]
```

## Card

```
---Card title---
Body content
___
[Action]
---
```

Body cannot start with `---` (that closes the card). A closing `---` line is optional when the next line starts another block (e.g. another card or a `----` column divider).

## Modal

```
===Dialog title===
Body lines
===[>Confirm<][Cancel]===
```

Optional footer buttons before closing `===`. Body cannot start with `===`.

## Form fieldset

```
!!!Section legend!!!
[x] Option
[>Save<]
!!!
```

## Image group

Fixed-height row; images share width equally.

```
{
![One](#)
![Two](#)
![Three](#)
}
```

## Code block

````
```javascript
const x = 1;
```
````

## Horizontal rule

```
***
```

Only when `***` is the entire line (plus newline). Do not use for password fields.

## Images

```
![Alt text](#)
![Photo](https://example.com/img.png)
```

Use `#` or empty-ish URLs for wireframe placeholders.

## Theme variables (preview only)

Not markup — set in editor UI. Variables include `text`, `cardBg`, `btnPrimaryBg`, `btnPrimaryText`, `btnSecondaryBg`, `btnSecondaryText`, plus `bg`, `surface`, `muted`, `border`, `accent`, `accentText`, `inputBg`, `codeBg`, `shadow`.
