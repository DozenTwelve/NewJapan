# NHK Easy News Reader

An interactive news reader tailored for Japanese language learners. By simplifying NHK news articles, highlighting keywords, offering Chinese-Vietnamese bilingual annotations, and providing a daily quiz system, this project helps users gradually improve their reading skills in Japanese.

> 🚀 Supports both Chinese and Vietnamese learners. Built on a local LLM backend for summarization and keyword explanations. Ideal for self-hosting and further development.

## 📰 Features

- 🔍 **News Source**：Automatically fetches ~200 articles from NHK's official website
- ✂️ **Simplified News**：Uses a local LLM to generate summaries in Axios-style format (ここがポイント / いま おきていること)
- 💡 **Keyword Highlighting**：Highlights key terms with bilingual (Chinese & Vietnamese) definitions
- 📚 **Click-to-Lookup**：Click on highlighted words to view readings, meanings, and play audio (via Jotoba API)
- 🧠 **AI Translation**：Click any sentence to get AI-powered translation (Chinese or Vietnamese) via cloud LLM
- 🎯 **Daily Quiz**：Each article generates 1 question; scores are tracked daily
- 🌐 **Language Toggle**：Switch between Chinese and Vietnamese for interface and explanations
- 🧩 **Modular Components**：Built with React + Tailwind + shadcn/ui + Vite for clean structure and easy customization

---

## 🛠 Tech Stack

| Layer      | Tech Stack                       | Description                                   |
| ---------- | -------------------------------- | --------------------------------------------- |
| Frontend   | React + Vite                     | Fast modern frontend                          |
| UI Library | Tailwind CSS 4 + shadcn/ui       | Consistent UI with dark mode support          |
| State Mgmt | Zustand                          | Lightweight and intuitive                     |
| API Layer  | Axios                            | For fetching local model results and JSON     |
| Backend    | Python + FastAPI                 | Handles simplification and keyword extraction |
| Model      | Gemma3:12B (local via vLLM/msty) | OpenAI-compatible API endpoint                |
| Hosting    | Render / Local Server            | Frontend and backend deployed separately      |
