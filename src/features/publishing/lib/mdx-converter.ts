interface Block {
  id: string;
  type: string;
  props: Record<string, unknown>;
  content: InlineContent[] | Block[];
  children: Block[];
}

interface InlineContent {
  type: string;
  text?: string;
  styles?: Record<string, boolean>;
  href?: string;
  content?: InlineContent[];
}

export function blocksToMdx(blocks: Block[]): string {
  return blocks.map((block) => blockToMdx(block)).join("\n\n");
}

function blockToMdx(block: Block): string {
  switch (block.type) {
    case "heading":
      return headingToMdx(block);
    case "paragraph":
      return inlineToMdx(block.content as InlineContent[]);
    case "bulletListItem":
      return bulletListItemToMdx(block);
    case "numberedListItem":
      return numberedListItemToMdx(block);
    case "checkListItem":
      return checkListItemToMdx(block);
    case "codeBlock":
      return codeBlockToMdx(block);
    case "image":
      return imageToMdx(block);
    case "table":
      return tableToMdx(block);
    case "callout":
      return calloutToMdx(block);
    case "tabGroup":
      return tabGroupToMdx(block);
    case "steps":
      return stepsToMdx(block);
    case "card":
      return cardToMdx(block);
    case "cardGrid":
      return cardGridToMdx(block);
    default:
      return inlineToMdx(block.content as InlineContent[]);
  }
}

function headingToMdx(block: Block): string {
  const level = (block.props.level as number) ?? 1;
  const prefix = "#".repeat(level);
  const text = inlineToMdx(block.content as InlineContent[]);
  return `${prefix} ${text}`;
}

function bulletListItemToMdx(block: Block): string {
  const text = inlineToMdx(block.content as InlineContent[]);
  const childrenMdx = block.children?.length
    ? "\n" + block.children.map((c) => indent(blockToMdx(c), "  ")).join("\n")
    : "";
  return `- ${text}${childrenMdx}`;
}

function numberedListItemToMdx(block: Block): string {
  const text = inlineToMdx(block.content as InlineContent[]);
  const childrenMdx = block.children?.length
    ? "\n" + block.children.map((c) => indent(blockToMdx(c), "   ")).join("\n")
    : "";
  return `1. ${text}${childrenMdx}`;
}

function checkListItemToMdx(block: Block): string {
  const checked = block.props.checked ? "x" : " ";
  const text = inlineToMdx(block.content as InlineContent[]);
  return `- [${checked}] ${text}`;
}

function codeBlockToMdx(block: Block): string {
  const lang = (block.props.language as string) ?? "";
  const code = inlineToMdx(block.content as InlineContent[]);
  return `\`\`\`${lang}\n${code}\n\`\`\``;
}

function imageToMdx(block: Block): string {
  const url = (block.props.url as string) ?? "";
  const alt = (block.props.caption as string) ?? "";
  return `![${alt}](${url})`;
}

function tableToMdx(block: Block): string {
  const rows = block.content as unknown as { cells: InlineContent[][] }[];
  if (!rows || rows.length === 0) return "";

  const lines: string[] = [];
  rows.forEach((row, rowIndex) => {
    const cells = row.cells.map((cell) => inlineToMdx(cell));
    lines.push(`| ${cells.join(" | ")} |`);
    if (rowIndex === 0) {
      lines.push(`| ${cells.map(() => "---").join(" | ")} |`);
    }
  });
  return lines.join("\n");
}

function calloutToMdx(block: Block): string {
  const type = (block.props.type as string) ?? "info";
  const content = inlineToMdx(block.content as InlineContent[]);
  return `<Callout type="${type}">\n  ${content}\n</Callout>`;
}

function tabGroupToMdx(block: Block): string {
  const tabs = ((block.props.tabs as string) ?? "Tab 1").split(",").map((t) => t.trim());
  const content = inlineToMdx(block.content as InlineContent[]);
  const tabsMdx = tabs.map((tab) => `  <Tab label="${tab}">${content}</Tab>`).join("\n");
  return `<Tabs>\n${tabsMdx}\n</Tabs>`;
}

function stepsToMdx(block: Block): string {
  const title = (block.props.title as string) ?? "Step";
  const content = inlineToMdx(block.content as InlineContent[]);
  return `<Steps>\n  <Step title="${title}">\n    ${content}\n  </Step>\n</Steps>`;
}

function cardToMdx(block: Block): string {
  const title = (block.props.title as string) ?? "";
  const href = (block.props.href as string) ?? "";
  const icon = (block.props.icon as string) ?? "";
  const parts = [`title="${title}"`];
  if (href) parts.push(`href="${href}"`);
  if (icon) parts.push(`icon="${icon}"`);
  return `<Card ${parts.join(" ")} />`;
}

function cardGridToMdx(block: Block): string {
  const cols = (block.props.cols as string) ?? "2";
  const content = inlineToMdx(block.content as InlineContent[]);
  return `<CardGrid cols={${cols}}>\n  ${content}\n</CardGrid>`;
}

function inlineToMdx(content: InlineContent[]): string {
  if (!content || !Array.isArray(content)) return "";

  return content
    .map((node) => {
      if (node.type === "text") {
        let text = node.text ?? "";
        if (node.styles?.bold) text = `**${text}**`;
        if (node.styles?.italic) text = `*${text}*`;
        if (node.styles?.code) text = `\`${text}\``;
        if (node.styles?.strikethrough) text = `~~${text}~~`;
        return text;
      }
      if (node.type === "link") {
        const linkText = node.content
          ? inlineToMdx(node.content)
          : node.text ?? "";
        return `[${linkText}](${node.href ?? ""})`;
      }
      return node.text ?? "";
    })
    .join("");
}

function indent(text: string, prefix: string): string {
  return text
    .split("\n")
    .map((line) => prefix + line)
    .join("\n");
}

export function generateFrontmatter(doc: {
  title: string;
  description?: string;
  sidebar_position?: number;
  tags?: string;
  draft?: boolean;
}): string {
  const lines: string[] = ["---"];
  lines.push(`title: "${doc.title.replace(/"/g, '\\"')}"`);
  if (doc.description) {
    lines.push(`description: "${doc.description.replace(/"/g, '\\"')}"`);
  }
  if (doc.sidebar_position !== undefined && doc.sidebar_position !== null) {
    lines.push(`sidebar_position: ${doc.sidebar_position}`);
  }
  if (doc.tags) {
    const tagList = doc.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tagList.length > 0) {
      lines.push(`tags: [${tagList.join(", ")}]`);
    }
  }
  if (doc.draft) {
    lines.push("draft: true");
  }
  lines.push("---");
  return lines.join("\n");
}
