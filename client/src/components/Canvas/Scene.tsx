import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '@/lib/store';

export default function Scene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const currentSection = useStore(state => state.currentSection);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#111111');
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 50);
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

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    // Create particles for background
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const positions = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 500 - 100; // Spread vertically
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.2,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Add section lights
    const sectionLights = [
      new THREE.PointLight(0xffa07a, 2, 50), // Home - Warm
      new THREE.PointLight(0x4169e1, 2, 50), // Services - Blue
      new THREE.PointLight(0xff1493, 2, 50), // Projects - Pink
      new THREE.PointLight(0xffffff, 2, 50), // About - White
      new THREE.PointLight(0xffa07a, 2, 50)  // Contact - Warm
    ];

    sectionLights.forEach((light, index) => {
      light.position.set(
        Math.sin(index * Math.PI * 0.4) * 20,
        -index * 100,
        Math.cos(index * Math.PI * 0.4) * 20
      );
      scene.add(light);
    });

    // Animation loop
    const animate = () => {
      if (!particles) return;
      particles.rotation.y += 0.0005;
      particles.rotation.x += 0.0002;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!camera || !renderer) return;
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
      y: currentSection * -100,
      duration: 2,
      ease: "power2.inOut"
    });

    gsap.to(cameraRef.current.rotation, {
      z: currentSection * Math.PI * 0.1,
      duration: 2,
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