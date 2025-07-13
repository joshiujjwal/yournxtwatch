import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { Play, Users, Film, Zap } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { createGame, joinGame, isConnected, error, clearError, game, startGame } = useGame();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (game && createdRoomCode !== game.roomCode) {
      setCreatedRoomCode(game.roomCode);
      setShowShare(true);
    }
  }, [game]);

  const handleCreateGame = async () => {
    if (!playerName.trim()) return;
    setIsCreating(true);
    clearError();
    try {
      await createGame(playerName);
      // Navigate will be handled by the context when game is created
    } catch (err) {
      console.error('Failed to create game:', err);
    } finally {
      setIsCreating(false);
    }
  };

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

  const handleShare = async () => {
    if (!createdRoomCode) return;
    const shareText = `Join my YourNxtWatch game! Room code: ${createdRoomCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'YourNxtWatch Room Code',
          text: shareText,
          url: window.location.origin + `/game/${createdRoomCode}`
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Film className="w-12 h-12 text-purple-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">YourNxtWatch</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Swipe through movies with friends and discover your next watch!
          </p>
        </div>

        {/* Connection Status */}
        <div className={`mb-6 p-3 rounded-lg text-center ${
          isConnected 
            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
            : 'bg-red-500/20 text-red-300 border border-red-500/30'
        }`}>
          {isConnected ? '🟢 Connected to server' : '🔴 Connecting to server...'}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Player Name Input */}
        <div className="mb-6">
          <label htmlFor="playerName" className="block text-sm font-medium text-gray-300 mb-2">
            Your Name
          </label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="input w-full"
            maxLength={20}
          />
        </div>

        {/* Create Game Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Play className="w-5 h-5 mr-2" />
            Create New Game
          </h2>
          <button
            onClick={handleCreateGame}
            disabled={!playerName.trim() || !isConnected || isCreating}
            className="btn btn-primary w-full mb-4"
          >
            {isCreating ? 'Creating...' : 'Create Game'}
          </button>
        </div>

        {/* Room Code & Share */}
        {showShare && createdRoomCode && (
          <div className="mb-8 p-4 bg-surface-light border border-primary rounded-lg text-center">
            <div className="mb-2 text-lg text-white font-semibold">
              Room Code: <span className="text-primary text-2xl tracking-widest font-mono">{createdRoomCode}</span>
            </div>
            
            {/* Player Counter */}
            <div className="mb-4 p-3 bg-surface rounded-lg">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">{game?.players.length || 0} Players</span>
                </div>
              </div>
              
              {/* Player List */}
              {game && game.players.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="text-sm text-gray-300 mb-2">Players:</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {game.players.map(player => (
                      <div
                        key={player.id}
                        className="px-3 py-1 rounded-full text-xs bg-gray-500/20 text-gray-300 border border-gray-500/30"
                      >
                        {player.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleShare}
              className="btn btn-primary w-full mb-2"
            >
              Share Room Code
            </button>
            {shareError && <div className="text-sm text-green-400 mt-1">{shareError}</div>}
            <div className="text-xs text-gray-400 mt-2">
              Share this code with friends to join your game!
            </div>
            
            {/* Start Game Button */}
            {canStartGame && (
              <div className="mt-4 pt-4 border-t border-border">
                <button
                  onClick={handleStartGame}
                  disabled={isStarting}
                  className="btn btn-success w-full"
                >
                  {isStarting ? 'Starting...' : 'Start Game'}
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  Start the game whenever you're ready!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Join Game Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Join Existing Game
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code (e.g., ABCD)"
              className="input w-full"
              maxLength={4}
            />
            <button
              onClick={handleJoinGame}
              disabled={!playerName.trim() || !roomCode.trim() || !isConnected || isJoining}
              className="btn btn-secondary w-full"
            >
              {isJoining ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="text-center text-gray-400 text-sm">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center justify-center">
              <Zap className="w-4 h-4 mr-2" />
              <span>Real-time</span>
            </div>
            <div className="flex items-center justify-center">
              <Film className="w-4 h-4 mr-2" />
              <span>20 Movies</span>
            </div>
          </div>
          <p>No login required • Mobile friendly • Instant results</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 