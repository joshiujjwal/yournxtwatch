import { v4 as uuidv4 } from 'uuid';
import { Game, Player, Movie, TopPick, MovieSwipe, GameStatus, DEFAULT_GAME_CONFIG } from '@yournxtwatch/shared';
import { TMDBService } from './TMDBService.js';

export class GameManager {
  private games: Map<string, Game> = new Map();
  private tmdbService: TMDBService;

  constructor() {
    this.tmdbService = new TMDBService();
  }

  async createGame(playerName: string, socketId: string): Promise<Game> {
    const gameId = uuidv4();
    const roomCode = this.generateRoomCode();

    const player: Player = {
      id: uuidv4(),
      name: playerName,
      genres: [],
      swipes: [],
      hasFinished: false
    };

    const game: Game = {
      id: gameId,
      roomCode,
      players: [player],
      movies: [],
      status: 'waiting',
      createdAt: Date.now()
    };

    this.games.set(gameId, game);
    return game;
  }

  async joinGame(roomCode: string, playerName: string, socketId: string): Promise<Game> {
    const game = this.findGameByRoomCode(roomCode);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'waiting') {
      throw new Error('Game has already started');
    }

    if (game.players.length >= DEFAULT_GAME_CONFIG.maxPlayers) {
      throw new Error('Game is full');
    }

    const player: Player = {
      id: uuidv4(),
      name: playerName,
      genres: [],
      swipes: [],
      hasFinished: false
    };

    game.players.push(player);
    return game;
  }

  async startGame(gameId: string): Promise<Game | null> {
    console.log('Starting game:', gameId);
    const game = this.games.get(gameId);
    if (!game) {
      console.log('Game not found:', gameId);
      return null;
    }

    // Allow starting even if game is already playing (for new players joining)
    if (game.status === 'finished') {
      console.log('Game is already finished');
      return null;
    }

    // Check if there are players
    if (game.players.length === 0) {
      console.log('No players in game');
      return null;
    }

    // If game is not playing yet, fetch movies
    if (game.status === 'waiting') {
      console.log('Fetching movies for game with', game.players.length, 'players');
      const movies = await this.fetchMoviesForGame(game);
      game.movies = movies;
      game.status = 'playing';
      game.startedAt = Date.now();
      console.log('Game started successfully with', movies.length, 'movies');
    } else {
      console.log('Game is already playing, no need to fetch movies again');
    }

    return game;
  }

  async setPlayerGenres(gameId: string, playerId: string, genres: string[]): Promise<boolean> {
    console.log('Setting player genres:', { gameId, playerId, genres });
    const game = this.games.get(gameId);
    if (!game) {
      console.log('Game not found for setting genres');
      return false;
    }

    const player = game.players.find((p: Player) => p.id === playerId);
    if (!player) {
      console.log('Player not found for setting genres');
      return false;
    }

    player.genres = genres;
    console.log('Player genres set successfully:', { playerName: player.name, genres: player.genres });

    return true;
  }

  async recordSwipe(gameId: string, playerId: string, movieId: number, liked: boolean): Promise<boolean> {
    const game = this.games.get(gameId);
    if (!game) return false;

    const player = game.players.find((p: Player) => p.id === playerId);
    if (!player) return false;

    const swipe: MovieSwipe = {
      movieId,
      liked,
      timestamp: Date.now()
    };

    player.swipes.push(swipe);

    // Check if player has finished all movies
    if (player.swipes.length >= game.movies.length) {
      player.hasFinished = true;
      this.checkGameEnd(game);
    }

    return true;
  }

  removePlayer(gameId: string, playerId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;

    game.players = game.players.filter((p: Player) => p.id !== playerId);

    // If no players left, remove the game
    if (game.players.length === 0) {
      this.games.delete(gameId);
    }
  }

  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  findGameByRoomCode(roomCode: string): Game | undefined {
    return Array.from(this.games.values()).find((game: Game) => game.roomCode === roomCode);
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private async fetchMoviesForGame(game: Game): Promise<Movie[]> {
    // Get all unique genres from all players
    const allGenres = new Set<string>();
    game.players.forEach((player: Player) => {
      player.genres.forEach((genre: string) => allGenres.add(genre));
    });

    console.log('Fetching movies for game:', {
      gameId: game.id,
      playerCount: game.players.length,
      allGenres: Array.from(allGenres),
      playersWithGenres: game.players.map((p: Player) => ({ name: p.name, genres: p.genres }))
    });

    // If no genres selected, use default genres
    if (allGenres.size === 0) {
      console.log('No genres selected, using default genres');
      allGenres.add('Action');
      allGenres.add('Comedy');
      allGenres.add('Drama');
    }

    // Fetch movies for each genre and shuffle them
    const movies: Movie[] = [];
    const moviesPerGenre = Math.ceil(DEFAULT_GAME_CONFIG.moviesPerGame / allGenres.size);

    for (const genre of allGenres) {
      console.log(`Fetching ${moviesPerGenre} movies for genre: ${genre}`);
      const genreMovies = await this.tmdbService.getMoviesByGenre(genre, moviesPerGenre);
      movies.push(...genreMovies);
    }

    // Shuffle and limit to the desired number of movies
    const shuffledMovies = this.shuffleArray(movies);
    return shuffledMovies.slice(0, DEFAULT_GAME_CONFIG.moviesPerGame);
  }

  private checkGameEnd(game: Game): void {
    const allFinished = game.players.every((player: Player) => player.hasFinished);
    if (allFinished) {
      game.status = 'finished';
      game.endedAt = Date.now();
      game.topPicks = this.calculateTopPicks(game);
      console.log('Game finished, calculated top picks:', game.topPicks?.length || 0);
    }
  }

  private calculateTopPicks(game: Game): TopPick[] {
    const movieScores = new Map<number, { score: number; players: string[] }>();

    // Calculate scores for each movie
    game.players.forEach((player: Player) => {
      player.swipes.forEach((swipe: MovieSwipe) => {
        if (swipe.liked) {
          const current = movieScores.get(swipe.movieId) || { score: 0, players: [] };
          current.score += 1;
          current.players.push(player.name);
          movieScores.set(swipe.movieId, current);
        }
      });
    });

    // Convert to TopPick array and sort by score
    const topPicks: TopPick[] = Array.from(movieScores.entries())
      .map(([movieId, { score, players }]) => {
        const movie = game.movies.find((m: Movie) => m.id === movieId);
        if (!movie) return null;
        return { movie, score, players };
      })
      .filter((pick): pick is TopPick => pick !== null)
      .sort((a, b) => b.score - a.score);

    return topPicks.slice(0, 10); // Return top 10 picks
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
} 