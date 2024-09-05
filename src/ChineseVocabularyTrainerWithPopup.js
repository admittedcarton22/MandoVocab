import React, { useState, useEffect, useRef } from "react";
import { vocabularyGroups, sentenceGroups } from "./vocabularyData";

const Button = ({ children, className, ...props }) => (
  <button className={`px-3 py-1.5 rounded text-sm ${className}`} {...props}>
    {children}
  </button>
);

const PopupCard = ({ word, onClose }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2">{word.character}</h2>
        <p className="text-lg mb-2">{word.pinyin}</p>
        <p className="mb-2">{word.english}</p>
        <div className="mb-2">
          <button
            onClick={playAudio}
            className="bg-blue-500 text-white px-2 py-1 rounded"
          >
            Play Audio
          </button>
          <audio ref={audioRef} src={`/audio/${word.character}.mp3`} />
        </div>
        <div className="mb-2">
          <h3 className="font-bold">Example Sentences:</h3>
          <ul className="list-disc list-inside">
            {word.exampleSentences &&
              word.exampleSentences.map((sentence, index) => (
                <li key={index}>
                  <p>{sentence.chinese}</p>
                  <p>{sentence.pinyin}</p>
                  <p>{sentence.english}</p>
                </li>
              ))}
          </ul>
        </div>
        <button onClick={onClose} className="bg-gray-300 px-2 py-1 rounded">
          Close
        </button>
      </div>
    </div>
  );
};

const HowToStudyModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">How to Study Effectively</h2>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>Focus on one group per day, reviewing previous days' words.</li>
          <li>Click on a word once to focus it (blue outline).</li>
          <li>
            Click again or press 'D' to show word details and example sentences.
          </li>
          <li>
            Use the 'G' key for words you recognize instantly (turns green).
          </li>
          <li>
            Use the 'R' key for words you need to review more (turns red).
          </li>
          <li>Press 'S' to hear the pronunciation of the focused word.</li>
          <li>Practice writing the characters to reinforce memory.</li>
          <li>Create sentences using new words to understand context.</li>
          <li>Review red-marked words more frequently.</li>
          <li>Set a daily study goal and track your progress.</li>
        </ul>
        <Button onClick={onClose} className="bg-blue-500 text-white">
          Close
        </Button>
      </div>
    </div>
  );
};

const ChineseVocabularyTrainerWithPopup = () => {
  const [currentMode, setCurrentMode] = useState("vocabulary");
  const [knownWords, setKnownWords] = useState({});
  const [selectedWord, setSelectedWord] = useState(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [focusedWordId, setFocusedWordId] = useState(null);
  const [showHowToStudy, setShowHowToStudy] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const savedStates = localStorage.getItem("knownWords");
    if (savedStates) {
      setKnownWords(JSON.parse(savedStates));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("knownWords", JSON.stringify(knownWords));
  }, [knownWords]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [focusedWordId, currentMode]);

  const playAudio = (character) => {
    if (audioRef.current) {
      audioRef.current.src = `/audio/${character}.mp3`;
      audioRef.current.play();
    }
  };

  const handleKeyPress = (e) => {
    if (!focusedWordId) return;

    const [day, groupIndex, wordIndex] = focusedWordId.split("-").map(Number);
    const word =
      currentMode === "vocabulary"
        ? vocabularyGroups[groupIndex].words[wordIndex]
        : sentenceGroups[groupIndex].words[wordIndex];

    switch (e.key.toLowerCase()) {
      case "g":
        setKnownWords((prev) => ({ ...prev, [focusedWordId]: "known" }));
        break;
      case "r":
        setKnownWords((prev) => ({ ...prev, [focusedWordId]: "unknown" }));
        break;
      case "d":
        setSelectedWord((prev) => (prev ? null : word));
        break;
      case "s":
        playAudio(word.character);
        break;
    }
  };

  const handleWordClick = (word, wordId) => {
    if (focusedWordId === wordId) {
      setSelectedWord(word);
    } else {
      setFocusedWordId(wordId);
      setSelectedWord(null);
    }
  };

  const resetEverything = () => {
    setKnownWords({});
    localStorage.removeItem("knownWords");
  };

  const resetCurrentDay = () => {
    const updatedKnownWords = { ...knownWords };
    Object.keys(updatedKnownWords).forEach((key) => {
      if (key.startsWith(`${currentDay}-`)) {
        delete updatedKnownWords[key];
      }
    });
    setKnownWords(updatedKnownWords);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto text-base">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <Button
            className={`${
              currentMode === "vocabulary"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setCurrentMode("vocabulary")}
          >
            Chinese List 1
          </Button>
          <Button
            className={`${
              currentMode === "sentences"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => setCurrentMode("sentences")}
          >
            Practice Sentences
          </Button>
          <Button
            className="bg-green-500 text-white"
            onClick={() => setShowHowToStudy(true)}
          >
            How to Study
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button
            className="bg-yellow-500 text-white"
            onClick={resetCurrentDay}
          >
            Clear Current Day
          </Button>
          <Button className="bg-red-500 text-white" onClick={resetEverything}>
            Reset All Progress
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-center mb-2">Day {currentDay} of 30</p>
        <input
          type="range"
          min="1"
          max="30"
          value={currentDay}
          onChange={(e) => setCurrentDay(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-6 gap-4">
        {(currentMode === "vocabulary" ? vocabularyGroups : sentenceGroups)
          .slice(0, currentDay)
          .map((group, groupIndex) => (
            <div key={groupIndex} className="break-inside-avoid">
              <h3 className="font-bold mb-2 text-lg">{group.name}</h3>
              {group.words.map((word, wordIndex) => {
                const wordId = `${currentDay}-${groupIndex}-${wordIndex}`;
                const isSelected = focusedWordId === wordId;
                return (
                  <div
                    key={wordIndex}
                    className={`p-2 mb-1 cursor-pointer ${
                      isSelected ? "outline outline-2 outline-blue-500 " : ""
                    }${
                      knownWords[wordId] === "known"
                        ? "bg-green-200"
                        : knownWords[wordId] === "unknown"
                        ? "bg-red-200"
                        : ""
                    }`}
                    onClick={() => handleWordClick(word, wordId)}
                    tabIndex={0}
                  >
                    <div className="font-normal">
                      {currentMode === "vocabulary"
                        ? `${word.character} (${word.pinyin})`
                        : word.chinese}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
      </div>

      {selectedWord && (
        <PopupCard word={selectedWord} onClose={() => setSelectedWord(null)} />
      )}

      {showHowToStudy && (
        <HowToStudyModal onClose={() => setShowHowToStudy(false)} />
      )}

      <audio ref={audioRef} />

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>Coming Soon</p>
      </div>
    </div>
  );
};

export default ChineseVocabularyTrainerWithPopup;
