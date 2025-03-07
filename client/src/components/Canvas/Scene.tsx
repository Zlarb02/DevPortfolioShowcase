import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import Lights from "./Lights";
import { useStore } from "@/lib/store";

// Define section colors
export const SECTION_COLORS = [
  new THREE.Color(0xff9e7a), // Home - Soft orange
  new THREE.Color(0x4169e1), // Services - Royal blue
  new THREE.Color(0xff1493), // Projects - Pink
  new THREE.Color(0x20b2aa), // About - Light sea green
  new THREE.Color(0xffd700), // Contact - Gold
];

// The actual 3D scene content
function SceneContent() {
  const sceneRef = useRef<THREE.Scene>(null!);
  const floorRef = useRef<THREE.Mesh>(null!);
  const [lightsInstance, setLightsInstance] = useState<Lights | null>(null);
  const currentSection = useStore((state) => state.currentSection);
  const { scene } = useThree();

  // Initialize scene once
  useEffect(() => {
    if (!sceneRef.current) {
      sceneRef.current = scene;

      // Create light setup
      const lights = new Lights(scene);
      lights.setup();
      setLightsInstance(lights);

      // Create floor
      const floorGeometry = new THREE.PlaneGeometry(100, 1000, 100, 100);
      // Use simpler material to avoid exceeding texture limits
      const floorMaterial = new THREE.MeshStandardMaterial({
        color: SECTION_COLORS[0], // Start with first section color
        roughness: 0.3,
        metalness: 0.1,
      });

      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.position.z = -400; // Center the long floor
      floor.receiveShadow = true;
      floor.name = "floor"; // Give the floor a name to easily find it later
      scene.add(floor);
      floorRef.current = floor;

      // Add geometric shapes for each section with enhanced materials
      // Home section - Sphere
      const homeSphereGeometry = new THREE.SphereGeometry(5, 32, 32);
      const homeSphereMaterial = new THREE.MeshStandardMaterial({
        color: SECTION_COLORS[0],
        metalness: 0.7,
        roughness: 0.2,
      });
      const homeSphere = new THREE.Mesh(homeSphereGeometry, homeSphereMaterial);
      homeSphere.position.set(0, 3, 0);
      homeSphere.castShadow = true;
      scene.add(homeSphere);

      // Services section - Torus
      const servicesGeometry = new THREE.TorusGeometry(4, 1.5, 16, 100);
      const servicesTorusMaterial = new THREE.MeshStandardMaterial({
        color: SECTION_COLORS[1],
        metalness: 0.5,
        roughness: 0.3,
      });
      const servicesTorus = new THREE.Mesh(
        servicesGeometry,
        servicesTorusMaterial,
      );
      servicesTorus.position.set(0, 3, -100);
      servicesTorus.castShadow = true;
      scene.add(servicesTorus);

      // Projects section - Multiple cubes in formation
      const projectsCubesGroup = new THREE.Group();
      for (let i = 0; i < 5; i++) {
        const cubeSize = 2 + Math.random() * 2;
        const cubeGeometry = new THREE.BoxGeometry(
          cubeSize,
          cubeSize,
          cubeSize,
        );
        const cubeMaterial = new THREE.MeshStandardMaterial({
          color: SECTION_COLORS[2],
          metalness: 0.8,
          roughness: 0.1,
        });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        const angle = (i / 5) * Math.PI * 2;
        const radius = 6;
        cube.position.set(
          Math.cos(angle) * radius,
          3 + Math.sin(i * 0.5) * 2,
          -200 + Math.sin(angle) * radius,
        );
        cube.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        );
        cube.castShadow = true;
        projectsCubesGroup.add(cube);
      }
      scene.add(projectsCubesGroup);

      // About section - Icosahedron
      const aboutGeometry = new THREE.IcosahedronGeometry(5, 0);
      const aboutMaterial = new THREE.MeshStandardMaterial({
        color: SECTION_COLORS[3],
        metalness: 0.4,
        roughness: 0.6,
      });
      const aboutShape = new THREE.Mesh(aboutGeometry, aboutMaterial);
      aboutShape.position.set(0, 3, -300);
      aboutShape.castShadow = true;
      scene.add(aboutShape);

      // Contact section - Torusknot
      const contactGeometry = new THREE.TorusKnotGeometry(3.5, 1, 100, 16);
      const contactMaterial = new THREE.MeshStandardMaterial({
        color: SECTION_COLORS[4],
        metalness: 0.6,
        roughness: 0.3,
      });
      const contactShape = new THREE.Mesh(contactGeometry, contactMaterial);
      contactShape.position.set(0, 3, -400);
      contactShape.castShadow = true;
      scene.add(contactShape);
    }
  }, [scene]);

  // Update when section changes
  useEffect(() => {
    if (!floorRef.current) return;

    // Change background color based on section
    gsap.to(document.documentElement.style, {
      "--background": SECTION_COLORS[currentSection].getStyle(),
      duration: 1.5,
    });

    // Update floor color
    if (
      floorRef.current &&
      floorRef.current.material instanceof THREE.MeshStandardMaterial
    ) {
      console.log(
        "Updating floor color to section:",
        currentSection,
        SECTION_COLORS[currentSection],
      );
      gsap.to(floorRef.current.material.color, {
        r: SECTION_COLORS[currentSection].r,
        g: SECTION_COLORS[currentSection].g,
        b: SECTION_COLORS[currentSection].b,
        duration: 1.5,
      });
    } else {
      console.warn(
        "Floor mesh not found or material is not MeshStandardMaterial",
      );
    }
  }, [currentSection]);

  // Animation for shapes
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    // Animate shapes based on which section is active
    const shapes = sceneRef.current.children.filter(
      (child) => child instanceof THREE.Mesh && child.name !== "floor",
    );

    shapes.forEach((shape, index) => {
      if (shape instanceof THREE.Mesh) {
        // Give each shape a slightly different animation
        shape.rotation.x = Math.sin(elapsedTime * 0.3 + index) * 0.2;
        shape.rotation.y = Math.sin(elapsedTime * 0.2 + index) * 0.3;

        // Make the current section's shape more animated
        const sectionIndex = Math.floor(index / 2);
        if (sectionIndex === currentSection) {
          shape.rotation.z += 0.01;
          shape.position.y = 3 + Math.sin(elapsedTime) * 0.5;
        }
      }
    });
  });

  return null;
}

// Wrapper component that provides the Canvas
export default function Scene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 5, 10], fov: 75 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    >
      <SceneContent />
    </Canvas>
  );
}
