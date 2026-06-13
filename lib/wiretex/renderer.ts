// Converts the parsed AST into HTML.
// Swap this file out to target a different output (React, Tailwind, etc.)

export type Node =
  | { type: "blank" }
  | { type: "textLine"; nodes: InlineNode[] }
  | { type: "heading"; level: number; text: string }
  | { type: "hr" }
  | { type: "bold"; text: string }
  | { type: "italic"; text: string }
  | { type: "strikethrough"; text: string }
  | { type: "inlineCode"; text: string }
  | { type: "image"; title: string; href: string }
  | { type: "imageGroup"; images: ImageRef[] }
  | { type: "input"; kind: "text" | "password" | "email" | "number" | "date" | "search" | "file" }
  | { type: "textarea"; rows: number }
  | { type: "button"; kind: "button" | "submit" | "reset"; text: string }
  | { type: "dropdown"; items: DropdownItem[] }
  | { type: "checkboxGroup"; items: CheckItem[] }
  | { type: "radioGroup"; items: CheckItem[] }
  | { type: "progressBar"; value: number }
  | { type: "table"; rows: TableRow[] }
  | { type: "nav"; items: NavItem[] }
  | { type: "breadcrumb"; parts: string[] }
  | { type: "pager"; pages: number[] }
  | { type: "card"; title: string; body: Node[] }
  | { type: "modal"; title: string; body: Node[]; btn1: Node | null; btn2: Node | null }
  | { type: "form"; legend: string; body: Node[] }
  | { type: "code"; lang: string; lines: string[] }
  | { type: "badge"; text: string }
  | { type: "bulletList"; items: string[] }
  | { type: "tabs"; items: string[] }
  | { type: "slider"; value: number }
  | { type: "loading" }
  | { type: "chart"; title: string }
  | { type: "twoColumn"; left: Node[]; right: Node[] };

type InlineNode = string | Node;

interface DropdownItem { text: string; disabled: boolean }
interface CheckItem   { checked: boolean; text: string }
interface NavItem     { text: string; href: string }
interface TableRow    { header: boolean; cells: string[] }
interface ImageRef    { title: string; href: string }

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function render(nodes: Node[]): string {
  return nodes.map(renderNode).join("\n");
}

// ---------------------------------------------------------------------------
// Node dispatch
// ---------------------------------------------------------------------------

function renderNode(node: Node): string {
  switch (node.type) {
    case "blank":        return "";
    case "textLine":     return renderTextLine(node.nodes);
    case "heading":      return `<h${node.level} class="utext-heading">${esc(node.text)}</h${node.level}>`;
    case "hr":           return `<hr class="utext-hr">`;
    case "bold":         return `<strong>${esc(node.text)}</strong>`;
    case "italic":       return `<em>${esc(node.text)}</em>`;
    case "strikethrough":return `<s>${esc(node.text)}</s>`;
    case "inlineCode":   return `<code>${esc(node.text)}</code>`;
    case "image":        return renderImage(node.title, node.href, "utext-img-standalone");
    case "imageGroup":   return renderImageGroup(node.images);
    case "input":        return renderInput(node);
    case "textarea":     return renderTextarea(node.rows);
    case "button":       return renderButton(node);
    case "dropdown":     return renderDropdown(node.items);
    case "checkboxGroup":return renderCheckboxes(node.items);
    case "radioGroup":   return renderRadios(node.items);
    case "progressBar":  return renderProgress(node.value);
    case "table":        return renderTable(node.rows);
    case "nav":          return renderNav(node.items);
    case "breadcrumb":   return renderBreadcrumb(node.parts);
    case "pager":        return renderPager(node.pages);
    case "card":         return renderCard(node.title, node.body);
    case "modal":        return renderModal(node.title, node.body, node.btn1, node.btn2);
    case "form":         return renderForm(node.legend, node.body);
    case "code":         return renderCode(node.lang, node.lines);
    case "badge":        return `<span class="utext-badge">${esc(node.text)}</span>`;
    case "bulletList":   return renderBulletList(node.items);
    case "tabs":         return renderTabs(node.items);
    case "slider":       return renderSlider(node.value);
    case "loading":      return `<div class="utext-loading" aria-busy="true">( ... )</div>`;
    case "chart":        return `<div class="utext-chart">${esc(node.title)}</div>`;
    case "twoColumn":    return renderTwoColumn(node.left, node.right);
    default:             return "";
  }
}

