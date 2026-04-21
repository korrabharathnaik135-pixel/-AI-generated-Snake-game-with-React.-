/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music, Volume2, Trophy, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const MIN_SPEED = 60;
const SPEED_INCREMENT = 2;

const TRACKS = [
  { id: 1, title: 'Neon Pulse', artist: 'AI Voyager', duration: '2:45', color: '#00f2ff' },
  { id: 2, title: 'Cyber Glitch', artist: 'Circuit Breaker', duration: '3:12', color: '#ff00ea' },
  { id: 3, title: 'Midnight Drive', artist: 'Dusk Rider', duration: '4:20', color: '#39ff14' },
];

export default function App() {
  // Music State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentTrack = TRACKS[currentTrackIndex];

  // Game State
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [isPaused, setIsPaused] = useState(true);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Music Controls
  const toggleMusic = () => setIsPlaying(!isPlaying);
  const nextTrack = () => setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  const prevTrack = () => setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);

  // Game Logic
  const generateFood = (currentSnake: Point[]): Point => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isColliding = currentSnake.some((segment) => segment.x === newFood!.x && segment.y === newFood!.y);
      if (!isColliding) break;
    }
    return newFood;
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 10 });
    setDirection('RIGHT');
    setIsGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsPaused(false);
  };

  const moveSnake = () => {
    if (isGameOver || isPaused) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (direction) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      // Check collision with walls
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setIsGameOver(true);
        return prevSnake;
      }

      // Check collision with self
      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check collision with food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => {
          const newScore = s + 10;
          if (newScore > highScore) setHighScore(newScore);
          return newScore;
        });
        setFood(generateFood(newSnake));
        setSpeed((s) => Math.max(MIN_SPEED, s - SPEED_INCREMENT));
        // Don't pop tail if eating
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
        case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
        case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
        case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
        case ' ': setIsPaused(p => !p); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (!isGameOver && !isPaused) {
      gameLoopRef.current = setInterval(moveSnake, speed);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [speed, isGameOver, isPaused, direction]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center font-sans overflow-hidden p-4">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]"
          style={{ backgroundColor: TRACKS[currentTrackIndex].color }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px]"
          style={{ backgroundColor: '#ff00ea' }}
        />
      </div>

      {/* Header Info */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-8 z-10 px-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <Music className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Neon Snake & Beats</h1>
            <p className="text-xs text-white/40 uppercase tracking-widest font-mono">Precision / Pulse / Play</p>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/40 uppercase font-mono tracking-widest">Score</span>
            <span className="text-2xl font-bold text-cyan-400 tabular-nums">{score}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/40 uppercase font-mono tracking-widest">Best</span>
            <span className="text-2xl font-bold text-pink-500 tabular-nums">{highScore}</span>
          </div>
        </div>
      </div>

      {/* Main Game Window */}
      <div className="relative z-10 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="relative border border-white/5 bg-black/40 rounded-lg overflow-hidden">
          {/* Game Grid */}
          <div 
            className="grid"
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              width: '400px',
              height: '400px',
              maxWidth: '90vw',
              maxHeight: '90vw'
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const isSnake = snake.some((segment) => segment.x === x && segment.y === y);
              const isHead = snake[0].x === x && snake[0].y === y;
              const isFood = food.x === x && food.y === y;

              return (
                <div 
                  key={i} 
                  className="w-full h-full border-[0.5px] border-white/5 flex items-center justify-center"
                >
                  {isSnake && (
                    <motion.div 
                      layoutId={`snake-${x}-${y}`}
                      className={`w-4/5 h-4/5 rounded-sm ${isHead ? 'z-10 bg-white shadow-[0_0_10px_#fff]' : ''}`}
                      style={{ 
                        backgroundColor: isHead ? '#fff' : currentTrack.color,
                        boxShadow: isHead ? '0 0 15px #fff' : `0 0 10px ${currentTrack.color}`
                      }}
                    />
                  )}
                  {isFood && (
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-3/5 h-3/5 rounded-full bg-red-500 shadow-[0_0_15px_#ef4444]"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Game Over / Pause Overlays */}
          <AnimatePresence>
            {(isGameOver || isPaused) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
              >
                {isGameOver ? (
                  <div className="space-y-6">
                    <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
                    <div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Game Over</h2>
                      <p className="text-white/60">Final Score: <span className="text-white font-bold">{score}</span></p>
                    </div>
                    <button 
                      onClick={resetGame}
                      className="group flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-cyan-400 transition-colors"
                    >
                      <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Paused</h2>
                    <p className="text-white/60 mb-6">Music keeps you going...</p>
                    <button 
                      onClick={() => setIsPaused(false)}
                      className="bg-cyan-500 text-black px-8 py-3 rounded-full font-bold hover:bg-cyan-400 transition-all flex items-center gap-2"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Resume
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Music Controls (Player) */}
        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <motion.div 
                animate={isPlaying ? { rotate: 360 } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center p-1"
              >
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-500 to-pink-500 flex items-center justify-center">
                  <Music className="w-5 h-5 text-black" />
                </div>
              </motion.div>
              <div>
                <h3 className="text-sm font-bold leading-none mb-1">{currentTrack.title}</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">{currentTrack.artist}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-white/40" />
              <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-cyan-500"
                  animate={{ width: isPlaying ? '100%' : '60%' }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button onClick={prevTrack} className="text-white/60 hover:text-white transition-colors">
              <SkipBack className="w-6 h-6 fill-current" />
            </button>
            <button 
              onClick={toggleMusic}
              className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
            </button>
            <button onClick={nextTrack} className="text-white/60 hover:text-white transition-colors">
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
          </div>

          {/* Progress Bar Animation (Fake) */}
          <div className="mt-6 flex items-center gap-3">
             <span className="text-[10px] font-mono text-white/40 w-8">0:00</span>
             <div className="flex-1 h-[2px] bg-white/5 rounded-full overflow-hidden relative">
                <motion.div 
                  className="absolute h-full left-0 top-0 bg-white/20"
                  animate={{ width: isPlaying ? '100%' : '0%' }}
                  transition={{ duration: 165, ease: "linear" }}
                />
             </div>
             <span className="text-[10px] font-mono text-white/40 w-8">{currentTrack.duration}</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-12 text-center text-[10px] text-white/20 uppercase tracking-[0.2em] font-mono z-10">
        <p>Use Arrow Keys to Move • Space to Pause</p>
        <p className="mt-2">Neon Beats Engine v1.0.4 • Powered by AI</p>
      </div>
    </div>
  );
}

