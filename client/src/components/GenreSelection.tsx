import React from 'react';
import { Check } from 'lucide-react';

// Updated genres to match genere.html
const GENRES = [
  'Action', 'Comedy', 'Drama', 'Sci-Fi', 'Thriller',
  'Romance', 'Horror', 'Animation', 'Documentary', 'Family'
];

interface GenreSelectionProps {
  selectedGenres: string[];
  onGenreToggle: (genre: string) => void;
  onReady: () => void;
}

const GenreSelection: React.FC<GenreSelectionProps> = ({
  selectedGenres,
  onGenreToggle,
  onReady
}) => {
  return (
    <div className="w-full max-w-4xl bg-[#2c2c54] rounded-2xl shadow-2xl p-8 text-center ring-4 ring-purple-700/50">
      <div className="flex justify-center items-center gap-4 mb-6">
        <h1 className="text-6xl font-jackbox text-white drop-shadow-[0_4px_2px_rgba(0,0,0,0.4)]">
          Select Your Genres
        </h1>
        <div className="w-10 h-10 flex items-center justify-center">
          <span className="text-4xl">🎬</span>
        </div>
      </div>
      
      <p className="text-xl text-gray-300 mb-8">
        Choose at least three genres to start matching. The more you pick, the more varied your movie selection will be!
      </p>

      {/* Genre Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {GENRES.map((genre: string) => (
          <button
            key={genre}
            onClick={() => onGenreToggle(genre)}
            className={`genre-card relative ${
              selectedGenres.includes(genre) ? 'selected' : ''
            }`}
          >
            <span className="genre-text">{genre}</span>
            {selectedGenres.includes(genre) && (
              <div className="checkmark">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Selection Info */}
      <div className="text-center text-gray-300 mb-6">
        <p className="text-xl font-bold">Selected: {selectedGenres.length} genres</p>
        {selectedGenres.length < 3 && (
          <p className="text-red-400 text-sm mt-2">
            Please select at least 3 genres to continue
          </p>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={onReady}
        disabled={selectedGenres.length < 3}
        className="bg-purple-700 hover:bg-purple-600 disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded-full text-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed border-2 border-pink-400 shadow-lg"
      >
        Let's Go!
      </button>
    </div>
  );
};

export default GenreSelection; 