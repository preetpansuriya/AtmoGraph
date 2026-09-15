import React, { useState, useRef, useEffect } from 'react'
import { Clock, Play, Pause, SkipBack, SkipForward } from 'lucide-react'

interface TimelineSliderProps {
  currentTime: number
  totalTime: number
  onTimeChange: (time: number) => void
}

const TimelineSlider: React.FC<TimelineSliderProps> = ({ 
  currentTime: propCurrentTime, 
  totalTime, 
  onTimeChange 
}) => {
  const [currentTime, setCurrentTime] = useState(propCurrentTime)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Sync local state with props
  useEffect(() => {
    setCurrentTime(propCurrentTime)
  }, [propCurrentTime])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    
    if (!isPlaying) {
      // Start playback
      playbackIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const nextTime = Math.min(totalTime - 1, prev + 1)
          onTimeChange(nextTime)
          if (nextTime >= totalTime - 1) {
            setIsPlaying(false)
            if (playbackIntervalRef.current) {
              clearInterval(playbackIntervalRef.current)
            }
          }
          return nextTime
        })
      }, 1000 / playbackSpeed)
    } else {
      // Stop playback
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
        playbackIntervalRef.current = null
      }
    }
  }

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
      }
    }
  }, [])

  const handlePrevious = () => {
    const newTime = Math.max(0, currentTime - 1)
    onTimeChange(newTime)
  }

  const handleNext = () => {
    const newTime = Math.min(totalTime - 1, currentTime + 1)
    onTimeChange(newTime)
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseInt(e.target.value)
    onTimeChange(newTime)
  }

  const formatTime = (time: number) => {
    if (totalTime <= 24) {
      return `${time}:00`
    } else if (totalTime <= 30) {
      return `Day ${time + 1}`
    } else {
      return `T-${time}`
    }
  }

  return (
    <div className="timeline-slider">
      <div className="timeline-header">
        <div className="timeline-info">
          <Clock size={16} className="timeline-icon" />
          <span className="timeline-label">Timeline Analysis</span>
        </div>
        <div className="timeline-controls">
          <button className="control-button" onClick={handlePrevious} title="Previous">
            <SkipBack size={16} />
          </button>
          <button 
            className={`control-button ${isPlaying ? 'playing' : ''}`} 
            onClick={handlePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button className="control-button" onClick={handleNext} title="Next">
            <SkipForward size={16} />
          </button>
        </div>
      </div>

      <div className="timeline-slider-container">
        <input
          type="range"
          min="0"
          max={totalTime - 1}
          value={currentTime}
          onChange={handleSliderChange}
          className="timeline-input"
        />
        <div className="timeline-labels">
          <span className="timeline-time">{formatTime(currentTime)}</span>
          <span className="timeline-total">of {formatTime(totalTime - 1)}</span>
        </div>
      </div>

      <div className="timeline-options">
        <div className="playback-speed">
          <span className="speed-label">Speed:</span>
          <select 
            value={playbackSpeed} 
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="speed-select"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
        </div>
        <div className="timeline-legend">
          <div className="legend-item">
            <div className="legend-color stable"></div>
            <span>Stable</span>
          </div>
          <div className="legend-item">
            <div className="legend-color warning"></div>
            <span>Warning</span>
          </div>
          <div className="legend-item">
            <div className="legend-color critical"></div>
            <span>Critical</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimelineSlider
