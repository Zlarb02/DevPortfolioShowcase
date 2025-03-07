import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStore } from '@/lib/store';

gsap.registerPlugin(ScrollTrigger);

export default function Scene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const lightsRef = useRef<THREE.Points>();
  const currentSection = useStore(state => state.currentSection);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffffff, 0.05);
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 20);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create floating lights
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 50;  // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200 - 50;  // y, spread across sections
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;  // z

      // Color - soft pastel colors
      colors[i * 3] = 0.8 + Math.random() * 0.2;  // r
      colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;  // g
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;  // b
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const points = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(points);
    lightsRef.current = points;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Animation loop
    const animate = () => {
      if (!lightsRef.current) return;

      // Gentle floating animation for lights
      lightsRef.current.rotation.y += 0.0005;
      const positions = lightsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.01;
      }
      lightsRef.current.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Handle section changes with smooth camera movement
  useEffect(() => {
    if (!cameraRef.current) return;

    gsap.to(cameraRef.current.position, {
      y: currentSection * -50,  // Increased spacing between sections
      duration: 1.5,
      ease: "power2.inOut"
    });
  }, [currentSection]);

  return (
    <div 
      ref={containerRef} 
      className="fixed top-0 left-0 w-full h-full z-[-1]"
    />
  );
}