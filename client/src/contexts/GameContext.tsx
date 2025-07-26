import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Game, Player, TopPick, ClientToServerEvents, ServerToClientEvents } from '../../../shared/src/index.ts';

interface GameContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  game: Game | null;
  currentPlayer: Player | null;
  isConnected: boolean;
  error: string | null;
  createGame: (playerName: string, onSuccess?: (roomCode: string) => void) => Promise<void>;
  joinGame: (roomCode: string, playerName: string) => Promise<void>;
  startGame: () => Promise<void>;
  setPlayerGenres: (genres: string[]) => Promise<void>;
  swipeMovie: (movieId: number, liked: boolean) => Promise<void>;
  clearError: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const serverUrl = (import.meta.env as any).VITE_SERVER_URL || 'http://localhost:3001';
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('error', (message: string) => {
      setError(message);
    });

    newSocket.on('game:joined', (gameData: Game) => {
      setGame(gameData);
      setError(null);
    });

    newSocket.on('game:updated', (gameData: Game) => {
      console.log('Game updated:', gameData);
      setGame(gameData);
      // Update currentPlayer if it exists in the updated game
      setCurrentPlayer(prevPlayer => {
        if (prevPlayer) {
          const updatedPlayer = gameData.players.find(p => p.id === prevPlayer.id);
          console.log('Updating currentPlayer:', prevPlayer, 'to:', updatedPlayer);
          return updatedPlayer || prevPlayer;
        }
        return prevPlayer;
      });
    });

    newSocket.on('game:started', (gameData: Game) => {
      setGame(gameData);
    });

    newSocket.on('game:finished', (gameData: Game, topPicks: TopPick[]) => {
      setGame({ ...gameData, topPicks });
    });

    newSocket.on('player:left', (playerId: string) => {
      if (game) {
        setGame({
          ...game,
          players: game.players.filter(p => p.id !== playerId)
        });
      }
    });

    newSocket.on('player:swiped', (playerId: string, swipe) => {
      if (game) {
        setGame({
          ...game,
          players: game.players.map(p => 
            p.id === playerId 
              ? { ...p, swipes: [...p.swipes, swipe] }
              : p
          )
        });
      }
    });

    newSocket.on('player:finished', (playerId: string) => {
      if (game) {
        setGame({
          ...game,
          players: game.players.map(p => 
            p.id === playerId ? { ...p, hasFinished: true } : p
          )
        });
      }
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const createGame = async (playerName: string, onSuccess?: (roomCode: string) => void) => {
    if (!socket) return;
    socket.emit('game:create', playerName, (gameData: Game) => {
      setGame(gameData);
      setCurrentPlayer(gameData.players[0]);
      if (onSuccess) {
        onSuccess(gameData.roomCode);
      }
    });
  };

  const joinGame = async (roomCode: string, playerName: string) => {
    if (!socket) return;
    
    socket.emit('game:join', roomCode, playerName, (gameData: Game) => {
      setGame(gameData);
      const player = gameData.players.find(p => p.name === playerName);
      setCurrentPlayer(player || null);
    });
  };

  const startGame = async () => {
    if (!socket) return;
    
    socket.emit('game:start', (success: boolean) => {
      if (!success) {
        setError('Failed to start game. Please try again.');
      }
    });
  };

  const setPlayerGenres = async (genres: string[]) => {
    if (!socket) return;
    
    console.log('Emitting player:genres event with genres:', genres);
    socket.emit('player:genres', genres, (success: boolean) => {
      console.log('Player genres callback received:', success);
      if (!success) {
        setError('Failed to set player genres.');
      }
    });
  };

  const swipeMovie = async (movieId: number, liked: boolean) => {
    if (!socket) return;
    
    socket.emit('player:swipe', movieId, liked, (success: boolean) => {
      if (!success) {
        setError('Failed to record swipe.');
      }
    });
  };

  const clearError = () => {
    setError(null);
  };

  const value: GameContextType = {
    socket,
    game,
    currentPlayer,
    isConnected,
    error,
    createGame,
    joinGame,
    startGame,
    setPlayerGenres,
    swipeMovie,
    clearError
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}; 