// ---------------------------------------------------------------------------
// Inline rendering
// ---------------------------------------------------------------------------

function renderTextLine(nodes: InlineNode[]): string {
  const inner = nodes.map(n =>
    typeof n === "string" ? esc(n) : renderInlineNode(n as Node)
  ).join("");
  return `<p class="utext-text">${inner}</p>`;
}

function renderInlineNode(node: Node): string {
  if (node.type === "image") {
    return renderImage(node.title, node.href, "utext-img-inline");
  }
  return renderNode(node);
}

// ---------------------------------------------------------------------------
// Images — wireframes always use placeholders; remote URLs are never loaded.
// ---------------------------------------------------------------------------

function renderImage(title: string, _href: string, layout: string): string {
  const label = esc(title);

  return `
<div class="utext-img-placeholder ${layout}" role="img" aria-label="${label}">
  <span class="utext-img-placeholder-art" aria-hidden="true"></span>
  <span class="utext-img-placeholder-label">${label}</span>
</div>`;
}

function renderImageGroup(images: ImageRef[]): string {
  const count = images.length;
  const cells = images.map(img =>
    `<div class="utext-img-group-cell">${renderImage(img.title, img.href, "utext-img-group-item")}</div>`
  ).join("\n");

  return `
<div class="utext-img-group" style="--utext-group-count: ${count}">
  ${cells}
</div>`;
}

// ---------------------------------------------------------------------------
// Form elements
// ---------------------------------------------------------------------------

function renderInput(node: { kind: string }): string {
  const typeMap: Record<string, string> = {
    text: "text", password: "password",
    email: "email", number: "number", date: "date",
    search: "search", file: "file",
  };
  const t = typeMap[node.kind] ?? "text";
  return `<input type="${t}" class="utext-input" placeholder="">`;
}

function renderTextarea(rows: number): string {
  return `<textarea class="utext-textarea" rows="${rows}"></textarea>`;
}

function renderButton(node: { kind: string; text: string }): string {
  const cls = node.kind === "submit"
    ? "utext-btn utext-btn-primary"
    : node.kind === "reset"
    ? "utext-btn utext-btn-secondary"
    : "utext-btn";
  return `<button type="button" class="${cls}">${esc(node.text)}</button>`;
}

function renderDropdown(items: DropdownItem[]): string {
  const options = items.map(i =>
    `<option${i.disabled ? " disabled" : ""}>${esc(i.text.replace(/-/g, "").trim())}</option>`
  ).join("\n");
  return `<select class="utext-select">\n${options}\n</select>`;
}

function renderCheckboxes(items: CheckItem[]): string {
  return items.map(i => `
  <label class="utext-check">
    <input type="checkbox" class="utext-check-input"${i.checked ? " checked" : ""}>
    ${esc(i.text)}
  </label>`).join("\n");
}

function renderRadios(items: CheckItem[]): string {
  return items.map(i => `
  <label class="utext-check">
    <input type="radio" class="utext-check-input"${i.checked ? " checked" : ""}>
    ${esc(i.text)}
  </label>`).join("\n");
}

