interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="fixed bottom-0 left-0 w-full h-1 bg-black/10">
      <div 
        className="h-full bg-primary transition-all duration-100"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
