import React from "react";
import ModernButton from "./ModernButton";

function OriginalText({
  newsData,
  sentences,
  onSentenceClick,
  onBack,
  onNext,
  keywords = [],
  onWordClick
}) {
  function renderWithKeywordHighlight(line) {
    if (!keywords || keywords.length === 0) return [line];

    const sorted = [...keywords].sort((a, b) => b.word.length - a.word.length);
    let result = [];
    let remaining = line;

    while (remaining.length > 0) {
      let matched = false;
      for (let k of sorted) {
        if (remaining.startsWith(k.word)) {
          result.push(
            <span
              key={result.length}
              className="underline decoration-dotted cursor-pointer text-inherit hover:bg-blue-100 px-1"
              onClick={(e) => {
                e.stopPropagation(); // 阻止冒泡防止触发句子点击
                onWordClick(k.word);
              }}
            >
              {k.word}
            </span>
          );
          remaining = remaining.slice(k.word.length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        result.push(remaining[0]);
        remaining = remaining.slice(1);
      }
    }

    return result;
  }

  return (
    <>
      <div className="w-full flex justify-center">
        <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-xl shadow p-8">
          <div className="text-left mb-10">
            <h2 className="text-2xl font-bold text-indigo-600 mb-1">{newsData.title}</h2>
            <div className="text-xs text-gray-500">
              {new Date(newsData.time).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
              ・
              <a
                href={newsData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-600 ml-1"
              >
                NewsSite
              </a>
            </div>
          </div>

          <div className="space-y-4 text-gray-800">
            {sentences.map((sentence, i) => (
              <p
                key={i}
                className="text-base leading-relaxed cursor-pointer hover:bg-yellow-100 rounded px-2 py-1 transition"
                onClick={() => onSentenceClick(sentence)}
              >
                {renderWithKeywordHighlight(sentence)}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4 justify-center">
        <ModernButton variant="green" onClick={onNext}>
          次のニュースへ
        </ModernButton>
        <ModernButton variant="gray" onClick={onBack}>
          戻る
        </ModernButton>
      </div>
    </>
  );
}

export default OriginalText;
