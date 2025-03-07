interface SectionContentProps {
  title: string;
  content: string;
}

export default function SectionContent({ title, content }: SectionContentProps) {
  return (
    <div className="text-center max-w-2xl mx-auto pointer-events-auto">
      <h2 className="text-4xl md:text-6xl font-bold mb-4 text-primary">
        {title}
      </h2>
      <p className="text-lg md:text-xl text-foreground/80">
        {content}
      </p>
    </div>
  );
}
