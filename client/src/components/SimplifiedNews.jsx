import React from "react";
import ModernButton from "./ModernButton";

function SimplifiedNews({
  newsData,
  onWordClick,
  showQuestion,
  answerSelected,
  currentIndex,
  onStartQuestion,
  onPrevious,
  onNext,
  keywords = [],
}) {
  function cleanLineForParagraph(line) {
    return line
      .trimStart()
      .replace(/^(\*+|→|→\*+|\*+→)+\s*/g, "")
      .replace(/^・/g, "")
      .trimEnd();
  }

  function cleanLineForListItem(line) {
    return line
      .replace(/^(\*+|→|\*+→)+\s*/g, "")
      .replace(/^・/g, "")
      .replace(/^[-*]\s*/, "")
      .trim();
  }

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
              onClick={() => onWordClick(k.word)}
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
    <div className="w-full max-w-4xl">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg transition">
        <div className="p-6 sm:p-8">
          {/* --- タイトル & 日付 --- */}
          <div className="relative inline-block text-center mb-10">
            <h2 className="text-2xl font-bold text-indigo-600">{newsData.title}</h2>
            <div className="absolute -bottom-5 left-0 text-xs text-gray-500">
              {new Date(newsData.time).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
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

          {/* --- 内容 --- */}
          <div className="text-gray-800 space-y-6 mt-6">
            {/* ここがポイント */}
            <div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">ここがポイント</h3>
              {cleanLineForParagraph(newsData.simplified?.why)
                .split("\n")
                .map((line) => cleanLineForParagraph(line))
                .filter((line) => line.trim())
                .map((line, i) => (
                  <p key={"why-" + i} className="text-base leading-relaxed">
                    {renderWithKeywordHighlight(line)}
                  </p>
                ))}
            </div>

            {/* いま おきていること */}
            <div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">いま おきていること</h3>
              <ul className="list-disc pl-6 space-y-2">
                {(newsData.simplified?.what || "")
                  .replace(/\n/g, "")
                  .split(/(?<=[。！？])/)
                  .map((line) => cleanLineForListItem(line))
                  .filter((line) => line.length > 3)
                  .map((sentence, i) => (
                    <li key={"what-" + i} className="text-base leading-relaxed">
                      {renderWithKeywordHighlight(sentence)}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>

        {/* --- 按钮 --- */}
        {!showQuestion && (
          <div className="flex justify-center items-center gap-4 border-t border-gray-100 bg-gray-50 px-6 py-4">
            {!answerSelected ? (
              <>
                <ModernButton variant="green" onClick={onStartQuestion}>
                  問題に進む
                </ModernButton>
                {currentIndex > 0 && (
                  <ModernButton variant="gray" onClick={onPrevious}>
                    前のニュースへ
                  </ModernButton>
                )}
              </>
            ) : (
              <ModernButton variant="green" onClick={onNext}>
                次のニュースへ
              </ModernButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SimplifiedNews;
