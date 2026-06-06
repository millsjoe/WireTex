{{
  // Helpers available to all rules (module-level)
  function flat(arr) {
    return arr.flat(Infinity).filter(x => x != null);
  }

  function joinText(arr) {
    return flat(arr).join("");
  }
}}

// ---------------------------------------------------------------------------
// Top-level
// ---------------------------------------------------------------------------

Document
  = nodes:Node+ { return nodes.filter(n => n !== null); }

Node
  = Heading
  / Hr
  / TwoColumnBlock
  / CardBlock
  / ModalBlock
  / FormBlock
  / Table
  / CheckBoxGroup
  / Loading
  / RadioGroup
  / DropdownGroup
  / Navigation
  / Tabs
  / Breadcrumb
  / Pager
  / ProgressBar
  / Slider
  / ChartBlock
  / BulletList
  / MultilineCode
  / InlineCode
  / Bold
  / Italic
  / Strikethrough
  / InputFieldDate
  / InputFieldFile
  / InputFieldSearch
  / InputField
  / TextArea
  / ImageGroup
  / Badge
  / Reference
  / Button
  / BlankLine
  / TextLine

// ---------------------------------------------------------------------------
// Whitespace / line primitives
// ---------------------------------------------------------------------------

NL   = "\r\n" / "\n" / "\r"
EOF  = !.
EOL  = NL / EOF

BlankLine
  = NL { return { type: "blank" }; }

// Any printable char including unicode
Char
  = [^\r\n]

// Text that doesn't start a special construct
PlainChar
  = !("<[") !("___") !("__-__-____") !("[") !("]") !"{" !"}" !"*" !"~" !"`" !"|" !"#" ch:Char { return ch; }

PlainText
  = chars:PlainChar+ { return chars.join(""); }

// A full line of raw text (used inside code blocks etc.)
RawLine
  = chars:Char* NL { return chars.join(""); }

// ---------------------------------------------------------------------------
// Inline elements (usable within text lines)
// ---------------------------------------------------------------------------

Bold
  = "**" text:$(!"**" Char)+ "**"
  { return { type: "bold", text }; }

Italic
  = "*" !"*" text:$(!"*" Char)+ "*"
  { return { type: "italic", text }; }

Strikethrough
  = "~~" text:$(!"~~" Char)+ "~~"
  { return { type: "strikethrough", text }; }

InlineCode
  = "`" text:$(!"`" Char)+ "`"
  { return { type: "inlineCode", text }; }

// [label](href) or [label]  — link or button
Reference
  = "!" title:LinkTitle href:LinkHref
  { return { type: "image", title, href }; }

LinkTitle = "[" text:$(!"]" Char)+ "]" { return text; }
LinkHref  = "(" text:$(!(")" / NL) Char)+ ")" { return text; }

// ---------------------------------------------------------------------------
// Image group   { ![img](url) ... }  — fixed container, equal columns
// ---------------------------------------------------------------------------

GroupImage
  = "!" title:LinkTitle href:LinkHref EOL?
  { return { title, href }; }

ImageGroup
  = "{" EOL? images:GroupImage+ "}" EOL?
  { return { type: "imageGroup", images }; }

// ---------------------------------------------------------------------------
// Badge   {Label}
// ---------------------------------------------------------------------------

BadgeInline
  = "{" text:$( (!"}" Char)+ ) "}"
  { return { type: "badge", text }; }

Badge
  = "{" text:$( (!"}" Char)+ ) "}" EOL
  { return { type: "badge", text }; }

// ---------------------------------------------------------------------------
// Bullet list   - item
// ---------------------------------------------------------------------------

BulletItem
  = "- " text:$(Char+) EOL
  { return text; }

BulletList
  = items:BulletItem+
  { return { type: "bulletList", items }; }

// ---------------------------------------------------------------------------
// Tabs   [ Home | Settings | Billing ]  — must contain |
// ---------------------------------------------------------------------------

TabsInner
  = text:$([^\]\r\n]+) &{ return text.includes("|"); }
  { return text; }

Tabs
  = "[ " inner:TabsInner "]" EOL?
  {
    return {
      type: "tabs",
      items: inner.split("|").map(function (s) { return s.trim(); }).filter(Boolean)
    };
  }

// ---------------------------------------------------------------------------
// Slider   ~ 50 ~
// ---------------------------------------------------------------------------

