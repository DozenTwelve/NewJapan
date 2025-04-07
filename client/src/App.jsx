import React, { useState, useEffect } from "react";
import ModernButton from "./components/ModernButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import WordPopup from "./components/WordPopup";
import ScoreDisplay from "./components/ScoreDisplay";
import SentenceAnalysisPopup from "./components/SentenceAnalysisPopup";
import QuestionModal from "./components/QuestionModal";
import SimplifiedNews from "./components/SimplifiedNews";
import OriginalText from "./components/OriginalText";

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
      <ScoreDisplay score={score} />

      {!showOriginalMode ? (
        <SimplifiedNews
          newsData={newsData}
          onWordClick={handleWordClick}
          showQuestion={showQuestion}
          answerSelected={answerSelected}
          currentIndex={currentIndex}
          onStartQuestion={() => {
            setShowQuestion(true);
            setSelectedWord(null);
          }}
          onPrevious={goToPreviousNews}
          onNext={goToNextNews}
        />
      ) : (
        <>
        <OriginalText
          newsData={newsData}
          sentences={sentences}
          onSentenceClick={handleSentenceClick}
          onBack={() => setShowOriginalMode(false)}
          onNext={goToNextNews}
        />
        </>
      )}

        {showQuestion && (
          <QuestionModal
            questionText={questionText}
            correctAnswer={correctAnswer}
            isCorrect={isCorrect}
            answerSelected={answerSelected}
            onAnswer={handleAnswer}
            onClose={() => setShowQuestion(false)}
            onNext={goToNextNews}
            onShowOriginal={() => {
              setShowOriginalMode(true);
              setShowQuestion(false);
            }}
          />
        )}

      {selectedWord && (
        <WordPopup selectedWord={selectedWord} onClose={() => setSelectedWord(null)} />
      )}

      <SentenceAnalysisPopup
        analyzingSentence={analyzingSentence}
        analysisResult={analysisResult}
        onClose={() => setAnalyzingSentence(null)}
      />

    </div>
  );
}

export default App;
