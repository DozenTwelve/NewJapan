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
import ScoreSummaryModal from "./components/ScoreSummaryModal";


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
  const [lang, setLang] = useState("vi");
  const [showScoreSummary, setShowScoreSummary] = useState(false);
  const [aiUsage, setAiUsage] = useState(0);

  const [keywordDict, setKeywordDict] = useState({});
  const [keywords, setKeywords] = useState([]);

  // 当前新闻数据
  const newsData = newsList[currentIndex];
  const questionText = newsData?.question?.text;
  const correctAnswer = newsData?.question?.answer;

  const sentences = (newsData?.original || "")
    .split(/(?<=[。！？\n])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // 新闻列表初始化
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
      localStorage.setItem("quizData", JSON.stringify({ date: today, score: 0, answered: 0 }));
    }
  }, []);

  // 加载词典
  useEffect(() => {
    fetch("/keyword-dict.json")
      .then((res) => res.json())
      .then((data) => setKeywordDict(data));
  }, []);

  // 每次新闻切换，更新关键词
  useEffect(() => {
    const title = newsData?.title;
    if (title && keywordDict?.[title]) {
      setKeywords(keywordDict[title].keywords || []);
    } else {
      setKeywords([]);
    }
  }, [newsData, keywordDict]);

  const [aiCount, setAiCount] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const saved = JSON.parse(localStorage.getItem("aiUsage") || "{}");
    if (saved.date === today) {
      setAiCount(saved.count || 0);
    } else {
      localStorage.setItem("aiUsage", JSON.stringify({ date: today, count: 0 }));
    }
  }, []);  

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const savedData = JSON.parse(localStorage.getItem("quizData")) || {};
    if (savedData.date === today) {
      setScore(savedData.score || 0);
      setAnsweredCount(savedData.answered || 0);
    } else {
      localStorage.setItem("quizData", JSON.stringify({ date: today, score: 0, answered: 0 }));
    }
  
    const savedAI = JSON.parse(localStorage.getItem("aiUsage")) || {};
    if (savedAI.date === today) {
      setAiUsage(savedAI.count || 0);
    } else {
      localStorage.setItem("aiUsage", JSON.stringify({ date: today, count: 0 }));
      setAiUsage(0);
    }
  }, []);  

  function handleAnswer(userAnswer) {
    if (answeredCount >= 10) {
      alert("今日のクイズは10問までです。明日また挑戦してください！");
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
    localStorage.setItem("quizData", JSON.stringify({ date: today, score: newScore, answered: newAnswered }));
  
    // 🎉 正好是第10题时，显示得分总结
    if (newAnswered === 10) {
      setShowScoreSummary(true);
    }
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

  function handleWordClick(word) {
    const entry = keywords.find((k) => k.word === word);
    setSelectedWord(
      entry || {
        word,
        reading: "",
        zh: "（辞書にありません）",
        vi: "（không có trong từ điển）",
      }
    );
  }

  async function handleSentenceClick(sentence) {
    if (aiUsage >= 10) {
      alert("今日の翻訳リクエストは10回までです。明日またお試しください！");
      return;
    }
  
    const newCount = aiUsage + 1;
    setAiUsage(newCount);
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("aiUsage", JSON.stringify({ date: today, count: newCount }));
  
    setAnalyzingSentence(sentence);
    setAnalysisResult("AIによる翻訳中...");
  
    const prompt = `
  以下の日本語の文を${lang === "zh" ? "中国語" : "ベトナム語"}に翻訳してください。
  文：「${sentence}」
  
  出力形式（訳のみで、説明なし）：
  - 訳：...
  `.trim();
  
    try {
      const res = await fetch("https://newjapan-api.onrender.com/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
  
      const raw = await res.text();
      const data = JSON.parse(raw);
      const content = data.choices?.[0]?.message?.content || "";
  
      const match = content.match(/訳：(.+)/);
      if (match) {
        setAnalysisResult(match[1].trim());
      } else {
        setAnalysisResult("翻訳結果が見つかりませんでした。");
      }
    } catch (error) {
      console.error("翻訳エラー:", error);
      setAnalysisResult("翻訳中にエラーが発生しました。");
    }
  }
  
  

  if (!newsData) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center p-6">
      <div className="w-full max-w-4xl space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow p-6 text-center space-y-4">
          <h1 className="text-3xl font-bold text-indigo-600">簡単に言えば</h1>
        
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-gray-700">
          <div>
            翻訳言語:{" "}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="ml-1 border rounded px-2 py-1 text-sm"
            >
              <option value="vi">ベトナム語 🇻🇳</option>
              <option value="zh">中国語 🇨🇳</option>
            </select>
          </div>
  
          <div className="text-gray-500 hidden sm:block">|</div>
  
          <ScoreDisplay score={score} answered={answeredCount} />
        </div>
      </div>
  
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
          keywords={keywords}
        />
      ) : (
        <OriginalText
          newsData={newsData}
          sentences={sentences}
          onSentenceClick={handleSentenceClick}
          onBack={() => setShowOriginalMode(false)}
          onNext={goToNextNews}
          keywords={keywords}
          onWordClick={handleWordClick}
        />
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

      {showScoreSummary && (
        <ScoreSummaryModal score={score} onClose={() => setShowScoreSummary(false)} />
      )}

      {selectedWord && (
        <WordPopup
          selectedWord={selectedWord}
          onClose={() => setSelectedWord(null)}
          lang={lang}
        />
      )}

      <SentenceAnalysisPopup
        analyzingSentence={analyzingSentence}
        analysisResult={analysisResult}
        onClose={() => setAnalyzingSentence(null)}
      />

    </div>
  </div>
  );
}

export default App;