Slider
  = "~" " "? value:$([0-9]+) " "? "~" EOL?
  { return { type: "slider", value: parseInt(value, 10) }; }

// ---------------------------------------------------------------------------
// Loading   ( ... ) or (...)
// Must come before RadioGroup — both use parentheses.
Loading
  = "(" [ \t]* ("..." / "…") [ \t]* ")" EOL?
  { return { type: "loading" }; }

// ---------------------------------------------------------------------------
// Chart placeholder   [[Chart title]]
// ---------------------------------------------------------------------------

ChartBlock
  = "[[" text:$(!"]]" Char)+ "]]" EOL?
  { return { type: "chart", title: text.trim() }; }

// ---------------------------------------------------------------------------
// Two columns   ::: ... ---- ... :::
// Column separator uses four dashes so card closes (---) do not conflict.
// ---------------------------------------------------------------------------

LeftColumnNode
  = !("----" EOL) n:Node { return n; }

RightColumnNode
  = !(":::" EOL) n:Node { return n; }

TwoColumnBlock
  = ":::" EOL?
    left:LeftColumnNode+
    "----" EOL
    right:RightColumnNode+
    ":::" EOL?
  { return { type: "twoColumn", left, right }; }

// ---------------------------------------------------------------------------
// Inline elements (usable within text lines)
// ---------------------------------------------------------------------------

InlineElement
  = Reference
  / BadgeInline
  / Bold
  / Italic
  / Strikethrough
  / InlineCode
  / Button
  / InputFieldFile
  / InputFieldSearch
  / InputField
  / InputFieldDate

// ---------------------------------------------------------------------------
// Text line — a line of mixed inline nodes + plain text
// ---------------------------------------------------------------------------

TextLine
  = nodes:TextLineNode+ EOL
  { return { type: "textLine", nodes }; }

TextLineNode
  = InlineElement
  / PlainText

// ---------------------------------------------------------------------------
// Headings   # ## ### #### ##### ######
// ---------------------------------------------------------------------------

Heading
  = hashes:$("######" / "#####" / "####" / "###" / "##" / "#") " " text:$(Char+) EOL
  { return { type: "heading", level: hashes.length, text: text.trim() }; }

// ---------------------------------------------------------------------------
// Horizontal rule   ***
// ---------------------------------------------------------------------------

Hr
  = "***" EOL
  { return { type: "hr" }; }

// ---------------------------------------------------------------------------
// Input fields
// ---------------------------------------------------------------------------

InputField
  = prefix:("***" / "**" / "*" / "@@@" / "@@" / "@" / "###" / "##" / "#")? "___"+"_"*
  {
    let kind = "text";
    if (prefix) {
      if (prefix.startsWith("*")) kind = "password";
      else if (prefix.startsWith("@")) kind = "email";
      else if (prefix.startsWith("#")) kind = "number";
    }
    return { type: "input", kind };
  }

InputFieldDate
  = "__-__-____"
  { return { type: "input", kind: "date" }; }

InputFieldSearch
  = "?" "___"+"_"*
  { return { type: "input", kind: "search" }; }

InputFieldFile
  = "^" "___"+"_"*
  { return { type: "input", kind: "file" }; }

// ---------------------------------------------------------------------------
// Textarea   [___] stacked lines = rows
// ---------------------------------------------------------------------------

TextAreaRow
  = "[___"+"_"* "]" EOL

TextArea
  = rows:TextAreaRow+
  { return { type: "textarea", rows: rows.length }; }

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------

ButtonSubmit  = "[>" text:$(!("<]") Char)+ "<]" { return { type: "submit",  text }; }
ButtonReset   = "[!" text:$(!("!]") Char)+ "!]" { return { type: "reset",   text }; }
ButtonNormal  = "[" text:$(!"]" [^\r\n\]])+  "]"  { return { type: "button",  text }; }

Button
  = b:(ButtonSubmit / ButtonReset / ButtonNormal)
  { return { type: "button", kind: b.type, text: b.text }; }

// ---------------------------------------------------------------------------
// Dropdown   <[Item]>
// ---------------------------------------------------------------------------

DropdownItem
  = "<[" text:$(!("]>") Char)+ "]>" EOL?
  { return { type: "dropdownItem", text, disabled: text.includes("-") }; }

DropdownGroup
  = items:DropdownItem+
  { return { type: "dropdown", items }; }

