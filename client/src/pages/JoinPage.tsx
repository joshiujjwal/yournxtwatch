import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { ArrowLeft } from 'lucide-react';

const JoinPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { joinGame, isConnected, error, clearError } = useGame();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Get player name from navigation state if available
  useEffect(() => {
    if (location.state?.playerName) {
      setPlayerName(location.state.playerName);
    }
  }, [location.state]);

  const handleJoinGame = async () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    
    setIsJoining(true);
    clearError();
    
    try {
      await joinGame(roomCode.toUpperCase(), playerName);
      navigate(`/game/${roomCode.toUpperCase()}`);
    } catch (err) {
      console.error('Failed to join game:', err);
    } finally {
      setIsJoining(false);
    }
  };

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
          <h2 className="text-2xl font-bold">Join Game</h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center text-center p-8">
        <div className="flex flex-col items-center gap-8 max-w-4xl w-full">
          {/* Title */}
          <h1 className="homepage-title">
            Join a Game
          </h1>
          
          <p className="homepage-subtitle max-w-2xl">
            Enter your name and the room code to join an existing game!
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

          {/* Room Code Input */}
          <div className="w-full max-w-md">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ENTER ROOM CODE"
              className="homepage-input homepage-input-secondary"
              maxLength={4}
            />
          </div>

          {/* Join Button */}
          <div className="flex flex-col sm:flex-row gap-6 mt-4">
            <button
              onClick={handleJoinGame}
              disabled={!playerName.trim() || !roomCode.trim() || !isConnected || isJoining}
              className="homepage-button homepage-button-secondary"
            >
              {isJoining ? 'Joining...' : 'Join Game'}
            </button>
          </div>

          {/* Instructions */}
          <div className="text-center text-[#E0E0E0] text-sm mt-8">
            <p>Ask the game host for the room code to join their game!</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JoinPage; 