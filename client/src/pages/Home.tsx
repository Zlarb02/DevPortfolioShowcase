import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Scene from "@/components/Canvas/Scene";
import NavBar from "@/components/Layout/NavBar";
import Section from "@/components/Layout/Section";
import SectionContent from "@/components/Content/SectionContent";
import { useStore } from "@/lib/store";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  // Initialize with a small value to make progress bar visible
  const [scrollProgress, setScrollProgress] = useState(0.02);
  const setCurrentSection = useStore((state) => state.setCurrentSection);

  // Ajouter une référence à la section précédente pour détecter la direction du défilement
  const [prevScrollY, setPrevScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      // Add small offset to always show some progress
      const progress = 1 - window.scrollY / scrollHeight + 0.02;
      setScrollProgress(Math.min(progress, 1));

      // Detect scroll direction (inverted from normal)
      const isScrollingDown = window.scrollY < prevScrollY;
      setPrevScrollY(window.scrollY);

      // Calculate which section we're in (inverted)
      const numSections = 5; // Total number of sections
      const sectionHeight = scrollHeight / numSections;
      const invertedPosition = scrollHeight - window.scrollY;
      const newSection = Math.floor(invertedPosition / sectionHeight);

      // Update the store with the current section (bounded to valid sections)
      const boundedSection = Math.max(0, Math.min(numSections - 1, newSection));
      const exactPosition =
        newSection + (invertedPosition % sectionHeight) / sectionHeight;
      setCurrentSection(boundedSection, exactPosition, isScrollingDown);

      // Nous avons déjà calculé toutes ces valeurs ci-dessus avec la logique inversée,
      // donc nous n'avons pas besoin de ce code en double
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setCurrentSection, prevScrollY]);

  const handleProgressBarClick = (targetProgress: number) => {
    const totalHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = targetProgress * totalHeight;

    // Smooth scroll to target section
    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <Scene />
      {/* Scrollable container that sets the total height */}
      <div className="sections-container">
        {/* Fixed sections container */}
        <div className="fixed-sections pt-32">
          {" "}
          {/* Added top padding for navbar */}
          <Section id="home">
            <SectionContent
              title="Bienvenue"
              content="Développeur interactif spécialisé dans les expériences web immersives"
            />
          </Section>
          <Section id="services">
            <SectionContent
              title="Services"
              content="Développement Web • Visualisation 3D • Design Interactif"
            />
          </Section>
          <Section id="projects">
            <SectionContent
              title="Projets"
              content="Découvrez mes derniers travaux et expériences créatives"
            />
          </Section>
          <Section id="about">
            <SectionContent
              title="À Propos"
              content="Création d'expériences digitales qui repoussent les limites de la technologie web"
            />
          </Section>
          <Section id="contact">
            <SectionContent title="Contact" content="contact@pogodev.com" />
          </Section>
        </div>
      </div>
      <NavBar progress={scrollProgress} onNavigate={handleProgressBarClick} />
    </div>
  );
}
