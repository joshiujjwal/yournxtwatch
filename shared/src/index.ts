// Game Types
export interface Player {
  id: string;
  name: string;
  genres: string[];
  swipes: MovieSwipe[];
  hasFinished: boolean;
}

export interface MovieSwipe {
  movieId: number;
  liked: boolean;
  timestamp: number;
}

export interface Game {
  id: string;
  roomCode: string;
  players: Player[];
  movies: Movie[];
  status: GameStatus;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  topPicks?: TopPick[];
}

export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface TopPick {
  movie: Movie;
  score: number;
  players: string[];
}

// Movie Types
export interface Movie {
  id: number;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  releaseDate: string;
  voteAverage: number;
  genres: string[];
  trailerUrl?: string;
  streamingInfo?: StreamingInfo[];
}

export interface StreamingInfo {
  platform: string;
  url: string;
  type: 'rent' | 'buy' | 'stream';
  price?: string;
}

// Socket Events
export interface ServerToClientEvents {
  'game:joined': (game: Game) => void;
  'game:updated': (game: Game) => void;
  'game:started': (game: Game) => void;
  'game:finished': (game: Game, topPicks: TopPick[]) => void;
  'player:joined': (player: Player) => void;
  'player:left': (playerId: string) => void;
  'player:swiped': (playerId: string, swipe: MovieSwipe) => void;
  'player:finished': (playerId: string) => void;
  'error': (message: string) => void;
}

export interface ClientToServerEvents {
  'game:create': (playerName: string, callback: (game: Game) => void) => void;
  'game:join': (roomCode: string, playerName: string, callback: (game: Game) => void) => void;
  'game:start': (callback: (success: boolean) => void) => void;
  'player:genres': (genres: string[], callback: (success: boolean) => void) => void;
  'player:swipe': (movieId: number, liked: boolean, callback: (success: boolean) => void) => void;
  'player:disconnect': () => void;
}

// API Types
export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBVideo {
  key: string;
  site: string;
  type: string;
}

// Utility Types
export interface GameConfig {
  maxPlayers: number;
  moviesPerGame: number;
  genres: string[];
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  maxPlayers: 8,
  moviesPerGame: 20,
  genres: [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
    'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
    'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
    'TV Movie', 'Thriller', 'War', 'Western'
  ]
};

 