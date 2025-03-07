import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Scene from '@/components/Canvas/Scene';
import ProgressBar from '@/components/Layout/ProgressBar';
import Section from '@/components/Layout/Section';
import SectionContent from '@/components/Content/SectionContent';
import { useStore } from '@/lib/store';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const setCurrentSection = useStore(state => state.setCurrentSection);

  useEffect(() => {
    const sections = document.querySelectorAll('.section-container');
    const totalSections = sections.length;

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

  const handleProgressBarClick = (targetProgress: number) => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = targetProgress * totalHeight;

    // Smooth scroll to target section
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative">
      <Scene />
      <div className="relative">
        <Section id="home" className="section-container">
          <SectionContent 
            title="Welcome"
            content="Interactive developer specializing in immersive web experiences"
          />
        </Section>
        <Section id="services" className="section-container">
          <SectionContent 
            title="Services"
            content="Web Development • 3D Visualization • Interactive Design"
          />
        </Section>
        <Section id="projects" className="section-container">
          <SectionContent 
            title="Projects"
            content="Explore my latest work and creative experiments"
          />
        </Section>
        <Section id="about" className="section-container">
          <SectionContent 
            title="About"
            content="Crafting digital experiences that push the boundaries of web technology"
          />
        </Section>
        <Section id="contact" className="section-container">
          <SectionContent 
            title="Contact"
            content="hello@pogodev.com"
          />
        </Section>
      </div>
      <ProgressBar 
        progress={scrollProgress} 
        onNavigate={handleProgressBarClick}
      />
    </div>
  );
}