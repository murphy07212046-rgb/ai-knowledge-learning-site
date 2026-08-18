import test from "node:test";
import assert from "node:assert/strict";

import { parseFeedEntries } from "../src/feed-parser.mjs";

test("解析 Atom feed 并提取可展示的公开来源条目", () => {
  const entries = parseFeedEntries(
    `<?xml version="1.0"?>
    <feed xmlns="http://www.w3.org/2005/Atom">
      <entry>
        <title>Structured outputs update</title>
        <link href="https://example.com/structured-outputs" />
        <updated>2026-08-05T08:00:00Z</updated>
        <summary>Reliable JSON schema responses for production applications.</summary>
      </entry>
    </feed>`,
    { name: "Example official release", type: "official" },
  );

  assert.deepEqual(entries, [
    {
      title: "Structured outputs update",
      link: "https://example.com/structured-outputs",
      publishedAt: "2026-08-05T08:00:00Z",
      summary: "Reliable JSON schema responses for production applications.",
      sourceName: "Example official release",
      sourceType: "official",
    },
  ]);
});

test("解析 RSS feed 中的发布日期和描述", () => {
  const entries = parseFeedEntries(
    `<rss><channel><item>
      <title>Agent evaluation guide</title>
      <link>https://example.com/agent-eval</link>
      <pubDate>Wed, 05 Aug 2026 08:00:00 GMT</pubDate>
      <description>How to measure agent quality and reliability.</description>
    </item></channel></rss>`,
    { name: "Example technical blog", type: "community" },
  );

  assert.equal(entries[0].title, "Agent evaluation guide");
  assert.equal(entries[0].link, "https://example.com/agent-eval");
  assert.equal(entries[0].sourceType, "community");
});
