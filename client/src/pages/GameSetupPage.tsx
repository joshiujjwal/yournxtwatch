import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { ArrowLeft } from 'lucide-react';
import WaitingRoom from '../components/WaitingRoom';

const GameSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomCode } = useParams<{ roomCode: string }>();
  const { game, startGame, error, clearError } = useGame();
  const [isStarting, setIsStarting] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  // Add debugging to track game state changes
  useEffect(() => {
    console.log('GameSetupPage - Game state changed:', {
      roomCode,
      gameRoomCode: game?.roomCode,
      playerCount: game?.players?.length,
      players: game?.players?.map(p => p.name),
      gameStatus: game?.status
    });
  }, [game, roomCode]);

  useEffect(() => {
    if (!game || game.roomCode !== roomCode) {
      console.log('GameSetupPage - Redirecting to home:', {
        hasGame: !!game,
        gameRoomCode: game?.roomCode,
        expectedRoomCode: roomCode
      });
      navigate('/');
      return;
    }
  }, [game, roomCode, navigate]);

  const handleShare = async () => {
    if (!roomCode) return;
    const shareText = `Join my YourNxtWatch game! Room code: ${roomCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'YourNxtWatch Room Code',
          text: shareText,
          url: window.location.origin + `/game/${roomCode}`
        });
        setShareError(null);
      } catch (err) {
        setShareError('Could not share.');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setShareError('Copied to clipboard!');
      } catch (err) {
        setShareError('Could not copy to clipboard.');
      }
    }
  };

  const handleStartGame = async () => {
    if (!game) return;
    setIsStarting(true);
    try {
      await startGame();
      navigate(`/game/${game.roomCode}`);
    } catch (err) {
      console.error('Failed to start game:', err);
    } finally {
      setIsStarting(false);
    }
  };

  const canStartGame = game && 
    game.players.length >= 1 && 
    game.status === 'waiting';

  if (!game || game.roomCode !== roomCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-white">Loading game setup...</p>
        </div>
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
          <h2 className="text-2xl font-bold">Game Setup</h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center text-center p-8">
        <div className="flex flex-col items-center gap-8 max-w-4xl w-full">
          {/* Title */}
          <h1 className="homepage-title">
            Game Room: {roomCode}
          </h1>
          
          <p className="homepage-subtitle max-w-2xl">
            Share the room code with friends and start the game when everyone's ready!
          </p>

          <button
              onClick={handleShare}
              className="homepage-button homepage-button-primary w-full mb-2"
            >
              Share Room Code
            </button>
            {shareError && <div className="text-sm text-green-400 mt-1">{shareError}</div>}
            <button
                  onClick={handleStartGame}
                  disabled={isStarting}
                  className="homepage-button homepage-button-secondary w-full"
                >
                  {isStarting ? 'Starting...' : 'Start Game'}
                </button>
  
         {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-500/20 border-4 border-red-500/30 rounded-lg text-red-300">
              {error}
            </div>
          )}

          <WaitingRoom 
            title="Players in Room"
            subtitle="Waiting for the host to start the game..."
          />
        </div>
      </main>
    </div>
  );
};

export default GameSetupPage; 