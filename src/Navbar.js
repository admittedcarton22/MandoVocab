import React from 'react';
import { levels } from './vocabularyData';

const Navbar = ({ currentLevel, setCurrentLevel }) => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white font-bold text-xl">Chinese Vocabulary Trainer</div>
        <div className="flex space-x-4">
          {levels.map((level) => (
            <button
              key={level.id}
              className={`text-white ${currentLevel === level.id ? 'font-bold' : ''}`}
              onClick={() => setCurrentLevel(level.id)}
            >
              {level.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;