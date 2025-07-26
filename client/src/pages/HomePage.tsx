import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { Users, Film, Zap, Plus } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { createGame, isConnected, error, clearError } = useGame();
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGame = async () => {
    if (!playerName.trim()) return;
    setIsCreating(true);
    clearError();
    try {
      await createGame(playerName, (roomCode) => {
        navigate(`/setup/${roomCode}`);
      });
    } catch (err) {
      console.error('Failed to create game:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = () => {
    if (!playerName.trim()) return;
    // Navigate to join page with the player name
    navigate('/join', { state: { playerName } });
  };

  return (
    <div className="min-h-screen flex flex-col homepage-container">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap px-10 py-5 bg-[#2C2C54] border-b-4 border-[#FF6B6B]">
        <div className="flex items-center gap-4 text-[#FFFFFF]">
          <Film className="w-12 h-12 text-[#4A90E2]" />
          <h2 className="text-3xl font-bold homepage-header-text">
            YourNxtWatch
          </h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center text-center p-8">
        <div className="flex flex-col items-center gap-8 max-w-4xl w-full">
          {/* Title */}
          <h1 className="homepage-title">
            Find Your Flix!
          </h1>
          
          <p className="homepage-subtitle max-w-2xl">
            Create a game room or join an existing one to start swiping through movie cards with your friends. The ultimate movie showdown awaits!
          </p>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-500/20 border-4 border-red-500/30 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {/* Player Name Input */}
          <div className="w-full max-w-md mt-8">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="ENTER YOUR NAME"
              className="homepage-input"
              maxLength={20}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 mt-4">
            <button
              onClick={handleCreateGame}
              disabled={!playerName.trim() || !isConnected || isCreating}
              className="homepage-button homepage-button-primary"
            >
              <Plus className="homepage-icon" />
              {isCreating ? 'Creating...' : 'Create Room'}
            </button>
            
            <button
              onClick={handleJoinGame}
              disabled={!playerName.trim() || !isConnected}
              className="homepage-button homepage-button-secondary"
            >
              <Users className="homepage-icon" />
              Join Room
            </button>
          </div>

          {/* Features */}
          <div className="text-center text-[#E0E0E0] text-sm mt-8">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center justify-center">
                <Zap className="w-4 h-4 mr-2" />
                <span>Real-time</span>
              </div>
              <div className="flex items-center justify-center">
                <Film className="w-4 h-4 mr-2" />
                <span>10 Movies</span>
              </div>
            </div>
            <p>No login required • Mobile friendly • Instant results</p>
            <p>Idea Credits: <a href="#" target="_blank" rel="noopener noreferrer" className="text-[#4A90E2] hover:underline">K G</a></p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage; 