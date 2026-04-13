interface SeekBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function SeekBar({ currentTime, duration, onSeek }: SeekBarProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(Number(e.target.value));
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-xs text-text-muted tabular-nums min-w-[36px] text-right">
        {formatTime(currentTime)}
      </span>
      <div className="relative flex-1 h-5 flex items-center group">
        <div className="absolute inset-x-0 h-1 rounded-full bg-bg-tertiary">
          <div
            className="h-full rounded-full bg-accent group-hover:bg-accent-hover transition-colors"
            style={{ width: `${progress}%` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleChange}
          className="absolute inset-x-0 w-full h-1 opacity-0 cursor-pointer"
          aria-label="재생 위치"
        />
      </div>
      <span className="text-xs text-text-muted tabular-nums min-w-[36px]">
        {formatTime(duration)}
      </span>
    </div>
  );
}
