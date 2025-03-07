import { useEffect, useState } from 'react';

interface NavBarProps {
  progress: number;
  onNavigate: (targetProgress: number) => void;
}

const SECTIONS = ['HOME', 'SERVICES', 'PROJECTS', 'ABOUT', 'CONTACT'];

export default function NavBar({ progress, onNavigate }: NavBarProps) {
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const sectionIndex = Math.floor(progress * SECTIONS.length);
    setActiveSection(sectionIndex);
  }, [progress]);

  const handleSectionClick = (index: number) => {
    onNavigate(index / (SECTIONS.length - 1));
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            {SECTIONS.map((section, index) => (
              <button
                key={section}
                onClick={() => handleSectionClick(index)}
                className={`tracking-widest text-sm font-light transition-colors ${
                  activeSection === index ? 'text-primary' : 'text-foreground/60'
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Progress bar below nav */}
      <div className="h-0.5 bg-black/5">
        <div 
          className="h-full bg-primary transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </nav>
  );
}