// ---------------------------------------------------------------------------
// Checkboxes   [x] / []    Radios   (x) / ()
// ---------------------------------------------------------------------------

CheckBoxItem
  = checked:("[x] " / "[X] " / "[] " / "[ ] ") text:$(Char+) EOL?
  { return { checked: checked.trim() !== "[]" && checked.trim() !== "[ ]", text }; }

RadioItem
  = checked:("(x) " / "(X) " / "() " / "( ) ") text:$(Char+) EOL?
  { return { checked: checked.trim() !== "()" && checked.trim() !== "( )", text }; }

CheckBoxGroup = items:CheckBoxItem+ { return { type: "checkboxGroup", items }; }
RadioGroup    = items:RadioItem+    { return { type: "radioGroup",    items }; }

// ---------------------------------------------------------------------------
// Progress bar   % 40 %
// ---------------------------------------------------------------------------

ProgressBar
  = "%" " "? value:$([0-9]+) " "? "%" EOL?
  { return { type: "progressBar", value: parseInt(value, 10) }; }

// ---------------------------------------------------------------------------
// Table   |col|col|
// ---------------------------------------------------------------------------

TableCell = text:$([^|\r\n]*)  { return text.trim(); }

TableRow
  = "|" cells:(TableCell "|")+ EOL?
  {
    const extracted = cells.map(c => c[0]);
    return { header: extracted.some(c => c.startsWith("*")), cells: extracted };
  }

Table
  = rows:TableRow+
  { return { type: "table", rows }; }

// ---------------------------------------------------------------------------
// Navigation   [ [home] [about] ]
// ---------------------------------------------------------------------------

NavItem
  = "[" text:$(!"]" [^\r\n\]])+ "]" href:LinkHref? " "*
  { return { text, href: href || "#" }; }

Navigation
  = "[ " " "* items:NavItem+ " "* "]" EOL?
  { return { type: "nav", items }; }

// ---------------------------------------------------------------------------
// Breadcrumb   [/home/products/page]
// ---------------------------------------------------------------------------

BreadcrumbPart
  = "/" text:$(!"/" !"]" Char)+
  { return text.join ? text.join("") : text; }

Breadcrumb
  = "[" parts:BreadcrumbPart+ "]" EOL?
  { return { type: "breadcrumb", parts }; }

// ---------------------------------------------------------------------------
// Pager   [1,2,3,4]
// ---------------------------------------------------------------------------

PagerItem
  = ","? " "? n:$([0-9]+) ","? " "*
  { return parseInt(n, 10); }

Pager
  = "[" items:PagerItem+ "]" EOL?
  { return { type: "pager", pages: items }; }

// ---------------------------------------------------------------------------
// Card block   ---Title--- ... ---
// ---------------------------------------------------------------------------

CardBody = !(("---") / (":::" EOL)) node:Node { return node; }

CardBlock
  = "---""-"* title:$(!"---" Char)+ "---""-"* EOL?
    body:CardBody*
    ("---" EOL)?
  { return { type: "card", title: title.trim(), body }; }

// ---------------------------------------------------------------------------
// Modal block   ===Title=== ... ===[btn][btn]===
// ---------------------------------------------------------------------------

ModalBody = !("===") node:Node { return node; }

ModalBlock
  = "==="+"="* title:$(!"===" Char)+ "==="+"="* EOL?
    body:ModalBody*
    "==="+"="* btn1:Button? " "* btn2:Button? "==="+"="* EOL?
  { return { type: "modal", title: title.trim(), body, btn1, btn2 }; }

// ---------------------------------------------------------------------------
// Form block   !!!Legend!!! ... !!!
// ---------------------------------------------------------------------------

FormBody = !("!!!") node:Node { return node; }

FormBlock
  = "!!!" "!"* legend:$(!"!!!" Char)+ "!!!" "!"* EOL?
    body:FormBody*
    "!!!" "!"* EOL?
  { return { type: "form", legend: legend.trim(), body }; }

// ---------------------------------------------------------------------------
// Code blocks   ``` ... ```
// ---------------------------------------------------------------------------

CodeLine
  = !("```") text:$(Char*) NL { return text; }

MultilineCode
  = "```" lang:$(Char*) NL
    lines:CodeLine*
    "```" Char* EOL?
  { return { type: "code", lang: lang.trim(), lines }; }
