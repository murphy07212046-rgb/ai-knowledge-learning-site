export function serializeBrowserKnowledgeData(data) {
  const json = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

  return `window.AI_KNOWLEDGE_DATA = ${json};\n`;
}
