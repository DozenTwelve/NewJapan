// 📁 文件名：server.js（或 server.cjs，如果你是 "type": "module" 环境）

const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 3001; // 🚀 本地代理端口

app.use(cors());
app.use(express.json());

app.post("/api/explain", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "❌ Missing or invalid prompt" });
  }

  try {
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173", // ✅ 有些模型可能会校验
        "X-Title": "Yasashii News Dev"
      },
      body: JSON.stringify({
        model: "google/gemma-3n-e2b-it:free", // ✅ 免费模型
        messages: [
          {
            role: "system",
            content: "あなたは日本語教師です。Markdown形式で出力してください。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        top_p: 0.9
      })
    });

    const data = await aiRes.json();

    if (!aiRes.ok) {
      console.error("🛑 OpenRouter 返回错误:", data);
      return res.status(aiRes.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error("🛑 后端转发异常:", error);
    res.status(500).json({ error: "OpenRouter API error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 本地代理 API 已启动：http://localhost:${PORT}`);
  console.log(`🔐 使用的 API Key: ${process.env.OPENROUTER_API_KEY?.slice(0, 12)}...`);
});
