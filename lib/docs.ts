export interface DocEntry {
  id: string;
  title: string;
  description: string;
  syntax: string;
  notes?: string[];
}

export interface DocCategory {
  title: string;
  entries: DocEntry[];
}

export const docCategories: DocCategory[] = [
  {
    title: "Text and structure",
    entries: [
      {
        id: "headings",
        title: "Headings",
        description: "Six levels of headings. Requires a space after the hash marks.",
        syntax: `# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6`,
      },
      {
        id: "paragraph",
        title: "Paragraph",
        description: "A plain line of text becomes a paragraph.",
        syntax: "Any line of plain text",
      },
      {
        id: "bold",
        title: "Bold",
        description: "Inline bold text inside a paragraph.",
        syntax: "**bold text**",
      },
      {
        id: "italic",
        title: "Italic",
        description: "Inline italic text. Use a single asterisk, not double.",
        syntax: "*italic text*",
      },
      {
        id: "strikethrough",
        title: "Strikethrough",
        description: "Inline strikethrough text.",
        syntax: "~~struck text~~",
      },
      {
        id: "inline-code",
        title: "Inline code",
        description: "Inline monospace code span.",
        syntax: "`code`",
      },
      {
        id: "hr",
        title: "Horizontal rule",
        description: "A dashed rule. Only works when *** is the entire line — not for password fields.",
        syntax: "***",
      },
    ],
  },
  {
    title: "Inputs",
    entries: [
      {
        id: "text-input",
        title: "Text input",
        description: "Single-line text field. Underscores are required.",
        syntax: "___",
      },
      {
        id: "email-input",
        title: "Email input",
        description: "Email field. More @ symbols are allowed but ___ is required.",
        syntax: "@@@___",
        notes: ["`@@@` alone is plain text, not an input."],
      },
      {
        id: "password-input",
        title: "Password input",
        description: "Password field.",
        syntax: "***___",
        notes: ["`***` alone on a line is a horizontal rule, not a password field."],
      },
      {
        id: "number-input",
        title: "Number input",
        description: "Numeric field.",
        syntax: "#___",
      },
      {
        id: "date-input",
        title: "Date input",
        description: "Date field placeholder.",
        syntax: "__-__-____",
      },
      {
        id: "search-input",
        title: "Search input",
        description: "Search field.",
        syntax: "?___",
      },
      {
        id: "file-input",
        title: "File upload",
        description: "File picker field.",
        syntax: "^___",
      },
      {
        id: "textarea",
        title: "Textarea",
        description: "Multi-line text area. Each [___] line adds one row.",
        syntax: "[___]\n[___]\n[___]",
      },
    ],
  },
  {
    title: "Buttons and links",
    entries: [
      {
        id: "button",
        title: "Button",
        description: "Default button. Avoid ] in normal button labels.",
        syntax: "[Save]",
      },
      {
        id: "button-primary",
        title: "Primary button",
        description: "Primary / submit style button.",
        syntax: "[>Submit<]",
      },
      {
        id: "button-secondary",
        title: "Secondary button",
        description: "Secondary / reset style button.",
        syntax: "[!Reset!]",
      },
      {
        id: "nav",
        title: "Navigation bar",
        description: "Horizontal nav list. Space after the opening [ of the outer wrapper. Hrefs are parsed but preview links are inert.",
        syntax: "[ [Dashboard](/dash) [Reports](/reports) [Settings](/settings) ]",
      },
      {
        id: "breadcrumb",
        title: "Breadcrumb",
        description: "Path breadcrumb. Last segment is shown as the active page.",
        syntax: "[/Home/Products/Detail]",
      },
      {
        id: "pager",
        title: "Pagination",
        description: "Page number pager with prev/next arrows.",
        syntax: "[1,2,3,4]",
      },
    ],
  },
  {
    title: "Lists and choices",
    entries: [
      {
        id: "checkbox",
        title: "Checkbox group",
        description: "Checkbox list. Space after the marker is required.",
        syntax: "[x] Checked item\n[] Unchecked item",
      },
      {
        id: "radio",
        title: "Radio group",
        description: "Radio button list. Space after the marker is required.",
        syntax: "(x) Selected radio\n() Unselected radio",
      },
      {
        id: "dropdown",
        title: "Dropdown",
        description: "Select menu. One option per line. A hyphen in the label marks the option disabled.",
        syntax: "<[Choose one]>\n<[Option A]>\n<[Option B -disabled]>",
      },
      {
        id: "bullet-list",
        title: "Bullet list",
        description: "Unordered list. One item per line.",
        syntax: "- First item\n- Second item\n- Third item",
      },
    ],
  },
  {
    title: "Data display",
    entries: [
      {
        id: "table",
        title: "Table",
        description: "Pipe-delimited table rows. Leading * in a cell marks a header cell.",
        syntax: "|*Header|*Header|\n|Cell|Cell|\n|Cell|Cell|",
      },
      {
        id: "progress",
        title: "Progress bar",
        description: "Horizontal progress indicator with percentage.",
        syntax: "% 68 %",
        notes: ["Spaces around the number are optional: `%68%`"],
      },
      {
        id: "slider",
        title: "Slider",
        description: "Range slider at a fixed value.",
        syntax: "~ 50 ~",
        notes: ["Spaces around the number are optional: `~50~`"],
      },
      {
        id: "loading",
        title: "Loading",
        description: "Wireframe placeholder for a spinner or loading state.",
        syntax: "( ... )",
        notes: ["Also accepts `(...)`, `( … )`, and flexible spacing."],
      },
      {
        id: "chart",
        title: "Chart placeholder",
        description: "Placeholder box for a chart or graph.",
        syntax: "[[Weekly sign-ins]]",
      },
      {
        id: "badge",
        title: "Badge",
        description: "Small label chip. Works standalone or inline in a text line.",
        syntax: "{New}\n\nStatus {Pending review}",
      },
      {
        id: "tabs",
        title: "Tabs",
        description: "Tab bar. Must contain | or it parses as a button.",
        syntax: "[ Home | Settings | Billing ]",
      },
    ],
  },
  {
    title: "Layout blocks",
    entries: [
      {
        id: "card",
        title: "Card",
        description: "Bordered card with title and body. Body cannot start with ---.",
        syntax: "---Card title---\nBody content\n___\n[Action]\n---",
        notes: [
          "Closing --- is optional when the next line is another block (e.g. ---- column divider or ---Next card---).",
        ],
      },
      {
        id: "modal",
        title: "Modal",
        description: "Dialog box with optional footer buttons before the closing ===.",
        syntax: "===Dialog title===\nBody lines\n===[>Confirm<][Cancel]===",
      },
      {
        id: "form",
        title: "Form fieldset",
        description: "Grouped form section with legend.",
        syntax: "!!!Section legend!!!\n[x] Option\n[>Save<]\n!!!",
      },
      {
        id: "two-column",
        title: "Two-column layout",
        description:
          "Side-by-side columns. Use ::: markers with ---- (four dashes) between columns. Cards can sit in either column; a closing --- is optional before the ---- divider.",
        syntax:
          ":::\n---Left card---\nContent\n----\n---Right card---\nMore content\n:::",
      },
    ],
  },
  {
    title: "Media",
    entries: [
      {
        id: "image",
        title: "Image",
        description: "Standalone or inline image. Use # for wireframe placeholders.",
        syntax: "![Alt text](#)\n![Photo](https://example.com/img.png)",
      },
      {
        id: "image-group",
        title: "Image group",
        description: "Fixed-height row of equal-width image columns.",
        syntax: "{\n![One](#)\n![Two](#)\n![Three](#)\n}",
      },
    ],
  },
  {
    title: "Code",
    entries: [
      {
        id: "code-block",
        title: "Code block",
        description: "Fenced multi-line code block with optional language tag.",
        syntax: "```javascript\nconst x = 1;\nconsole.log(x);\n```",
      },
    ],
  },
  {
    title: "Preview only",
    entries: [
      {
        id: "themes",
        title: "Themes",
        description: "Not markup — configured in the sandbox UI. CSS variables applied to the preview.",
        syntax: "bg, surface, text, muted, border, accent, accentText, inputBg, codeBg, shadow",
      },
    ],
  },
];

export function slugifyCategory(title: string): string {
  return title.toLowerCase().replace(/\s+/g, "-");
}
