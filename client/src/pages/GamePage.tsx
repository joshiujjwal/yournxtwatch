import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { ArrowLeft, Users, Film } from 'lucide-react';
import WaitingRoom from '../components/WaitingRoom';
import GenreSelection from '../components/GenreSelection';
import MovieSwiper from '../components/MovieSwiper';
import WaitingForOthers from '../components/WaitingForOthers'
import GameResults from '../components/GameResults';

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const { game, currentPlayer, setPlayerGenres, swipeMovie, error, clearError } = useGame();
  const { roomCode } = useParams();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    if (game && game.status === 'finished') {
      // Game is finished, show results
      return;
    }
  }, [game]);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleReady = async () => {
    if (selectedGenres.length === 0) return;
    console.log('Setting player genres:', selectedGenres);
    try {
      await setPlayerGenres(selectedGenres);
      console.log('Player genres set successfully');
    } catch (error) {
      console.error('Failed to set player genres:', error);
    }
  };

  const handleSwipe = async (liked: boolean) => {
    if (!game || !game.movies[currentMovieIndex] || isSwiping) return;
    
    setIsSwiping(true);
    await swipeMovie(game.movies[currentMovieIndex].id, liked);
    setCurrentMovieIndex(prev => prev + 1);
    setIsSwiping(false);
  };

  const currentMovie = game?.movies[currentMovieIndex];
  const isGameFinished = game?.status === 'finished';
  const hasFinishedSwiping = currentMovieIndex >= (game?.movies.length || 0);
  // Check if current player has genres set in the game state
  const currentPlayerInGame = game?.players.find(p => p.id === currentPlayer?.id);
  const needsGenreSelection = !currentPlayerInGame?.genres || currentPlayerInGame.genres.length === 0;

  console.log('GamePage state:', {
    gameStatus: game?.status,
    currentPlayerGenres: currentPlayer?.genres,
    currentPlayerInGame: currentPlayerInGame,
    needsGenreSelection,
    selectedGenres,
    movieCount: game?.movies?.length,
    currentMovie,
    currentMovieIndex,
    hasFinishedSwiping
  });

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col homepage-container">
        <div className="flex-grow flex items-center justify-center text-center p-8">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-white">Loading game...</p>
          </div>
        </div>
      </div>
    );
  }

  // Use WaitingRoom component when game is in waiting status
  if (game.status === 'waiting') {
    return (
      <div className="min-h-screen flex flex-col homepage-container">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap px-10 py-5 bg-[#2C2C54] border-b-4 border-[#FF6B6B]">
          <div className="flex items-center gap-4 text-[#FFFFFF]">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:text-[#4A90E2] transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              <span>Back to Home</span>
            </button>
          </div>
          <div className="flex items-center gap-4 text-[#FFFFFF]">
            <h2 className="text-2xl font-bold">Room: {game.roomCode}</h2>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#4A90E2]" />
              <span className="font-medium">{game.players.length} Players</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex items-center justify-center text-center p-8">
          <WaitingRoom 
            title="Waiting for Game to Start"
            subtitle="The host will start the game when everyone is ready!"
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col homepage-container">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap px-10 py-5 bg-[#2C2C54] border-b-4 border-[#FF6B6B]">
        <div className="flex items-center gap-4 text-[#FFFFFF]">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:text-[#4A90E2] transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Back to Home</span>
          </button>
        </div>
        <div className="flex items-center gap-4 text-[#FFFFFF]">
          <h2 className="text-2xl font-bold">Room: {game.roomCode}</h2>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#4A90E2]" />
            <span className="font-medium">{game.players.length} Players</span>
            {game.status === 'playing' && (
              <>
                <Film className="w-5 h-5 text-[#F5A623]" />
                <span className="font-medium">
                  {game.players.filter(p => p.hasFinished).length}/{game.players.length} Finished
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center text-center p-8">
        <div className="flex flex-col items-center gap-8 max-w-4xl w-full">
          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-500/20 border-4 border-red-500/30 rounded-lg text-red-300">
              {error}
              <button onClick={clearError} className="ml-2 underline">Dismiss</button>
            </div>
          )}

          {/* Genre Selection */}
          {needsGenreSelection && game.status === 'playing' && (
            <GenreSelection
              selectedGenres={selectedGenres}
              onGenreToggle={handleGenreToggle}
              onReady={handleReady}
            />
          )}

          {/* Movie Swiping */}
          {!needsGenreSelection && game.status === 'playing' && game.movies.length > 0 && currentMovie && !hasFinishedSwiping && (
            <MovieSwiper
              currentMovie={currentMovie}
              currentMovieIndex={currentMovieIndex}
              totalMovies={game.movies.length}
              players={game.players}
              currentPlayerId={currentPlayer?.id}
              isSwiping={isSwiping}
              onSwipe={handleSwipe}
            />
          )}

          {/* Waiting for Others */}
          {!needsGenreSelection && hasFinishedSwiping && !isGameFinished && (
            <WaitingForOthers players={game.players} />
          )}

          {/* Game Results */}
          {isGameFinished && (
            <GameResults topPicks={game.topPicks || []} />
          )}
        </div>
      </main>
    </div>
  );
};

export default GamePage; 