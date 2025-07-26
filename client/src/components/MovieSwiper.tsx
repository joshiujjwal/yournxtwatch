import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface Movie {
  id: string;
  title: string;
  overview: string;
  posterPath?: string;
}

interface Player {
  id: string;
  name: string;
  hasFinished: boolean;
}

interface MovieSwiperProps {
  currentMovie: Movie;
  currentMovieIndex: number;
  totalMovies: number;
  players: Player[];
  currentPlayerId?: string;
  isSwiping: boolean;
  onSwipe: (liked: boolean) => void;
}

const MovieSwiper: React.FC<MovieSwiperProps> = ({
  currentMovie,
  currentMovieIndex,
  totalMovies,
  players,
  currentPlayerId,
  isSwiping,
  onSwipe
}) => {
  return (
    <div className="w-full max-w-md">
      <div className="p-6 bg-[#2C2C54] border-4 border-[#4A90E2] rounded-lg">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-[#FFFFFF]">
            Movie {currentMovieIndex + 1} of {totalMovies}
          </h3>
          <p className="homepage-subtitle mb-2">
            Swipe right to like, left to pass
          </p>
        </div>

        {/* Movie Card */}
        <div className="movie-card mb-6">
          <img 
            src={currentMovie.posterPath || 'https://via.placeholder.com/400x600'} 
            alt={currentMovie.title}
            className="w-full h-80 object-cover rounded-lg border-4 border-[#4A90E2]"
          />
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-[#F5A623] mb-2">{currentMovie.title}</h2>
            <p className="text-[#E0E0E0]">{currentMovie.overview}</p>
          </div>
        </div>

        {/* Swipe Buttons */}
        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => onSwipe(false)}
            disabled={isSwiping}
            className="homepage-button homepage-button-secondary flex-1"
          >
            <XCircle className="homepage-icon" />
            Pass
          </button>
          <button
            onClick={() => onSwipe(true)}
            disabled={isSwiping}
            className="homepage-button homepage-button-primary flex-1"
          >
            <CheckCircle className="homepage-icon" />
            Like
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieSwiper; 