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
    // Prevent default scroll behavior
    document.body.style.overflow = 'hidden';

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY;
      const scrollHeight = window.innerHeight * 4; // 5 sections - 1
      const currentScroll = window.scrollY;
      const newScroll = Math.max(0, Math.min(scrollHeight, currentScroll + delta));

      window.scrollTo({
        top: newScroll,
        behavior: 'smooth'
      });

      const progress = newScroll / scrollHeight;
      setScrollProgress(progress);

      // Update current section
      const currentSection = Math.floor((progress * 5));
      setCurrentSection(currentSection);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      document.body.style.overflow = 'auto';
    };
  }, [setCurrentSection]);

  return (
    <div className="h-[500vh] relative">
      <Scene />
      <div className="fixed top-0 left-0 w-full h-screen pointer-events-none">
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