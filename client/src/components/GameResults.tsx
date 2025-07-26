import React from 'react';
import { CheckCircle, Heart, Star } from 'lucide-react';

interface Movie {
  id: string;
  title: string;
  overview: string;
  posterPath?: string;
}

interface TopPick {
  movie: Movie;
  score: number;
  players: string[];
}

interface GameResultsProps {
  topPicks: TopPick[];
}

const GameResults: React.FC<GameResultsProps> = ({ topPicks }) => {
  // Take only the top 3 picks
  const topThreePicks = topPicks?.slice(0, 3) || [];

  const getRankingStyle = (index: number) => {
    switch (index) {
      case 0:
        return {
          container: "bg-gradient-to-br from-yellow-300 to-orange-400 p-6 rounded-2xl shadow-2xl w-full max-w-md transform hover:-translate-y-4 transition-transform duration-300 relative order-1 md:order-2",
          badge: "absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400 text-white text-3xl font-bold w-16 h-16 rounded-full flex items-center justify-center border-4 border-white shadow-lg",
          title: "text-2xl font-bold text-white",
          description: "text-yellow-100 text-sm my-2",
          likes: "bg-white/30 text-white font-bold py-1 px-3 rounded-full text-sm"
        };
      case 1:
        return {
          container: "bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm transform hover:-translate-y-2 transition-transform duration-300 relative order-2 md:order-1",
          badge: "absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-200 text-[#2C2C54] text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center border-4 border-white",
          title: "text-xl font-bold text-[#2C2C54]",
          description: "text-[#64748b] text-sm my-2",
          likes: "bg-[#e6f7ff] text-[#4A90E2] font-bold py-1 px-3 rounded-full text-sm"
        };
      case 2:
        return {
          container: "bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm transform hover:-translate-y-2 transition-transform duration-300 relative order-3 md:order-3",
          badge: "absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center border-4 border-white",
          title: "text-xl font-bold text-[#2C2C54]",
          description: "text-[#64748b] text-sm my-2",
          likes: "bg-[#e6f7ff] text-[#4A90E2] font-bold py-1 px-3 rounded-full text-sm"
        };
      default:
        return {
          container: "bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm",
          badge: "absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-500 text-white text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center border-4 border-white",
          title: "text-xl font-bold text-[#2C2C54]",
          description: "text-[#64748b] text-sm my-2",
          likes: "bg-[#e6f7ff] text-[#4A90E2] font-bold py-1 px-3 rounded-full text-sm"
        };
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="p-6 bg-[#2C2C54] border-4 border-[#4A90E2] rounded-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold homepage-header-text text-[#FFFFFF] mb-4">
            🎬 It's a Match!
          </h2>
          <p className="homepage-subtitle text-lg">
            Congratulations! You and your friends have impeccable taste. Here are the top movies you all loved.
          </p>
        </div>
        
        {topThreePicks.length > 0 ? (
          <div className="flex flex-col md:flex-row items-end justify-center gap-8">
            {topThreePicks.map((pick, index) => {
              const style = getRankingStyle(index);
              return (
                <div key={pick.movie.id} className={style.container}>
                  <div className={style.badge}>
                    {index === 0 ? (
                      <Star className="w-8 h-8" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="flex flex-col items-center text-center pt-8">
                    <div className={`w-${index === 0 ? '48' : '40'} h-${index === 0 ? '72' : '60'} rounded-lg overflow-hidden mb-4 shadow-lg`}>
                      <img 
                        src={pick.movie.posterPath || 'https://via.placeholder.com/200x300'} 
                        alt={pick.movie.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className={style.title}>
                      {pick.movie.title}
                    </h3>
                    <p className={style.description}>
                      {pick.movie.overview}
                    </p>
                    <div className={`flex items-center gap-2 mt-2 ${style.likes}`}>
                      <Heart className="w-4 h-4" />
                      <span>{pick.score} Likes</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center">
            <p className="homepage-subtitle">
              No movies were liked by multiple players.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameResults; 