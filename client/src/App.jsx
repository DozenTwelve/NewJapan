import React, { useState, useEffect } from "react";
import ModernButton from "./components/ModernButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import WordPopup from "./WordPopup";

function Button({ children, color = "blue", className = "", ...props }) {
  const colorMap = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    red: "bg-red-600 hover:bg-red-700",
    gray: "bg-gray-500 hover:bg-gray-600",
    yellow: "bg-yellow-500 hover:bg-yellow-600",
    indigo: "bg-indigo-600 hover:bg-indigo-700",
  };
  const base =
    "px-4 py-2 rounded-md text-white font-semibold " +
    (colorMap[color] || colorMap.blue);
  return (
    <button className={`${base} ${className}`} {...props}>
      {children}
    </button>
  );
}

function App() {
  const [newsList, setNewsList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [answerSelected, setAnswerSelected] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showOriginalMode, setShowOriginalMode] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [analyzingSentence, setAnalyzingSentence] = useState(null);
  const [analysisResult, setAnalysisResult] = useState("");

  useEffect(() => {
    fetch("/news.json")
      .then((res) => res.json())
      .then((data) => {
        const shuffled = data.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 10);
        setNewsList(selected);
      });

    const today = new Date().toISOString().split("T")[0];
    const savedData = JSON.parse(localStorage.getItem("quizData")) || {};
    if (savedData.date === today) {
      setScore(savedData.score || 0);
      setAnsweredCount(savedData.answered || 0);
    } else {
      localStorage.setItem(
        "quizData",
        JSON.stringify({ date: today, score: 0, answered: 0 })
      );
    }
  }, []);

  const newsData = newsList[currentIndex];
  if (!newsData) return <div className="text-center mt-10">Loading...</div>;

  const questionText = newsData.question?.text;
  const correctAnswer = newsData.question?.answer;

  const sentences = (newsData.original || "")
  .split(/(?<=[。！？\n])/)
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

  function handleAnswer(userAnswer) {
    if (answeredCount >= 1000) {
      alert("今日のクイズは1000問までです。明日また挑戦してください！");
      return;
    }

    const isCorrectNow = userAnswer === correctAnswer;
    setIsCorrect(isCorrectNow);
    setAnswerSelected(true);

    const newScore = isCorrectNow ? score + 1 : score;
    const newAnswered = answeredCount + 1;

    setScore(newScore);
    setAnsweredCount(newAnswered);

    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(
      "quizData",
      JSON.stringify({ date: today, score: newScore, answered: newAnswered })
    );
  }

  function goToNextNews() {
    setCurrentIndex((prev) => prev + 1);
    resetState();
  }

  function goToPreviousNews() {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
    resetState();
  }

  function resetState() {
    setShowQuestion(false);
    setAnswerSelected(false);
    setIsCorrect(null);
    setShowOriginalMode(false);
    setSelectedWord(null);
  }

