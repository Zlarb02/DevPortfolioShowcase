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
    scene.fog = new THREE.FogExp2(0xffffff, 0.015); // Subtle fog for depth
    scene.background = new THREE.Color(0xf0f0f0); // Slightly darker background
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 10); // Fixed height above ground
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

    // Add floor
    const floorGeometry = new THREE.PlaneGeometry(100, 1000, 100, 100);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = -500; // Center the long floor
    scene.add(floor);

    // Add geometric shapes for each section
    const shapes = [];
    for (let i = 0; i < 5; i++) {
      let geometry;
      switch(i) {
        case 0: // Home
          geometry = new THREE.TorusGeometry(3, 0.5, 16, 50);
          break;
        case 1: // Services
          geometry = new THREE.OctahedronGeometry(3);
          break;
        case 2: // Projects
          geometry = new THREE.IcosahedronGeometry(3);
          break;
        case 3: // About
          geometry = new THREE.DodecahedronGeometry(3);
          break;
        case 4: // Contact
          geometry = new THREE.TorusKnotGeometry(2, 0.5);
          break;
      }

      const material = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        roughness: 0.3,
        metalness: 0.7,
      });

      const shape = new THREE.Mesh(geometry, material);
      shape.position.set(0, 0, -i * 100 - 50); // Space shapes along the path
      shape.rotation.x = -Math.PI / 6; // Tilt slightly for better visibility
      shapes.push(shape);
      scene.add(shape);
    }

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Add fixed lights along the path
    for (let i = 0; i < 10; i++) {
      const leftLight = new THREE.PointLight(0xffffff, 1, 50);
      const rightLight = new THREE.PointLight(0xffffff, 1, 50);

      leftLight.position.set(-5, 3, -i * 50);
      rightLight.position.set(5, 3, -i * 50);

      scene.add(leftLight, rightLight);
    }

    // Animation loop
    const animate = () => {
      // Animate shapes
      shapes.forEach((shape, i) => {
        shape.rotation.y += 0.002;
      });

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
      z: 10 - currentSection * 100, // Move forward while keeping initial height
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