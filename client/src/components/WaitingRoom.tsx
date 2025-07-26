import React from 'react';
import { useGame } from '../contexts/GameContext';

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

interface WaitingRoomProps {
  title?: string;
  subtitle?: string;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ 
  title = "Waiting Room", 
  subtitle = "The game will begin once the host starts!" 
}) => {
  const { game } = useGame();

  if (!game) {
    return (
      <div className="text-center">
        <div className="loader mx-auto mb-4"></div>
        <p className="text-white">Loading game...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl bg-[#2c2c54] rounded-2xl shadow-2xl p-8 text-center ring-4 ring-purple-700/50">
      <div className="flex justify-center items-center gap-4 mb-6">
        <h1 className="text-6xl font-jackbox text-white drop-shadow-[0_4px_2px_rgba(0,0,0,0.4)]">{title}</h1>
        <div className="loader border-4 border-yellow-400 border-t-purple-700 rounded-full w-10 h-10 animate-spin"></div>
      </div>
      <p className="text-xl text-gray-300 mb-8">{subtitle}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {game.players.map((player, idx) => (
          <div
            key={player.id}
            className="bg-purple-700/50 rounded-xl p-4 flex flex-col items-center justify-center player-list-item border-2 border-pink-400"
          >
            <div className="w-24 h-24 rounded-full mb-3 border-4 border-white flex items-center justify-center text-6xl bg-[#1a1a2e]">
              {getEmojiForPlayer(player.id, player.name)}
            </div>
            <p className="text-xl font-bold text-white truncate">{player.name}</p>
            {idx === 0 && (
              <span className="mt-2 text-xs bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded font-bold">Host</span>
            )}
          </div>
        ))}
        {/* Show empty slots if less than 8 players */}
        {Array.from({ length: Math.max(0, 8 - game.players.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="bg-black/20 rounded-xl p-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-500"
          >
            <div className="w-24 h-24 rounded-full mb-3 bg-gray-700 flex items-center justify-center">
              <span className="text-5xl text-gray-500">?</span>
            </div>
            <p className="text-xl font-bold text-gray-400">Waiting...</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WaitingRoom; 