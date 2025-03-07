import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useStore } from "@/lib/store";

gsap.registerPlugin(ScrollTrigger);

// Section-specific colors for ambient lighting
const SECTION_COLORS = [
  new THREE.Color(0xfff6e5), // Warm white for Home
  new THREE.Color(0xe5f6ff), // Cool white for Services
  new THREE.Color(0xf5e6ff), // Soft purple for Projects
  new THREE.Color(0xe6fff5), // Mint for About
  new THREE.Color(0xffe6e6), // Soft pink for Contact
];

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
    scene.fog = new THREE.FogExp2(0xffffff, 0.008); // Reduced fog for better depth perception
    scene.background = SECTION_COLORS[0];
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

    // Renderer setup with enhanced quality
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      precision: "highp"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add reflective floor
    const floorGeometry = new THREE.PlaneGeometry(100, 1000, 100, 100);
    const floorMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.2,
      reflectivity: 0.5,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = -500; // Center the long floor
    floor.receiveShadow = true;
    scene.add(floor);

    // Add geometric shapes for each section with enhanced materials
    const shapes = [];
    for (let i = 0; i < 5; i++) {
      let geometry;
      switch(i) {
        case 0: // Home
          geometry = new THREE.TorusGeometry(3, 0.5, 32, 100);
          break;
        case 1: // Services
          geometry = new THREE.OctahedronGeometry(3, 2);
          break;
        case 2: // Projects
          geometry = new THREE.IcosahedronGeometry(3, 1);
          break;
        case 3: // About
          geometry = new THREE.DodecahedronGeometry(3, 1);
          break;
        case 4: // Contact
          geometry = new THREE.TorusKnotGeometry(2, 0.5, 128, 32);
          break;
      }

      const material = new THREE.MeshPhysicalMaterial({
        color: 0x6366f1,
        roughness: 0.1,
        metalness: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        reflectivity: 1.0,
        envMapIntensity: 1.5
      });

      const shape = new THREE.Mesh(geometry, material);
      shape.position.set(0, 0, -i * 100 - 50);
      shape.rotation.x = -Math.PI / 6;
      shape.castShadow = true;
      shape.receiveShadow = true;
      shapes.push(shape);
      scene.add(shape);
    }

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Add fixed lights along the path with shadows
    for (let i = 0; i < 10; i++) {
      const leftLight = new THREE.SpotLight(0xffffff, 0.8, 50, Math.PI / 4, 0.5, 1);
      const rightLight = new THREE.SpotLight(0xffffff, 0.8, 50, Math.PI / 4, 0.5, 1);

      leftLight.position.set(-5, 5, -i * 50);
      rightLight.position.set(5, 5, -i * 50);

      leftLight.castShadow = true;
      rightLight.castShadow = true;

      scene.add(leftLight);
      scene.add(rightLight);
    }

    // Animation loop with enhanced shape animation
    const animate = () => {
      shapes.forEach((shape) => {
        shape.rotation.y += 0.002;
        shape.rotation.z += 0.001;
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
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Handle section changes with smooth camera movement and enhanced color transition
  useEffect(() => {
    if (!cameraRef.current || !sceneRef.current) return;

    gsap.to(cameraRef.current.position, {
      z: 10 - currentSection * 100, // Move forward while keeping initial height
      duration: 1.5,
      ease: "power2.inOut"
    });

    // Smooth background color transition
    gsap.to(sceneRef.current.background as THREE.Color, {
      r: SECTION_COLORS[currentSection].r,
      g: SECTION_COLORS[currentSection].g,
      b: SECTION_COLORS[currentSection].b,
      duration: 1.5,
    });
  }, [currentSection]);

  return (
    <div 
      ref={containerRef} 
      className="fixed top-0 left-0 w-full h-full z-[-1]"
    />
  );
}