# NHK Easy News Reader

An interactive news reader tailored for Japanese language learners. By simplifying NHK news articles, highlighting keywords, offering Chinese-Vietnamese bilingual annotations, and providing a daily quiz system, this project helps users gradually improve their reading skills in Japanese.

> 🚀 Supports both Chinese and Vietnamese learners. Built on a local LLM backend for summarization and keyword explanations. Ideal for self-hosting and further development.

## 📰 项目特色

- 🔍 **新闻来源**：Automatically fetches ~200 articles from NHK's official website
- ✂️ **简化新闻**：Uses a local LLM to generate summaries in Axios-style format (ここがポイント / いま おきていること)
- 💡 **关键词提取**：Highlights key terms with bilingual (Chinese & Vietnamese) definitions
- 📚 **词语查词**：Click on highlighted words to view readings, meanings, and play audio (via Jotoba API)
- 🧠 **AI 句子翻译**：Click any sentence to get AI-powered translation (Chinese or Vietnamese) via cloud LLM
- 🎯 **每日答题**：Each article generates 1 question; scores are tracked daily
- 🌐 **语言切换**：Switch between Chinese and Vietnamese for interface and explanations
- 🧩 **组件模块化**：Built with React + Tailwind + shadcn/ui + Vite for clean structure and easy customization

---

## 🛠 技术栈

| Layer      | Tech Stack                       | Description                                   |
| ---------- | -------------------------------- | --------------------------------------------- |
| Frontend   | React + Vite                     | Fast modern frontend                          |
| UI Library | Tailwind CSS 4 + shadcn/ui       | Consistent UI with dark mode support          |
| State Mgmt | Zustand                          | Lightweight and intuitive                     |
| API Layer  | Axios                            | For fetching local model results and JSON     |
| Backend    | Python + FastAPI                 | Handles simplification and keyword extraction |
| Model      | Gemma3:12B (local via vLLM/msty) | OpenAI-compatible API endpoint                |
| Hosting    | Render / Local Server            | Frontend and backend deployed separately      |
