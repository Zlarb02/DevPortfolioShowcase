interface ProgressBarProps {
  progress: number;
  onNavigate: (targetProgress: number) => void;
}

export default function ProgressBar({ progress, onNavigate }: ProgressBarProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const targetProgress = clickX / rect.width;
    onNavigate(targetProgress);
  };

  return (
    <div 
      className="fixed bottom-0 left-0 w-full h-1 bg-black/10 cursor-pointer"
      onClick={handleClick}
    >
      <div 
        className="h-full bg-primary transition-all duration-100"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}