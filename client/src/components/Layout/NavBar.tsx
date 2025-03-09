import { useEffect, useState } from "react";

interface NavBarProps {
  progress: number;
  onNavigate: (targetProgress: number) => void;
}

const SECTIONS = ["ACCUEIL", "SERVICES", "PROJETS", "À PROPOS", "CONTACT"];

export default function NavBar({ progress, onNavigate }: NavBarProps) {
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const sectionIndex = Math.floor(progress * SECTIONS.length);
    setActiveSection(sectionIndex);
  }, [progress]);

  const handleSectionClick = (index: number) => {
    // Inverser la logique pour correspondre à l'inversion du défilement
    // Au lieu d'aller de 0 à 1, on va de 1 à 0
    onNavigate(1 - index / (SECTIONS.length - 1));
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="w-full mx-auto px-4">
        <div className="flex items-center justify-between w-full h-16">
          <div className="flex items-center space-x-8 w-full justify-between">
            {SECTIONS.map((section, index) => (
              <button
                key={section}
                onClick={() => handleSectionClick(index)}
                className={`tracking-widest text-sm font-light transition-colors ${
                  activeSection === index
                    ? "text-primary"
                    : "text-foreground/60"
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
