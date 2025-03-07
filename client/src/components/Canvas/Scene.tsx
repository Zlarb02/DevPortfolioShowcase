
import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useStore } from "@/lib/store";

// Hardcoded colors for each section
const COLORS = {
  home: new THREE.Color(0xfff6e5),      // Warm white
  services: new THREE.Color(0xe5f6ff),   // Cool white
  projects: new THREE.Color(0xf5e6ff),   // Soft purple
  about: new THREE.Color(0xe6fff5),      // Mint
  contact: new THREE.Color(0xffe6e6)     // Soft pink
};

export default function Scene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const floorMaterialRef = useRef<THREE.MeshStandardMaterial>();
  const currentSection = useStore((state) => state.currentSection);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffffff, 0.008); // Reduced fog for better depth perception
    scene.background = COLORS.home;
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 2, 10); // Fixed height above ground
    cameraRef.current = camera;

    // Renderer setup with optimized quality
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      precision: "mediump", // Lower precision to reduce GPU load
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Lower pixel ratio
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap; // Use simpler shadow map
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add reflective floor
    const floorGeometry = new THREE.PlaneGeometry(100, 1000, 100, 100);
    // Use simpler material to avoid exceeding texture limits
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.home, // Start with first section color
      roughness: 0.3,
      metalness: 0.1,
    });
    floorMaterialRef.current = floorMaterial;
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = -400; // Center the long floor
    floor.receiveShadow = true;
    scene.add(floor);

    // Add geometric shapes for each section with enhanced materials
    const shapes = [];
    for (let i = 0; i < 5; i++) {
      let geometry;
      switch (i) {
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

      // Use simpler material to avoid exceeding texture limits
      const material = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        roughness: 0.1,
        metalness: 0.9,
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

    // Add fewer lights along the path with optimized shadow settings
    // Use a single directional light for main lighting
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(0, 10, 0);
    mainLight.castShadow = true;

    // Optimize shadow map settings
    mainLight.shadow.mapSize.width = 512; // Lower resolution
    mainLight.shadow.mapSize.height = 512; // Lower resolution
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    scene.add(mainLight);

    // Add just a few spotlights for effect (only 3 instead of 20)
    for (let i = 0; i < 3; i++) {
      const spotLight = new THREE.SpotLight(
        0xffffff,
        0.7,
        50,
        Math.PI / 6,
        0.5,
        1,
      );
      spotLight.position.set(0, 8, -i * 150 - 50);
      spotLight.castShadow = true;

      // Optimize shadow map settings
      spotLight.shadow.mapSize.width = 512;
      spotLight.shadow.mapSize.height = 512;

      scene.add(spotLight);
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

  // Handle section changes with smooth camera movement and hardcoded color transition
  useEffect(() => {
    if (!cameraRef.current || !sceneRef.current || !floorMaterialRef.current) return;

    // Move camera based on current section
    gsap.to(cameraRef.current.position, {
      z: 10 - currentSection * 100, // Move forward while keeping initial height
      duration: 1.5,
      ease: "power2.inOut",
    });

    // Use hardcoded colors based on section index
    let targetColor;
    switch (currentSection) {
      case 0:
        targetColor = COLORS.home;
        break;
      case 1:
        targetColor = COLORS.services;
        break;
      case 2:
        targetColor = COLORS.projects;
        break;
      case 3:
        targetColor = COLORS.about;
        break;
      case 4:
        targetColor = COLORS.contact;
        break;
      default:
        targetColor = COLORS.home;
    }

    // Apply the color to the scene background
    gsap.to(sceneRef.current.background as THREE.Color, {
      r: targetColor.r,
      g: targetColor.g,
      b: targetColor.b,
      duration: 1.5,
    });
    
    // Also apply the color to the floor
    gsap.to(floorMaterialRef.current.color, {
      r: targetColor.r,
      g: targetColor.g,
      b: targetColor.b,
      duration: 1.5,
    });
    
    console.log("Updating floor color to section:", currentSection, targetColor.getHex());
  }, [currentSection]);

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full z-[-1]"
    />
  );
}
