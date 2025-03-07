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
  const currentSection = useStore(state => state.currentSection);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f5f5f5');
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 15);
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add point lights for each section
    const sectionLights = [
      new THREE.PointLight(0xffa07a, 1, 100), // Home
      new THREE.PointLight(0x4169e1, 1, 100), // Services
      new THREE.PointLight(0xff1493, 1, 100), // Projects
      new THREE.PointLight(0xffffff, 1, 100), // About
      new THREE.PointLight(0xffa07a, 1, 100)  // Contact
    ];

    sectionLights.forEach((light, index) => {
      light.position.set(5, -index * 10, 5);
      scene.add(light);
    });

    // Add a simple geometry for visual reference
    const geometry = new THREE.TorusKnotGeometry(2, 0.5, 100, 16);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x6366f1,
      roughness: 0.3,
      metalness: 0.7
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    // Animation loop
    const animate = () => {
      if (!torusKnot) return;
      torusKnot.rotation.x += 0.01;
      torusKnot.rotation.y += 0.01;
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
      y: currentSection * -10,
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