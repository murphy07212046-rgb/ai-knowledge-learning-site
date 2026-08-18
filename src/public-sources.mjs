export const PUBLIC_SOURCES = [
  {
    name: "OpenAI News",
    type: "official",
    feedUrl: "https://openai.com/news/rss.xml",
  },
  {
    name: "Google AI Blog",
    type: "official",
    feedUrl: "https://blog.google/technology/ai/rss/",
  },
  {
    name: "Hugging Face Blog",
    type: "official",
    feedUrl: "https://huggingface.co/blog/feed.xml",
  },
  {
    name: "LangChain Releases",
    type: "official",
    feedUrl: "https://github.com/langchain-ai/langchain/releases.atom",
  },
  {
    name: "LlamaIndex Releases",
    type: "official",
    feedUrl: "https://github.com/run-llama/llama_index/releases.atom",
  },
  {
    name: "arXiv AI",
    type: "research",
    feedUrl: "https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.CL&sortBy=submittedDate&sortOrder=descending&max_results=12",
  },
  {
    name: "The Batch",
    type: "community",
    feedUrl: "https://www.deeplearning.ai/the-batch/rss/",
  }
];