function renderProgress(value: number): string {
  const clamped = Math.min(100, Math.max(0, value));
  return `
<div class="utext-progress">
  <div class="utext-progress-bar" role="progressbar"
       style="width: ${clamped}%"
       aria-valuenow="${clamped}" aria-valuemin="0" aria-valuemax="100">
    ${clamped}%
  </div>
</div>`;
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

function renderTable(rows: TableRow[]): string {
  const bodyRows = rows.map(row => {
    const cells = row.cells.map(c => {
      const isHeader = c.startsWith("*");
      const text = esc(isHeader ? c.slice(1) : c);
      return isHeader ? `<th>${text}</th>` : `<td>${text}</td>`;
    }).join("");
    return `<tr>${cells}</tr>`;
  }).join("\n");
  return `<table class="utext-table">\n${bodyRows}\n</table>`;
}

// ---------------------------------------------------------------------------
// Navigation / Breadcrumb / Pager
// ---------------------------------------------------------------------------

function renderNav(items: NavItem[]): string {
  const links = items.map(i =>
    `<li class="utext-nav-item"><span class="utext-nav-link">${esc(i.text)}</span></li>`
  ).join("\n");
  return `
<nav class="utext-nav">
  <ul class="utext-nav-list">
    ${links}
  </ul>
</nav>`;
}

function renderBreadcrumb(parts: string[]): string {
  const items = parts.map((p, i) => {
    const isLast = i === parts.length - 1;
    return isLast
      ? `<li class="utext-breadcrumb-item active">${esc(p)}</li>`
      : `<li class="utext-breadcrumb-item"><span class="utext-breadcrumb-link">${esc(p)}</span></li>`;
  }).join("\n");
  return `<ol class="utext-breadcrumb">\n${items}\n</ol>`;
}

function renderPager(pages: number[]): string {
  const items = pages.map(p =>
    `<li class="utext-page-item"><span class="utext-page-link">${p}</span></li>`
  ).join("\n");
  return `
<ul class="utext-pagination">
  <li class="utext-page-item utext-page-prev"><span class="utext-page-link">&laquo;</span></li>
  ${items}
  <li class="utext-page-item utext-page-next"><span class="utext-page-link">&raquo;</span></li>
</ul>`;
}

// ---------------------------------------------------------------------------
// Card / Modal / Form
// ---------------------------------------------------------------------------

function renderCard(title: string, body: Node[]): string {
  return `
<div class="utext-card">
  <div class="utext-card-header">${esc(title)}</div>
  <div class="utext-card-body">
    ${render(body)}
  </div>
</div>`;
}

function renderModal(title: string, body: Node[], btn1: Node | null, btn2: Node | null): string {
  const primaryBtn   = btn1 ? renderNode(btn1) : `<button type="button" class="utext-btn utext-btn-primary">Save</button>`;
  const secondaryBtn = btn2 ? renderNode(btn2) : `<button type="button" class="utext-btn utext-btn-secondary">Close</button>`;
  return `
<div class="utext-modal" role="dialog">
  <div class="utext-modal-content">
    <div class="utext-modal-header">
      <h5 class="utext-modal-title">${esc(title)}</h5>
      <button class="utext-modal-close" aria-label="Close">&times;</button>
    </div>
    <div class="utext-modal-body">
      ${render(body)}
    </div>
    <div class="utext-modal-footer">
      ${primaryBtn}
      ${secondaryBtn}
    </div>
  </div>
</div>`;
}

function renderForm(legend: string, body: Node[]): string {
  return `
<div class="utext-form">
  <fieldset>
    <legend class="utext-form-legend">${esc(legend)}</legend>
    ${render(body)}
  </fieldset>
</div>`;
}

// ---------------------------------------------------------------------------
// Code block
// ---------------------------------------------------------------------------

function renderCode(lang: string, lines: string[]): string {
  const cls = lang ? ` class="language-${esc(lang)}"` : "";
  return `<pre class="utext-code"><code${cls}>${lines.map(esc).join("\n")}</code></pre>`;
}

function renderBulletList(items: string[]): string {
  const lis = items.map(i => `<li>${esc(i)}</li>`).join("\n");
  return `<ul class="utext-list">\n${lis}\n</ul>`;
}

function renderTabs(items: string[]): string {
  const tabs = items.map((item, i) =>
    `<li class="utext-tab${i === 0 ? " utext-tab-active" : ""}">${esc(item)}</li>`
  ).join("\n");
  return `<ul class="utext-tabs">\n${tabs}\n</ul>`;
}

function renderSlider(value: number): string {
  const clamped = Math.min(100, Math.max(0, value));
  return `<input type="range" class="utext-slider" value="${clamped}" min="0" max="100" disabled>`;
}

function renderTwoColumn(left: Node[], right: Node[]): string {
  return `
<div class="utext-columns">
  <div class="utext-col">${render(left)}</div>
  <div class="utext-col">${render(right)}</div>
</div>`;
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