// 保留你的原始版本，用于段落
  function cleanLineForParagraph(line) {
    return line
      .trimStart() // 先清除开头全角/半角空格
      .replace(/^(\*+|→|→\*+|\*+→)+\s*/g, "")
      .replace(/^・/g, "")
      .trimEnd()
  }

  // 另一个用于列表（不缩进）
  function cleanLineForListItem(line) {
    return line
      .replace(/^(\*+|→|→\*+|\*+→)+\s*/g, "")
      .replace(/^・/g, "")
      .replace(/^[-*]\s*/, "") // 处理 markdown 的 - * 等符号
      .trim();
  }

  function renderWithClickableKanji(line, onWordClick) {
    // 高亮逻辑：连续2个以上汉字，或 汉字+假名
    const regex = /[\u4E00-\u9FFF]{2,}|[\u4E00-\u9FFF][ぁ-んァ-ン]+/g;
  
    const parts = [];
    let lastIndex = 0;
    let match;
  
    while ((match = regex.exec(line)) !== null) {
      const { index } = match;
      const word = match[0];
  
      if (index > lastIndex) {
        parts.push(line.slice(lastIndex, index)); // 非匹配部分
      }
  
      parts.push(
        <span
          key={index}
          className="underline decoration-dotted cursor-pointer text-inherit hover:bg-blue-100 px-1"
          onClick={() => onWordClick(word)}
        >
          {word}
        </span>
      );
  
      lastIndex = index + word.length;
    }
  
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }
  
    return parts;
  }
  

  async function handleWordClick(word) {
    setSelectedWord({
      word,
      reading: "",
      aiResult: "AIによる翻訳中...",
      audio: null
    });
  
    const result = await translateWordWithAI(word);
  
    setSelectedWord({
      word,
      reading: result.reading,
      aiResult: result.translation,
      audio: null
    });
  }
  

  async function translateWordWithAI(word) {
    const prompt = `
  以下の日本語の単語について、ベトナム人学習者向けに簡潔に説明してください。
  
  - ベトナム語訳を必ず含めてください。
  - ひらがな読みも表示してください。
  
  単語：「${word}」
  
  出力形式：
  - 単語：...
  - よみ：...
  - ベトナム語訳：...
  `.trim();
  
    try {
      const res = await fetch("https://newjapan-api.onrender.com/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
  
      const raw = await res.text();
      const data = JSON.parse(raw);
      const content = data.choices?.[0]?.message?.content || "";
  
      // 正则提取部分内容
      const readingMatch = content.match(/よみ：(.+?)(?:\n|$)/);
      const vietnameseMatch = content.match(/ベトナム語訳：(.+?)(?:\n|$)/);
  
      return {
        reading: readingMatch ? readingMatch[1].trim() : "（不明）",
        translation: vietnameseMatch ? vietnameseMatch[1].trim() : "（訳なし）",
        raw: content // 如果你还想保留原文作为 debug
      };
    } catch (error) {
      console.error("AI翻訳エラー", error);
      return {
        reading: "（エラー）",
        translation: "AI翻訳中にエラーが発生しました。",
        raw: ""
      };
    }
  }
  
  async function handleSentenceClick(sentence) {
    setAnalyzingSentence(sentence);
    setAnalysisResult("AIによる文法分析中...");
  
    const prompt = `
  以下の日本語の文に含まれる主な文法表現（助詞・文型）を1～2個挙げ、それぞれの意味と使い方を簡単に説明してください。JLPT N3〜N2レベルの学習者向けに、わかりやすくしてください。
  
  文：「${sentence}」
  出力は以下のMarkdown形式に**限定**し、前置きや補足説明は書かないでください：
  
  - 文法ポイント1：〇〇
    - 意味：...
    - 用法：...
  - 文法ポイント2：〇〇
    - 意味：...
    - 用法：...
  
  簡潔に、100文字以内でまとめてください。
    `.trim();
  
    try {
      const res = await fetch("https://newjapan-api.onrender.com/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
  
      const raw = await res.text();
      console.log("📦 AI 返回原始内容:", raw);
  
      let data;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        console.error("❌ JSON 解析失败:", err);
        setAnalysisResult("AI応答の解析に失敗しました。");
        return;
      }
  
      const output = data.choices?.[0]?.message?.content;
      console.log("✅ OpenRouter 响应结果:", output);
  
      if (output) {
        setAnalysisResult(output);
        console.log("🎯 AI 文法分析結果：", output);
      } else {
        setAnalysisResult("解析結果が見つかりませんでした。");
      }
    } catch (error) {
      console.error("OpenRouter API エラー:", error);
      setAnalysisResult("文法分析中にエラーが発生しました。");
    }
  }

  return (
    <div className="flex flex-col items-center p-6 gap-6 min-h-screen bg-gray-100 text-gray-900">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">やさしいニュース</h1>
      <div className="text-sm text-gray-600 font-medium">
        今日のスコア：{score} / 10
      </div>

      {!showOriginalMode ? (
        <div className="w-full max-w-3xl">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg transition">
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-indigo-600 text-center mb-6">
              {newsData.title}
            </h2>
      
            <div className="text-gray-800 space-y-6">
              {/* --- ここがポイント --- */}
              <div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  ここがポイント
                </h3>
                {cleanLineForParagraph(newsData.simplified?.why)
                  .split("\n")
                  .map(line => cleanLineForParagraph(line))
                  .filter((line) => line.trim())
                  .map((line, i) => (
                    <p key={"why-" + i} className="text-base leading-relaxed">
                    {renderWithClickableKanji(line, handleWordClick)}
                  </p>
                  ))}
              </div>
      
              {/* --- いま おきていること --- */}
              <div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  いま おきていること
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  {(newsData.simplified?.what || "")
                    .replace(/\n/g, "")
                    .split(/(?<=[。！？])/)
                    .map((line) => cleanLineForListItem(line))
                    .filter((line) => line.length > 3)
                    .map((sentence, i) => (
                      <li key={"what-" + i} className="text-base leading-relaxed">
                        {renderWithClickableKanji(sentence, handleWordClick)}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
      
          {/* 按钮区域（保持不变） */}
          {!showQuestion && (
            <div className="flex justify-center items-center gap-4 border-t border-gray-100 bg-gray-50 px-6 py-4">
              {!answerSelected ? (
                <>
                  <ModernButton
                    variant="green"
                    onClick={() => {
                      setShowQuestion(true);
                      setSelectedWord(null);
                    }}
                  >
                    問題に進む
                  </ModernButton>
                  {currentIndex > 0 && (
                    <ModernButton variant="gray" onClick={goToPreviousNews}>
                      前のニュースへ
                    </ModernButton>
                  )}
                </>
              ) : (
                <ModernButton variant="green" onClick={goToNextNews}>
                  次のニュースへ
                </ModernButton>
              )}
            </div>
          )}
        </div>
      </div>
      
      
      ) : (
        <>
          <div className="w-full flex justify-center">
            <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-xl shadow p-8">
              <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">原文</h2>

              <div className="space-y-4 text-gray-800">
                {sentences.map((sentence, i) => (
                  <p
                    key={i}
                    className="text-base leading-relaxed cursor-pointer hover:bg-yellow-100 rounded px-2 py-1 transition"
                    onClick={() => handleSentenceClick(sentence)}
                  >
                    {sentence}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-4 justify-center">
            <ModernButton variant="green" onClick={goToNextNews}>次のニュースへ</ModernButton>
            <ModernButton variant="gray" onClick={() => setShowOriginalMode(false)}>戻る</ModernButton>
          </div>
        </>
      )}

      {showQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">質問</h3>
            <p className="text-gray-700 mb-6">{questionText}</p>

            {!answerSelected ? (
        <div className="flex justify-center gap-4">
          <ModernButton variant="green" onClick={() => handleAnswer("〇")}>〇</ModernButton>
          <ModernButton variant="red" onClick={() => handleAnswer("×")}>×</ModernButton>
        </div>
      ) : (
        <div className="text-center">
          <p className={`text-lg font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
            {isCorrect ? "正解！" : "不正解。"}
          </p>
          <p className="text-sm text-gray-600 mt-2">正しい答え：{correctAnswer}</p>
          <div className="mt-4 flex justify-center gap-3">
            <ModernButton variant="green" onClick={goToNextNews}>次のニュースへ</ModernButton>
            <ModernButton variant="gray" onClick={() => {
              setShowOriginalMode(true);
              setShowQuestion(false);
            }}>
              原文を見る
            </ModernButton>
          </div>
        </div>
      )}

            <div className="mt-6 text-center">
              <ModernButton variant="gray" onClick={() => {
                setShowQuestion(false);
              }}>
                閉じる
              </ModernButton>
            </div>
          </div>
        </div>
      )}

      {selectedWord && (
        <WordPopup selectedWord={selectedWord} onClose={() => setSelectedWord(null)} />
      )}

      {analyzingSentence && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-xl border border-gray-200 p-6 w-full max-w-lg z-50 backdrop-blur-sm">
          <h3 className="text-base font-bold text-indigo-600 mb-2">文法分析</h3>
          <p className="text-sm text-gray-600 mb-4">
            🔍 対象文：{analyzingSentence}
          </p>

          <div className="prose prose-sm max-w-none text-gray-800">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {analysisResult}
            </ReactMarkdown>
          </div>

          <div className="mt-6 text-center">
            <ModernButton variant="gray" onClick={() => setAnalyzingSentence(null)}>閉じる</ModernButton>
          </div>
        </div>
      )}


    </div>
  );
}

export default App;
