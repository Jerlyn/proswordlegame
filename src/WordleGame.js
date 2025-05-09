import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import './WordleGame.css';

// List of words related to prostate cancer
const WORDS = [
  "MHSPC", "READY", "BRAND", "BAYER", "QUANT", 
  "CHEMO", "TUMOR", "STOCK", "PRINT", "COLOR", "TRIAL"
];

// Hints for each word
const HINTS = {
  "MHSPC": "Abbreviation for metastatic hormone-sensitive prostate cancer",
  "READY": "Prepared or available for treatment",
  "BRAND": "A type of product manufactured by a particular company",
  "BAYER": "A pharmaceutical company that develops cancer treatments",
  "QUANT": "Quantitative analysis often used in cancer research",
  "CHEMO": "A type of cancer treatment using drugs to kill cancer cells",
  "TUMOR": "An abnormal growth of tissue that can be malignant",
  "STOCK": "Shares in the ownership of a company",
  "PRINT": "To produce text or images on paper",
  "COLOR": "A property of objects related to light reflection",
  "TRIAL": "A clinical research study to evaluate medical treatments"
};

// Game states
const GameState = {
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost'
};

// Letter states
const LetterState = {
  CORRECT: 'correct',
  PRESENT: 'present',
  ABSENT: 'absent',
  UNKNOWN: 'unknown'
};

