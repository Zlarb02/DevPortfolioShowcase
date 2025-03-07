import { ReactNode, useEffect, useState } from 'react';
import { useStore } from '@/lib/store';

interface SectionProps {
  id: string;
  children: ReactNode;
}

export default function Section({ id, children }: SectionProps) {
  const [isActive, setIsActive] = useState(false);
  const currentSection = useStore(state => state.currentSection);

  useEffect(() => {
    const sectionIndex = ['home', 'services', 'projects', 'about', 'contact'].indexOf(id);
    setIsActive(currentSection === sectionIndex);
  }, [currentSection, id]);

  return (
    <section 
      id={id}
      className={`section-container p-8 ${isActive ? 'active' : ''}`}
    >
      {children}
    </section>
  );
}