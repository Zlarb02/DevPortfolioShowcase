interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="fixed bottom-0 left-0 w-full h-1 bg-black/10 z-50">
      <div 
        className="h-full bg-white transition-all duration-300 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}