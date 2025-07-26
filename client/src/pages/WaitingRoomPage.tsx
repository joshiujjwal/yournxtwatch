import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import WaitingRoom from '../components/WaitingRoom';

// A fun set of emoji avatars
const EMOJIS = [
  "😎", "🤩", "🦄", "🐸", "🐙", "🐼", "🦊", "🐵", "🐧", "🐯", "🦁", "🐻", "🐨", "🐰", "🐶", "🐱", "🦉", "🦖", "🐲", "🐢"
];

// Deterministically pick an emoji for a player based on their id or name
function getEmojiForPlayer(playerId: string, playerName: string) {
  // Simple hash: sum char codes
  const str = playerId || playerName;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash += str.charCodeAt(i);
  }
  return EMOJIS[hash % EMOJIS.length];
}

const WaitingRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { game, currentPlayer } = useGame();

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="loader mx-auto mb-4"></div>
          <p className="text-white">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{
      backgroundColor: "#1a1a2e",
      color: "#fff",
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
    }}>
      {/* Header */}
      <header className="bg-[#2c2c54]/50 backdrop-blur-sm shadow-lg sticky top-0 z-10">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <button className="flex items-center gap-2" onClick={() => navigate("/")}>
            <svg className="w-10 h-10 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9h4v2h-4v3l-4-4 4-4v3z"></path>
            </svg>
            <span className="text-3xl font-jackbox text-white">Movie Mayhem</span>
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-lg font-bold text-white">
              Room Code: <span className="text-yellow-400 font-jackbox">{game.roomCode}</span>
            </span>
            {/* Optionally, show current player emoji */}
            <span className="w-12 h-12 rounded-full border-2 border-yellow-400 flex items-center justify-center text-3xl bg-[#2c2c54]">
              {getEmojiForPlayer(currentPlayer?.id || "", currentPlayer?.name || "")}
            </span>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-8">
        <WaitingRoom />
      </main>
    </div>
  );
};

export default WaitingRoomPage;