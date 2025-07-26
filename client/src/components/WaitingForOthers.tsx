import React from 'react';
import { CheckCircle } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  hasFinished: boolean;
}

interface WaitingForOthersProps {
  players: Player[];
}

const WaitingForOthers: React.FC<WaitingForOthersProps> = ({ players }) => {
  return (
    <div className="w-full max-w-md">
      <div className="p-6 bg-[#2C2C54] border-4 border-[#F5A623] rounded-lg">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold homepage-header-text text-[#FFFFFF] mb-2">
          You're Done!
        </h2>
        <p className="homepage-subtitle mb-4">
          You've finished swiping all movies!
        </p>
        <div className="p-4 bg-[#2C2C54] border-2 border-[#E0E0E0] rounded-lg">
          <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2">
            Waiting for other players...
          </h3>
          <div className="space-y-2">
            {players.map(player => (
              <div key={player.id} className="flex items-center justify-between">
                <span className="text-[#E0E0E0]">{player.name}</span>
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
                {players.filter(p => p.hasFinished).length}/{players.length}
              </span>
            </div>
            <div className="w-full bg-yellow-500/20 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(players.filter(p => p.hasFinished).length / players.length) * 100}%` 
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
  );
};

export default WaitingForOthers; 