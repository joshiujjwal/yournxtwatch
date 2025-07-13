import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { DEFAULT_GAME_CONFIG } from '../../../shared/src/index.ts';
import { ArrowLeft, Users, Play, CheckCircle, XCircle, User, Film } from 'lucide-react';

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const { game, currentPlayer, setPlayerGenres, swipeMovie, startGame, error, clearError } = useGame();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

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

  const handleStartGame = async () => {
    if (!game) return;
    setIsStarting(true);
    try {
      await startGame();
    } catch (err) {
      console.error('Failed to start game:', err);
    } finally {
      setIsStarting(false);
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
  const canStartGame = game && game.status === 'waiting' && game.players.length > 0;

  console.log('GamePage state:', {
    gameStatus: game?.status,
    currentPlayerGenres: currentPlayer?.genres,
    currentPlayerInGame: currentPlayerInGame,
    needsGenreSelection,
    canStartGame,
    selectedGenres,
    movieCount: game?.movies?.length,
    currentMovie,
    currentMovieIndex,
    hasFinishedSwiping
  });

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-white">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-surface/50 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">Room: {game.roomCode}</h1>
              <p className="text-sm text-gray-400">
                {game.players.length} players • {game.status} • Host: {game.players[0]?.name}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-white font-medium">{game.players.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="bg-surface/30 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-400" />
                <span className="text-white">{game.players.length} Players</span>
              </div>
              {game.status === 'playing' && (
                <div className="flex items-center space-x-2">
                  <Film className="w-4 h-4 text-purple-400" />
                  <span className="text-white">
                    {game.players.filter(p => p.hasFinished).length}/{game.players.length} Finished
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-300">
            {error}
            <button onClick={clearError} className="ml-2 underline">Dismiss</button>
          </div>
        </div>
      )}

      {/* Game Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Genre Selection - For all players when game is playing */}
        {needsGenreSelection && game.status === 'playing' && (
          <div className="max-w-2xl mx-auto">
            <div className="card mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Choose Your Favorite Genres
              </h2>
              <p className="text-gray-300 mb-6">
                Select the movie genres you enjoy most to get personalized movie recommendations!
              </p>
              
              <div className="genre-grid">
                {DEFAULT_GAME_CONFIG.genres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => handleGenreToggle(genre)}
                    className={`genre-item ${
                      selectedGenres.includes(genre) ? 'selected' : ''
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>

              <button
                onClick={handleReady}
                disabled={selectedGenres.length === 0}
                className="btn btn-primary w-full mt-6"
              >
                Start Swiping!
              </button>
            </div>
          </div>
        )}

        {/* Host Start Game Button - Only show to game creator when they haven't selected genres */}
        {game.status === 'waiting' && currentPlayer?.id === game.players[0]?.id && !needsGenreSelection && (
          <div className="max-w-md mx-auto text-center">
            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-4">
                Ready to Start?
              </h2>
              <p className="text-gray-300 mb-6">
                Click to start the game for all players!
              </p>
              <button
                onClick={handleStartGame}
                disabled={isStarting}
                className="btn btn-success w-full"
              >
                {isStarting ? 'Starting...' : 'Start Game'}
              </button>
            </div>
          </div>
        )}

        {/* Waiting Area for players who haven't selected genres yet */}
        {game.status === 'waiting' && !needsGenreSelection && (
          <div className="max-w-md mx-auto text-center">
            <div className="card">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Play className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Waiting for Game to Start
                </h2>
                <p className="text-gray-300 mb-6">
                  The host will start the game soon...
                </p>
                
                <div className="bg-surface-light rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Players in Room ({game.players.length})
                  </h3>
                  <div className="space-y-2">
                    {game.players.map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-300">{player.name}</span>
                          {index === 0 && (
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                              Host
                            </span>
                          )}
                        </div>
                        <span className="text-green-400 text-sm">✓ Ready</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Movie Swiping */}
        {!needsGenreSelection && game.status === 'playing' && game.movies.length > 0 && currentMovie && !hasFinishedSwiping && (
          <div className="max-w-md mx-auto">
            <div className="card mb-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Movie {currentMovieIndex + 1} of {game.movies.length}
                </h3>
                <p className="text-gray-400 mb-2">
                  Swipe right to like, left to pass
                </p>
                {game.players.length > 1 && (
                  <div className="bg-surface-light rounded-lg p-3 mt-3">
                    <p className="text-sm text-gray-400 mb-2">Other players:</p>
                    <div className="space-y-1">
                      {game.players
                        .filter(p => p.id !== currentPlayer?.id)
                        .map(player => (
                          <div key={player.id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-300">{player.name}</span>
                            <span className={`${player.hasFinished ? 'text-green-400' : 'text-yellow-400'}`}>
                              {player.hasFinished ? '✓ Done' : '⏳ Swiping...'}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Movie Card */}
              <div className="movie-card">
                <img 
                  src={currentMovie.posterPath || 'https://via.placeholder.com/400x600'} 
                  alt={currentMovie.title}
                  className="w-full h-full object-cover"
                />
                <div className="movie-card-overlay">
                  <h2 className="movie-title">{currentMovie.title}</h2>
                  <p className="movie-overview">{currentMovie.overview}</p>
                </div>
              </div>

              {/* Swipe Buttons */}
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => handleSwipe(false)}
                  disabled={isSwiping}
                  className="btn btn-danger flex-1"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Pass
                </button>
                <button
                  onClick={() => handleSwipe(true)}
                  disabled={isSwiping}
                  className="btn btn-success flex-1"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Like
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Finished Swiping - Waiting for Others */}
        {!needsGenreSelection && hasFinishedSwiping && !isGameFinished && (
          <div className="max-w-md mx-auto text-center">
            <div className="card">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                You're Done!
              </h2>
              <p className="text-gray-300 mb-4">
                You've finished swiping all movies!
              </p>
              <div className="bg-surface-light rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Waiting for other players...
                </h3>
                <div className="space-y-2">
                  {game.players.map(player => (
                    <div key={player.id} className="flex items-center justify-between">
                      <span className="text-gray-300">{player.name}</span>
                      <span className={`text-sm ${player.hasFinished ? 'text-green-400' : 'text-yellow-400'}`}>
                        {player.hasFinished ? '✓ Finished' : '⏳ Swiping...'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-yellow-300 text-sm">Progress</span>
                    <span className="text-yellow-300 text-sm">
                      {game.players.filter(p => p.hasFinished).length}/{game.players.length}
                    </span>
                  </div>
                  <div className="w-full bg-yellow-500/20 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(game.players.filter(p => p.hasFinished).length / game.players.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    Results will appear automatically when everyone finishes!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Results - Auto-appears when all finish */}
        {isGameFinished && (
          <div className="max-w-2xl mx-auto">
            <div className="card">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  🎬 Collaborative Top Picks
                </h2>
                <p className="text-gray-300">
                  Based on everyone's preferences
                </p>
              </div>
              
              {game.topPicks && game.topPicks.length > 0 ? (
                <div className="space-y-6">
                  {game.topPicks.map((pick, index) => (
                    <div key={pick.movie.id} className="bg-surface-light rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <img 
                            src={pick.movie.posterPath || 'https://via.placeholder.com/100x150'} 
                            alt={pick.movie.title}
                            className="w-20 h-30 object-cover rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2">
                            #{index + 1} {pick.movie.title}
                          </h3>
                          <p className="text-gray-300 text-sm mb-2">
                            {pick.movie.overview}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-yellow-400 font-medium">
                              Score: {pick.score}
                            </span>
                            <span className="text-gray-400 text-sm">
                              Liked by: {pick.players.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-300 text-center">
                  No movies were liked by multiple players.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage; 