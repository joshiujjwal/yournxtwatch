import { Routes, Route } from 'react-router-dom'
import { GameProvider } from './contexts/GameContext'
import HomePage from './pages/HomePage'
import JoinPage from './pages/JoinPage'
import GameSetupPage from './pages/GameSetupPage'
import GamePage from './pages/GamePage'
import WaitingRoomPage from './pages/WaitingRoomPage'
import './App.css'

function App() {
  return (
    <GameProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/setup/:roomCode" element={<GameSetupPage />} />
          <Route path="/game/:roomCode" element={<GamePage />} />
          <Route path="/waiting/:roomCode" element={<WaitingRoomPage />} />
        </Routes>
      </div>
    </GameProvider>
  )
}

export default App 