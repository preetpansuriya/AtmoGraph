import React from 'react';
import { Play, Pause, RotateCcw, FastForward, Clock, Zap, AlertCircle } from 'lucide-react';

interface TimelineSliderProps {
  currentDay: number;
  isPlaying: boolean;
  onChangeDay: (day: number) => void;
  onTogglePlay: () => void;
  onReset: () => void;
  isDark: boolean;
}

export const TimelineSlider: React.FC<TimelineSliderProps> = ({
  currentDay,
  isPlaying,
  onChangeDay,
  onTogglePlay,
  onReset,
  isDark,
}) => {
  const milestones = [
    { day: 0, label: 't₀: Baseline', detail: 'Normal ops' },
    { day: 3, label: 't₃: Malacca Queue', detail: '+42h dwell' },
    { day: 7, label: 't₇: Wafer Feeder', detail: 'Taiwan Strait gale' },
    { day: 10, label: 't₁₀: Port LA Chassis', detail: 'Rail bottleneck' },
    { day: 14, label: 't₁₄: Texas Giga Line', detail: 'Inventory stockout' },
  ];

  return (
    <div className={`w-full rounded-2xl border p-4 backdrop-blur-xl shadow-2xl transition-all ${
      isDark ? 'bg-slate-950/85 border-slate-800 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-900'
    }`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Playback Controls & Temporal Label */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onReset}
              className="p-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
              title="Reset to Day 0 (Baseline)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onTogglePlay}
              id="btn-play-timeline"
              className="p-2.5 rounded-xl border border-cyan-500/50 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
              title={isPlaying ? 'Pause Simulation' : 'Play Cascade Simulation'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                TEMPORAL CASCADE: DAY +{currentDay}
              </span>
            </div>
            <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Forecast Window: 0 - 14 Days Ahead
            </span>
          </div>
        </div>

        {/* Interactive Scrub Slider with Milestones */}
        <div className="w-full flex-1 max-w-2xl px-2 space-y-2">
          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max="14"
              step="1"
              value={currentDay}
              onChange={e => onChangeDay(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Milestone markers */}
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            {milestones.map(m => (
              <button
                key={m.day}
                onClick={() => onChangeDay(m.day)}
                className={`text-left hover:text-cyan-400 transition-colors cursor-pointer ${
                  currentDay === m.day ? 'text-cyan-400 font-bold' : ''
                }`}
              >
                <div>{m.label}</div>
                <div className="hidden sm:block text-[9px] text-slate-500">{m.detail}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Shockwave Propagation Rate */}
        <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-slate-700/60 font-mono text-xs">
          <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Velocity</div>
            <div className="font-bold text-red-400">{(1.45 + currentDay * 0.18).toFixed(2)}x Multiplier</div>
          </div>
        </div>
      </div>
    </div>
  );
};
