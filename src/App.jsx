import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [wordList , setWordList] = useState([]);
  const [solution , setSolution] = useState('');
  const [guesses , setGuesses] = useState([]);
  const [currentGuess , setCurrentGuess] = useState('');
  const [isGameOver , setIsGameOver] = useState(false);
  const [loading , setLoading] = useState(false);
  const [hasWon , setHasWon] = useState(false);

  const handleRestart = (e) => {
    e.currentTarget.blur();
    setGuesses([]);
    setCurrentGuess('');
    setIsGameOver(false);
    setSolution('');
    fetchWord();
  }
  //Fetching a random word
  const fetchWord = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://random-word-api.herokuapp.com/all');
      const data = await res.json();
      const filtered = data.filter((word) => word.length === 5  && /^[a-zA-Z]+$/.test(word));
      setWordList(filtered);
      const randomWord = filtered[Math.floor(Math.random() * filtered.length)].toLowerCase();
      setSolution(randomWord);
      setLoading(false);
      console.log(randomWord);
    } catch (error) {
      console.log("An error occured" , error);
    }
  }

  useEffect(() => {
    fetchWord();
  } , []);


  //Handing keyboard presses
  useEffect(() =>{
    if(loading || isGameOver) return;
    const handleKeyPress = (e) =>{
      const key = e.key.toLowerCase();
      if(/^[a-zA-Z]$/.test(key) && currentGuess.length < 5){
        setCurrentGuess((prev) => prev + key);
      }
      else if(key === 'backspace'){
        setCurrentGuess((prev) => prev.slice(0 , -1));
      }
      else if(key === 'enter' && currentGuess.length === 5){
        if(!wordList.includes(currentGuess)){
          alert("Not a valid word");
          return;
        }

        setGuesses((prev) => [...prev , currentGuess]);
        if(currentGuess === solution){
          setIsGameOver(true);
          setHasWon(true);
        }
        else if(guesses.length === 5){
          setIsGameOver(true);
        }
        setCurrentGuess('');
      }
    };

    window.addEventListener('keydown' , handleKeyPress);
    return () => window.removeEventListener('keydown' , handleKeyPress);
  } , [guesses , currentGuess , solution]);

  return (
    <div>
      <h1>Wordle</h1>
      {loading && <p>Loading...</p>}
      <p>{isGameOver ? (hasWon ? 'You Won!' : 'You Lost!') : 'Type a 5 letter word!'}</p>

      {guesses.map((guess , i) => (
        <div key={i}>
          {guess.split('').map((letter , j) => {
            let color = 'grey';
            if(solution[j] === letter) color = 'green';
            else if(solution.includes(letter)) color = 'yellow';
            return (
              <span key={j} className={`tile ${color}`}>
                {letter.toUpperCase()}
              </span>
            );
          })}
        </div>
      ))}

      {!isGameOver && (
        <div className='guess-row'>
          {[0,1,2,3,4].map((j) => (
            <span key={j} className='tile'>
              {(currentGuess[j] || '').toUpperCase()}
            </span>
          ))}
        </div>
      )}


    {Array.from({length : 6 - guesses.length - (isGameOver ? 0 : 1)}).map((_ , i) => (
      <div key={i} className='guess-row'>
        {[0,1,2,3,4].map((j) => (
          <span key={j} className='tile'>
            {' '}
          </span>
        ))}
      </div>
    ))}

    {isGameOver ? (!hasWon ? <p>Word was : {solution}</p>: '') : ''}

    <button onClick={handleRestart} className='restart-btn'>Restart</button>
    </div>
  )
}

export default App;
