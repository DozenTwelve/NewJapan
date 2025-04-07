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
      .replace(/^(\*+|→|→\*+|\*+→)+\s*/g, "")
      .replace(/^・/g, "")
      .replace(/^[-*]\s*/, "")
      .trim();
  }

  function renderWithClickableKanji(line) {
    const regex = /[\u4E00-\u9FFF]{2,}|[\u4E00-\u9FFF][ぁ-んァ-ン]+/g;

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      const { index } = match;
      const word = match[0];

      if (index > lastIndex) {
        parts.push(line.slice(lastIndex, index));
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

  return (
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
                .map((line) => cleanLineForParagraph(line))
                .filter((line) => line.trim())
                .map((line, i) => (
                  <p key={"why-" + i} className="text-base leading-relaxed">
                    {renderWithClickableKanji(line)}
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
                      {renderWithClickableKanji(sentence)}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>

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