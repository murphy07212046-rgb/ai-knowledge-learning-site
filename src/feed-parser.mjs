function decodeText(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function tagValue(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, "i"));
  return match ? decodeText(match[1]) : "";
}

function atomLink(block) {
  const matches = [...block.matchAll(/<link\b([^>]*)\/?>(?:<\/link>)?/gi)];
  const href = matches
    .map((match) => match[1].match(/href=["']([^"']+)["']/i)?.[1])
    .find(Boolean);
  return href || "";
}

function asEntry(block, format, source) {
  const title = tagValue(block, "title");
  const link = format === "atom" ? atomLink(block) : tagValue(block, "link");
  const publishedAt = format === "atom"
    ? tagValue(block, "updated") || tagValue(block, "published")
    : tagValue(block, "pubDate") || tagValue(block, "date");
  const summary = format === "atom"
    ? tagValue(block, "summary") || tagValue(block, "content")
    : tagValue(block, "description") || tagValue(block, "content:encoded");

  return {
    title,
    link,
    publishedAt,
    summary,
    sourceName: source.name,
    sourceType: source.type,
  };
}

export function parseFeedEntries(xml, source) {
  const isAtom = /<feed\b/i.test(xml);
  const tagName = isAtom ? "entry" : "item";
  const blocks = [...xml.matchAll(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)</${tagName}>`, "gi"))]
    .map((match) => match[1]);

  return blocks
    .map((block) => asEntry(block, isAtom ? "atom" : "rss", source))
    .filter((entry) => entry.title && entry.link);
}
