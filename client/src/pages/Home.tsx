import { useEffect, useState } from 'react';
import Scene from '@/components/Canvas/Scene';
import ProgressBar from '@/components/Layout/ProgressBar';
import Section from '@/components/Layout/Section';
import SectionContent from '@/components/Content/SectionContent';
import { useStore } from '@/lib/store';

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const setCurrentSection = useStore(state => state.setCurrentSection);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = window.scrollY / scrollHeight;
      setScrollProgress(progress);
      
      // Update current section based on scroll position
      const sectionHeight = window.innerHeight;
      const currentSection = Math.floor(window.scrollY / sectionHeight);
      setCurrentSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setCurrentSection]);

  return (
    <div className="min-h-[500vh] relative">
      <Scene />
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <Section id="home">
          <SectionContent 
            title="Welcome"
            content="Interactive developer specializing in immersive web experiences"
          />
        </Section>
        <Section id="services">
          <SectionContent 
            title="Services"
            content="Web Development • 3D Visualization • Interactive Design"
          />
        </Section>
        <Section id="projects">
          <SectionContent 
            title="Projects"
            content="Explore my latest work and creative experiments"
          />
        </Section>
        <Section id="about">
          <SectionContent 
            title="About"
            content="Crafting digital experiences that push the boundaries of web technology"
          />
        </Section>
        <Section id="contact">
          <SectionContent 
            title="Contact"
            content="hello@pogodev.com"
          />
        </Section>
      </div>
      <ProgressBar progress={scrollProgress} />
    </div>
  );
}
