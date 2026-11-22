function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inline(value: string): string {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
}

export function renderMarkdown(markdown: string | null | undefined): string {
  if (!markdown) return "";
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let paragraph: string[] = [];
  let list: "ul" | "ol" | null = null;
  let quote: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${inline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      out.push(`</${list}>`);
      list = null;
    }
  };
  const flushQuote = () => {
    if (quote.length) {
      out.push(`<blockquote>${quote.map((q) => `<p>${inline(q)}</p>`).join("")}</blockquote>`);
      quote = [];
    }
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushAll();
      continue;
    }
    if (line === "---") {
      flushAll();
      out.push("<hr />");
      continue;
    }
    if (line.startsWith("#### ")) {
      flushAll();
      out.push(`<h3>${inline(line.slice(5))}</h3>`);
      continue;
    }
    if (line.startsWith("### ")) {
      flushAll();
      out.push(`<h3>${inline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      flushAll();
      out.push(`<h2>${inline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      flushAll();
      out.push(`<h2>${inline(line.slice(2))}</h2>`);
      continue;
    }
    if (line.startsWith("> ")) {
      flushParagraph();
      flushList();
      quote.push(line.slice(2));
      continue;
    }
    const ordered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (ordered) {
      flushParagraph();
      flushQuote();
      if (list !== "ol") {
        flushList();
        out.push("<ol>");
        list = "ol";
      }
      out.push(`<li>${inline(ordered[1])}</li>`);
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph();
      flushQuote();
      if (list !== "ul") {
        flushList();
        out.push("<ul>");
        list = "ul";
      }
      out.push(`<li>${inline(line.slice(2))}</li>`);
      continue;
    }
    flushList();
    flushQuote();
    paragraph.push(line);
  }
  flushAll();
  return out.join("\n");
}