const WordleGame = () => {
  const [secretWord, setSecretWord] = useState('');
  const [guesses, setGuesses] = useState(Array(6).fill(''));
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [gameState, setGameState] = useState(GameState.PLAYING);
  const [keyboardStatus, setKeyboardStatus] = useState({});
  const [showHint, setShowHint] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  
  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);
  
  const startNewGame = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setSecretWord(randomWord);
    setGuesses(Array(6).fill(''));
    setCurrentGuess('');
    setCurrentRow(0);
    setGameState(GameState.PLAYING);
    setKeyboardStatus({});
    setShowHint(false);
    setUsedHint(false);
    setMessage('');
    setShowMessage(false);
  };
  
  const displayMessage = (text, duration = 3000) => {
    setMessage(text);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, duration);
  };
  
  const checkGuess = (guess) => {
    const result = Array(guess.length).fill(LetterState.ABSENT);
    const secretWordArray = secretWord.split('');
    
    // Check for correct positions
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === secretWordArray[i]) {
        result[i] = LetterState.CORRECT;
        secretWordArray[i] = null; // Mark as used
      }
    }
    
    // Check for correct letters in wrong positions
    for (let i = 0; i < guess.length; i++) {
      if (result[i] === LetterState.ABSENT) {
        const index = secretWordArray.indexOf(guess[i]);
        if (index !== -1) {
          result[i] = LetterState.PRESENT;
          secretWordArray[index] = null; // Mark as used
        }
      }
    }
    
    return result;
  };
  
  const updateKeyboardStatus = (guess, result) => {
    const newStatus = { ...keyboardStatus };
    
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      const currentStatus = newStatus[letter] || LetterState.UNKNOWN;
      
      // Only upgrade status, never downgrade
      if (currentStatus !== LetterState.CORRECT) {
        if (result[i] === LetterState.CORRECT) {
          newStatus[letter] = LetterState.CORRECT;
        } else if (result[i] === LetterState.PRESENT && currentStatus !== LetterState.CORRECT) {
          newStatus[letter] = LetterState.PRESENT;
        } else if (result[i] === LetterState.ABSENT && currentStatus === LetterState.UNKNOWN) {
          newStatus[letter] = LetterState.ABSENT;
        }
      }
    }
    
    setKeyboardStatus(newStatus);
  };
  
  const handleKeyPress = useCallback((event) => {
    if (gameState !== GameState.PLAYING) return;
    
    const key = event.key.toUpperCase();
    
    if (key === 'ENTER') {
      if (currentGuess.length === secretWord.length) {
        // Save the current guess
        const newGuesses = [...guesses];
        newGuesses[currentRow] = currentGuess;
        setGuesses(newGuesses);
        
        // Check the guess
        const result = checkGuess(currentGuess);
        updateKeyboardStatus(currentGuess, result);
        
        // Check for win or loss
        if (currentGuess === secretWord) {
          setGameState(GameState.WON);
          displayMessage('Congratulations! You won!');
        } else if (currentRow === 5) {
          setGameState(GameState.LOST);
          displayMessage(`Game over! The word was ${secretWord}`);
        } else {
          setCurrentRow(currentRow + 1);
          setCurrentGuess('');
        }
      } else {
        displayMessage('Not enough letters');
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < secretWord.length) {
      setCurrentGuess(currentGuess + key);
    }
  }, [currentGuess, currentRow, gameState, guesses, secretWord]);
  
  // Listen for keyboard events
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
  
  const handleVirtualKeyPress = (key) => {
    if (gameState !== GameState.PLAYING) return;
    
    if (key === 'ENTER') {
      if (currentGuess.length === secretWord.length) {
        // Save the current guess
        const newGuesses = [...guesses];
        newGuesses[currentRow] = currentGuess;
        setGuesses(newGuesses);
        
        // Check the guess
        const result = checkGuess(currentGuess);
        updateKeyboardStatus(currentGuess, result);
        
        // Check for win or loss
        if (currentGuess === secretWord) {
          setGameState(GameState.WON);
          displayMessage('Congratulations! You won!');
        } else if (currentRow === 5) {
          setGameState(GameState.LOST);
          displayMessage(`Game over! The word was ${secretWord}`);
        } else {
          setCurrentRow(currentRow + 1);
          setCurrentGuess('');
        }
      } else {
        displayMessage('Not enough letters');
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < secretWord.length) {
      setCurrentGuess(currentGuess + key);
    }
  };
  
  const getLetterState = (row, col) => {
    if (row > currentRow || (row === currentRow && !guesses[row])) {
      return LetterState.UNKNOWN;
    }
    
    if (row === currentRow && !guesses[row]) {
      return LetterState.UNKNOWN;
    }
    
    const guess = row === currentRow && !guesses[row] 
      ? currentGuess.padEnd(secretWord.length, ' ') 
      : guesses[row];
    
    if (row < currentRow || guesses[row]) {
      const result = checkGuess(guess);
      return result[col];
    }
    
    return LetterState.UNKNOWN;
  };
  
  const renderBoard = () => {
    return (
      <div className="board" role="grid" aria-label="Wordle game board">
        {Array(6).fill(null).map((_, row) => (
          <React.Fragment key={`row-${row}`}>
            {Array(5).fill(null).map((_, col) => {
              const letterState = getLetterState(row, col);
              const letter = row === currentRow && col < currentGuess.length 
                ? currentGuess[col] 
                : guesses[row] && col < guesses[row].length 
                  ? guesses[row][col] 
                  : '';
              
              let cellClass = 'cell';
              
              if (letterState === LetterState.CORRECT) {
                cellClass += ' correct';
              } else if (letterState === LetterState.PRESENT) {
                cellClass += ' present';
              } else if (letterState === LetterState.ABSENT && letter) {
                cellClass += ' absent';
              }
              
              return (
                <div
                  key={`cell-${row}-${col}`}
                  className={cellClass}
                  role="cell"
                  aria-label={letter ? `${letter}, ${letterState}` : 'empty'}
                >
                  {letter}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  const renderKeyboard = () => {
    const rows = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
    ];
    
    return (
      <div className="keyboard" role="group" aria-label="Virtual keyboard">
        {rows.map((row, rowIndex) => (
          <div key={`kbrow-${rowIndex}`} className="keyboard-row">
            {row.map((key) => {
              let keyClass = 'key';
              
              if (key === 'ENTER' || key === 'BACKSPACE') {
                keyClass += ' wide';
              }
              
              if (keyboardStatus[key] === LetterState.CORRECT) {
                keyClass += ' correct';
              } else if (keyboardStatus[key] === LetterState.PRESENT) {
                keyClass += ' present';
              } else if (keyboardStatus[key] === LetterState.ABSENT) {
                keyClass += ' absent';
              }
              
              return (
                <button
                  key={`key-${key}`}
                  className={keyClass}
                  onClick={() => handleVirtualKeyPress(key)}
                  aria-label={key === 'BACKSPACE' ? 'Delete' : key}
                >
                  {key === 'BACKSPACE' ? '←' : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };
  
  const toggleHint = () => {
    if (!usedHint) {
      setUsedHint(true);
    }
    setShowHint(!showHint);
  };
  
  return (
    <div className="wordle-container">
      <header className="wordle-header">
        <h1>Prostate Cancer Awareness Wordle</h1>
        <p>Guess the prostate cancer-related word in six tries</p>
      </header>
      
      <div className="wordle-content">
        {/* Message display */}
        {showMessage && (
          <div className="message">
            {message}
          </div>
        )}
        
        {/* Game board */}
        {renderBoard()}
        
        {/* Controls */}
        <div className="controls">
          <button 
            onClick={startNewGame}
            className="button"
            aria-label="Start new game"
          >
            New Game
          </button>
          
          <button 
            onClick={toggleHint}
            className={`button ${usedHint ? 'hint-button' : ''}`}
            aria-label={showHint ? "Hide hint" : "Show hint"}
            aria-expanded={showHint}
          >
            <Info size={16} /> 
            {showHint ? "Hide Hint" : "Show Hint"}
          </button>
        </div>
        
        {/* Hint display */}
        {showHint && (
          <div className="hint" role="alert">
            <h2>
              <AlertCircle size={20} />
              Hint
            </h2>
            <p>{HINTS[secretWord]}</p>
          </div>
        )}
        
        {/* Keyboard */}
        {renderKeyboard()}
        
        {/* Game status */}
        {gameState !== GameState.PLAYING && (
          <div className={`game-status ${gameState === GameState.WON ? 'won' : 'lost'}`}>
            {gameState === GameState.WON ? (
              <p>Congratulations! You guessed the word {secretWord}!</p>
            ) : (
              <p>Game over! The word was {secretWord}.</p>
            )}
          </div>
        )}
        
        {/* Instructions */}
        <div className="instructions">
          <h2>How to Play</h2>
          <ul>
            <li>Guess the WORDLE in six tries.</li>
            <li>Each guess must be a valid 5-letter word related to prostate cancer.</li>
            <li>After each guess, the color of the tiles will change to show how close your guess was to the word.</li>
            <li>Green: The letter is in the word and in the correct spot.</li>
            <li>Yellow: The letter is in the word but in the wrong spot.</li>
            <li>Gray: The letter is not in the word.</li>
            <li>Use the hint button if you need help.</li>
          </ul>
        </div>
        
        {/* Accessibility notes */}
        <div className="accessibility-note">
          <p>This game is designed to be accessible to all users, including those using screen readers. All game elements have appropriate ARIA labels. The game can be played entirely with a keyboard.</p>
        </div>
      </div>
    </div>
  );
};

export default WordleGame;