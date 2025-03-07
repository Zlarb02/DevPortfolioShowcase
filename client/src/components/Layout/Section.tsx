import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

interface SectionProps {
  id: string;
  children: React.ReactNode;
}

export default function Section({ id, children }: SectionProps) {
  const [isActive, setIsActive] = useState(false);
  const currentSection = useStore(state => state.currentSection);
  const sectionIndex = ['home', 'services', 'projects', 'about', 'contact'].indexOf(id);

  useEffect(() => {
    const isNowActive = currentSection === sectionIndex;
    setIsActive(isNowActive);
    if (isNowActive) {
      console.log(`Section ${id} is now active`);
    }
  }, [currentSection, sectionIndex, id]);

  return (
    <section id={id} className={`${isActive ? 'active' : ''}`} data-section-id={id}>
      {children}
    </section>
  );
}