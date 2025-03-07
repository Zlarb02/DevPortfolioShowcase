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
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = window.scrollY / scrollHeight;
      setScrollProgress(progress);

      // Update current section based on scroll position
      const sectionHeight = window.innerHeight;
      const currentSection = Math.floor(window.scrollY / sectionHeight);
      setCurrentSection(currentSection);
    };

    // Set up smooth scrolling
    gsap.to("html, body", {
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      }
    });

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setCurrentSection]);

  return (
    <div className="relative">
      <Scene />
      <div className="relative">
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