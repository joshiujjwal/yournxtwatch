import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { GameManager } from './services/GameManager.js';
import { TMDBService } from './services/TMDBService.js';
import { ClientToServerEvents, ServerToClientEvents, Game, Player } from '@yournxtwatch/shared';

console.log('🚀 Starting YourNxtWatch server...');

try {
  dotenv.config();
  console.log('📦 Environment loaded');
} catch (error) {
  console.error('❌ Failed to load environment:', error);
}

const app = express();
const httpServer = createServer(app);

console.log('🔧 HTTP server created');

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

console.log('🔧 Socket.IO server initialized');

// Middleware
app.use(cors());
app.use(express.json());

console.log('🔧 Middleware configured');

// Services
let gameManager: GameManager;
let tmdbService: TMDBService;

try {
  gameManager = new GameManager();
  tmdbService = new TMDBService();
  console.log('🎮 Game services initialized');
} catch (error) {
  console.error('❌ Failed to initialize game services:', error);
  process.exit(1);
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Create a new game
  socket.on('game:create', async (playerName: string, callback: (game: Game) => void) => {
    try {
      const game = await gameManager.createGame(playerName, socket.id);
      socket.join(game.roomCode);
      socket.data.gameId = game.id;
      socket.data.playerId = game.players[0].id;
      callback(game);
    } catch (error) {
      console.error('Error creating game:', error);
      socket.emit('error', 'Failed to create game');
    }
  });

  // Join an existing game
  socket.on('game:join', async (roomCode: string, playerName: string, callback: (game: Game) => void) => {
    try {
      const game = await gameManager.joinGame(roomCode, playerName, socket.id);
      socket.join(roomCode);
      socket.data.gameId = game.id;
      socket.data.playerId = game.players.find((p: Player) => p.name === playerName)?.id;
      
      // Notify other players
      socket.to(roomCode).emit('player:joined', game.players[game.players.length - 1]);
      callback(game);
    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('error', 'Failed to join game');
    }
  });

  // Start the game
  socket.on('game:start', async (callback: (success: boolean) => void) => {
    try {
      const gameId = socket.data.gameId;
      if (!gameId) {
        callback(false);
        return;
      }

      const game = await gameManager.startGame(gameId);
      if (game) {
        io.to(game.roomCode).emit('game:started', game);
        callback(true);
      } else {
        callback(false);
      }
    } catch (error) {
      console.error('Error starting game:', error);
      callback(false);
    }
  });

  // Player ready with genres
  socket.on('player:genres', async (genres: string[], callback: (success: boolean) => void) => {
    try {
      const gameId = socket.data.gameId;
      const playerId = socket.data.playerId;
      
      if (!gameId || !playerId) {
        callback(false);
        return;
      }

      const success = await gameManager.setPlayerGenres(gameId, playerId, genres);
      if (success) {
        const game = gameManager.getGame(gameId);
        if (game) {
          io.to(game.roomCode).emit('game:updated', game);
        }
      }
      callback(success);
    } catch (error) {
      console.error('Error setting player genres:', error);
      callback(false);
    }
  });

  // Player swipes on a movie
  socket.on('player:swipe', async (movieId: number, liked: boolean, callback: (success: boolean) => void) => {
    try {
      const gameId = socket.data.gameId;
      const playerId = socket.data.playerId;
      
      if (!gameId || !playerId) {
        callback(false);
        return;
      }

      const success = await gameManager.recordSwipe(gameId, playerId, movieId, liked);
      if (success) {
        const game = gameManager.getGame(gameId);
        if (game) {
          io.to(game.roomCode).emit('player:swiped', playerId, { movieId, liked, timestamp: Date.now() });
          io.to(game.roomCode).emit('game:updated', game);
          
          // Check if this was the last player to finish
          const allFinished = game.players.every((player: Player) => player.hasFinished);
          if (allFinished) {
            console.log('All players finished, ending game');
            io.to(game.roomCode).emit('game:finished', game, game.topPicks || []);
          }
        }
      }
      callback(success);
    } catch (error) {
      console.error('Error recording swipe:', error);
      callback(false);
    }
  });

  // Player disconnects
  socket.on('player:disconnect', () => {
    const gameId = socket.data.gameId;
    const playerId = socket.data.playerId;
    
    if (gameId && playerId) {
      gameManager.removePlayer(gameId, playerId);
      const game = gameManager.getGame(gameId);
      if (game) {
        io.to(game.roomCode).emit('player:left', playerId);
        io.to(game.roomCode).emit('game:updated', game);
      }
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const gameId = socket.data.gameId;
    const playerId = socket.data.playerId;
    
    if (gameId && playerId) {
      gameManager.removePlayer(gameId, playerId);
      const game = gameManager.getGame(gameId);
      if (game) {
        io.to(game.roomCode).emit('player:left', playerId);
        io.to(game.roomCode).emit('game:updated', game);
      }
    }
    console.log(`Player disconnected: ${socket.id}`);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Get movie details endpoint
app.get('/api/movies/:id', async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    const movie = await tmdbService.getMovieDetails(movieId);
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

const PORT = process.env.PORT || 3001;

console.log(`🌐 Starting server on port ${PORT}`);
console.log(`🏥 Health check will be available at http://localhost:${PORT}/health`);

try {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📺 YourNxtWatch multiplayer movie game server ready!`);
    console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
} 