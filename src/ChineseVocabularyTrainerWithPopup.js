import React, { useState, useEffect, useRef } from 'react';
import { vocabularyGroups, sentenceGroups } from './vocabularyData';

const Button = ({ children, className, ...props }) => (
  <button className={`px-2 py-1 rounded ${className}`} {...props}>
    {children}
  </button>
);

const PopupCard = ({ word, onClose }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
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
          <button onClick={playAudio} className="bg-blue-500 text-white px-2 py-1 rounded">
            Play Audio
          </button>
          <audio ref={audioRef} src={`/audio/${word.character}.mp3`} />
        </div>
        <div className="mb-2">
          <h3 className="font-bold">Example Sentences:</h3>
          <ul className="list-disc list-inside">
            {word.exampleSentences && word.exampleSentences.map((sentence, index) => (
              <li key={index}>
                <p>{sentence.chinese}</p>
                <p>{sentence.pinyin}</p>
                <p>{sentence.english}</p>
              </li>
            ))}
          </ul>
        </div>
        <button onClick={onClose} className="bg-gray-300 px-2 py-1 rounded">Close</button>
      </div>
    </div>
  );
};

const ChineseVocabularyTrainerWithPopup = () => {
  const [currentMode, setCurrentMode] = useState('vocabulary');
  const [knownWords, setKnownWords] = useState({});
  const [selectedWord, setSelectedWord] = useState(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [focusedWordId, setFocusedWordId] = useState(null);

  useEffect(() => {
    // Load saved states from localStorage when component mounts
    const savedStates = localStorage.getItem('knownWords');
    if (savedStates) {
      setKnownWords(JSON.parse(savedStates));
    }
  }, []);

  useEffect(() => {
    // Save states to localStorage whenever knownWords changes
    localStorage.setItem('knownWords', JSON.stringify(knownWords));
  }, [knownWords]);

  const handleKeyPress = (groupIndex, wordIndex, e) => {
    const wordId = `${currentDay}-${groupIndex}-${wordIndex}`;
    const word = currentMode === 'vocabulary' 
      ? vocabularyGroups[groupIndex].words[wordIndex]
      : sentenceGroups[groupIndex].words[wordIndex];
    switch(e.key) {
      case 'g':
        setKnownWords(prev => ({...prev, [wordId]: 'known'}));
        break;
      case 'r':
        setKnownWords(prev => ({...prev, [wordId]: 'unknown'}));
        break;
      case 'd':
        if (focusedWordId === wordId) {
          setSelectedWord(selectedWord ? null : word);
        }
        break;
    }
  };

  const handleWordClick = (word, wordId) => {
    if (focusedWordId === wordId) {
      setSelectedWord(selectedWord && selectedWord.character === word.character ? null : word);
    } else {
      setFocusedWordId(wordId);
    }
  };

  const resetEverything = () => {
    setKnownWords({});
    localStorage.removeItem('knownWords');
  };

  return (
    <div className="p-2 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Button 
            className={`${currentMode === 'vocabulary' ? 'bg-blue-500 text-white' : 'bg-gray-200'} text-xs`}
            onClick={() => setCurrentMode('vocabulary')}
          >
            Chinese List 1
          </Button>
          <Button 
            className={`${currentMode === 'sentences' ? 'bg-blue-500 text-white' : 'bg-gray-200'} text-xs`}
            onClick={() => setCurrentMode('sentences')}
          >
            Practice Sentences
          </Button>
        </div>
        <Button className="bg-blue-500 text-white text-xs" onClick={resetEverything}>Reset Everything</Button>
      </div>

      <div className="mb-4">
        <p className="text-center mb-2 text-sm">Day {currentDay} of 30</p>
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
        {(currentMode === 'vocabulary' ? vocabularyGroups : sentenceGroups).slice(0, currentDay).map((group, groupIndex) => (
          <div key={groupIndex} className="break-inside-avoid">
            <h3 className="font-bold mb-1 text-sm">{group.name}</h3>
            {group.words.map((word, wordIndex) => {
              const wordId = `${currentDay}-${groupIndex}-${wordIndex}`;
              return (
                <div 
                  key={wordIndex} 
                  className={`p-1 mb-0.5 cursor-pointer text-xs ${
                    knownWords[wordId] === 'known' ? 'bg-green-200' :
                    knownWords[wordId] === 'unknown' ? 'bg-red-200' :
                    focusedWordId === wordId ? 'outline outline-2 outline-blue-500' : ''
                  }`}
                  onClick={() => handleWordClick(word, wordId)}
                  onKeyDown={(e) => handleKeyPress(groupIndex, wordIndex, e)}
                  tabIndex={0}
                >
                  <div className="font-normal">
                    {currentMode === 'vocabulary' 
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

      <div className="mt-4 text-center text-xs text-gray-600">
        <p>Click on a word to focus it, then click again or press 'D' to show its details.</p>
        <p>Press 'G' if you recognized the word without needing to check the definition.</p>
        <p>Press 'R' if you didn't recognize the word and needed to check the definition.</p>
      </div>
    </div>
  );
};

export default ChineseVocabularyTrainerWithPopup;