import { Routes, Route } from 'react-router-dom'
import { GameProvider } from './contexts/GameContext'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import './App.css'

function App() {
  return (
    <GameProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:roomCode" element={<GamePage />} />
        </Routes>
      </div>
    </GameProvider>
  )
}

export default App 