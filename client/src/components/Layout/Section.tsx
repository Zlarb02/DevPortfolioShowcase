import { useEffect, useRef, useState, ReactNode } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface SectionProps {
  id: number | string;
  children: React.ReactNode;
  className?: string;
}

export default function Section({ id, children, className }: SectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { currentSection, exactScrollPosition, isScrollingDown } = useStore();

  // Si id est une chaîne, nous utilisons le comportement basé sur les IDs de section
  if (typeof id === "string") {
    const [state, setState] = useState<
      | "inactive"
      | "active"
      | "leaving-up"
      | "leaving-down"
      | "entering-up"
      | "entering-down"
    >("inactive");
    const prevSectionRef = useRef<number | null>(null);

    const SECTION_IDS = ["home", "services", "projects", "about", "contact"];
    const sectionIndex = SECTION_IDS.indexOf(id);

    useEffect(() => {
      // Si c'est la première fois, initialiser prevSectionRef
      if (prevSectionRef.current === null) {
        prevSectionRef.current = currentSection;

        if (currentSection === sectionIndex) {
          setState("active");
        }
        return;
      }

      const prevSection = prevSectionRef.current;

      // Déterminer si l'utilisateur défile vers le haut ou vers le bas
      const isScrollingDown = currentSection > prevSection;

      // Si cette section devient active
      if (currentSection === sectionIndex) {
        // Définir la classe d'entrée appropriée en fonction de la direction du défilement
        setState(isScrollingDown ? "entering-down" : "entering-up");

        // Appliquer la classe active après un court délai pour l'animation
        setTimeout(() => {
          setState("active");
        }, 50);
      }
      // Si cette section était active mais ne l'est plus
      else if (prevSection === sectionIndex) {
        // Définir la classe de sortie appropriée en fonction de la direction du défilement
        setState(isScrollingDown ? "leaving-up" : "leaving-down");

        // Revenir à l'état inactif après l'animation
        setTimeout(() => {
          setState("inactive");
        }, 500);
      }

      // Mettre à jour la référence à la section précédente
      prevSectionRef.current = currentSection;
    }, [currentSection, sectionIndex]);

    // Mapper l'état aux classes CSS
    const getClassName = () => {
      switch (state) {
        case "active":
          return "p-8 active";
        case "leaving-up":
          return "p-8 leaving-up";
        case "leaving-down":
          return "p-8 leaving-down";
        case "entering-up":
          return "p-8 entering-up";
        case "entering-down":
          return "p-8 entering-down";
        default:
          return "p-8";
      }
    };

    return (
      <section id={id.toString()} className={getClassName()}>
        {children}
      </section>
    );
  }
  // Si id est un nombre, nous utilisons le comportement basé sur les classes
  else {
    useEffect(() => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;

      // Clear previous classes
      section.classList.remove(
        "active",
        "leaving-up",
        "leaving-down",
        "entering-up",
        "entering-down"
      );

      if (id === currentSection) {
        section.classList.add("active");
      } else if (id < currentSection) {
        // Inverser la logique pour l'animation
        section.classList.add(
          isScrollingDown ? "leaving-down" : "entering-down"
        );
      } else if (id > currentSection) {
        // Inverser la logique pour l'animation
        section.classList.add(isScrollingDown ? "entering-up" : "leaving-up");
      }
    }, [id, currentSection, exactScrollPosition, isScrollingDown]);

    return (
      <section ref={sectionRef} className={cn("section", className)}>
        {children}
      </section>
    );
  }
}
