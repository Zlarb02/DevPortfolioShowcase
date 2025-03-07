import { useEffect, useRef } from "react";
import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import gsap from "gsap";
import { useStore } from "@/lib/store";
import { Bird } from "./Bird";
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Bird class is now imported from ./Bird

// Hardcoded colors for each section with more pronounced values
const COLORS = {
  home: new THREE.Color("#f9e8d0"), // Plus prononcé que Warm white
  services: new THREE.Color("#d0e8f9"), // Plus prononcé que Cool white
  projects: new THREE.Color("#e8d0f9"), // Plus prononcé que Soft purple
  about: new THREE.Color("#d0f9e8"), // Plus prononcé que Mint
  contact: new THREE.Color("#f9d0d0"), // Plus prononcé que Soft pink
};

export default function Scene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const floorMaterialRef = useRef<THREE.MeshStandardMaterial>();
  const currentSection = useStore((state) => state.currentSection);
  const fontLoader = new FontLoader();


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
    const floorGeometry = new THREE.PlaneGeometry(200, 1000, 200, 100);
    // Créer le matériau du sol avec une couleur plus visible
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.home, // Start with first section color
      roughness: 0.1,
      metalness: 0.3,
      side: THREE.DoubleSide, // Visible des deux côtés
    });
    console.log("Floor material color initialized to:", COLORS.home);
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

    // Create section-specific lights with appropriate colors
    const sectionLights = {
      home: [
        new THREE.AmbientLight(0xf9e8d0, 0.5),
        new THREE.DirectionalLight(0xffa07a, 1)
      ],
      services: [
        new THREE.AmbientLight(0xd0e8f9, 0.3),
        new THREE.SpotLight(0x4169e1, 1)
      ],
      projects: [
        new THREE.AmbientLight(0xe8d0f9, 0.4),
        new THREE.PointLight(0xff1493, 1),
        new THREE.PointLight(0x4169e1, 1)
      ],
      about: [
        new THREE.AmbientLight(0xd0f9e8, 0.7),
        new THREE.DirectionalLight(0xffffff, 0.5)
      ],
      contact: [
        new THREE.AmbientLight(0xf9d0d0, 0.4),
        new THREE.SpotLight(0xffa07a, 1)
      ]
    };

    // Position the lights
    // Home section
    sectionLights.home[1].position.set(5, 5, -50);
    sectionLights.home[1].castShadow = true;

    // Services section
    sectionLights.services[1].position.set(-5, 5, -150);
    (sectionLights.services[1] as THREE.SpotLight).angle = Math.PI / 4;
    sectionLights.services[1].castShadow = true;

    // Projects section
    sectionLights.projects[1].position.set(5, 5, -250);
    sectionLights.projects[2].position.set(-5, 5, -250);
    sectionLights.projects[1].castShadow = true;
    sectionLights.projects[2].castShadow = true;

    // About section
    sectionLights.about[1].position.set(0, 5, -350);
    sectionLights.about[1].castShadow = true;

    // Contact section
    sectionLights.contact[1].position.set(0, 5, -450);
    (sectionLights.contact[1] as THREE.SpotLight).angle = Math.PI / 3;
    sectionLights.contact[1].castShadow = true;

    // Optimize shadow map settings for all lights
    Object.values(sectionLights).flat().forEach(light => {
      if (light instanceof THREE.DirectionalLight || light instanceof THREE.SpotLight) {
        light.shadow.mapSize.width = 512;
        light.shadow.mapSize.height = 512;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 50;
      }
      scene.add(light);
    });

    // Créer des groupes d'oiseaux en formation V
    const createBirdFlocks = () => {
      const flocks = [];
      // Créer plusieurs formations réparties sur toutes les sections
      // Ajouter plus d'oiseaux aux sections extrêmes
      for (let f = 0; f < 7; f++) {
        const flock = [];

        // Distribution spéciale pour avoir plus d'oiseaux dans les sections extrêmes
        let sectionZ;
        if (f < 2) {
          // Premières formations dans la section welcome (plus dense)
          sectionZ = -20 - (f * 30);
        } else if (f > 4) {
          // Dernières formations dans la section contact (plus dense)
          sectionZ = -380 - ((f-5) * 30);
        } else {
          // Formations du milieu, réparties normalement
          sectionZ = -100 - ((f-2) * 80);
        }

        // Hauteur constante pour tous les oiseaux (vol parallèle au sol)
        const flightHeight = 6 + Math.random() * 4; // Hauteur entre 6 et 10
        
        // Créer un leader avec position stable
        const leaderPos = new THREE.Vector3(
          (Math.random() - 0.5) * 20, // Moins d'étalement horizontal
          flightHeight,                // Hauteur constante
          sectionZ
        );
        const leader = new Bird(scene, leaderPos);

        // Activer les ombres pour les oiseaux
        leader.mesh.castShadow = true;

        flock.push(leader);

        // Créer les suiveurs en formation V plus resserrée et cohérente
        const flockSize = 4 + Math.floor(Math.random() * 3); // Réduire légèrement la taille du groupe
        for (let i = 0; i < flockSize; i++) {
          const side = i % 2 === 0 ? 1 : -1;
          const row = Math.floor(i / 2) + 1;

          // Formation plus resserrée avec altitude constante
          const followerPos = new THREE.Vector3(
            leaderPos.x + side * row * 1.2,
            flightHeight - (Math.random() * 0.5), // Légère variation d'altitude
            leaderPos.z - row * 1.5
          );

          const bird = new Bird(scene, followerPos, leader);
          bird.mesh.castShadow = true;
          flock.push(bird);
        }

        flocks.push(flock);
      }
      return flocks;
    };

    const birdFlocks = createBirdFlocks();

    // Function to add 3D text
    const add3DText = async (text: string, x: number, y: number, z: number) => {
      try {
        // Use relative path instead of absolute path
        const fontUrl = './assets/fonts/helvetiker_regular.typeface.json';
        const font = await new Promise<THREE.Font>((resolve, reject) => {
          fontLoader.load(
            fontUrl,
            resolve,
            undefined,
            (err) => {
              console.error('Font loading error:', err);
              reject(err);
            }
          );
        });
        
        // Réduit l'épaisseur et les biseaux pour plus de finesse
        const geometry = new TextGeometry(text, {
          font: font,
          size: 3, // Texte plus grand
          height: 0.1, // Moins épais
          curveSegments: 16, // Plus de détails
          bevelEnabled: true,
          bevelThickness: 0.01, // Biseaux plus fins
          bevelSize: 0.01,
          bevelOffset: 0,
          bevelSegments: 8,
        });
        
        // Centrer le texte pour un meilleur positionnement
        geometry.computeBoundingBox();
        const textWidth = geometry.boundingBox?.max.x || 0;
        geometry.translate(-textWidth / 2, 0, 0);
        
        // Matériau brillant avec une lumière émissive pour être plus visible
        const material = new THREE.MeshStandardMaterial({ 
          color: 0xffffff,
          emissive: 0x333333, // Légère émission de lumière
          metalness: 0.3,
          roughness: 0.2
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Positionner le texte au sol avec une légère inclinaison pour être lisible
        mesh.position.set(x, y, z);
        mesh.rotation.x = -Math.PI / 8; // Légère inclinaison pour une meilleure lecture
        
        // Ajouter des ombres pour une meilleure intégration
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        
        // Ajouter un point lumineux au-dessus du texte pour l'éclairer
        const textLight = new THREE.PointLight(0xffffff, 1, 20);
        textLight.position.set(x, y + 5, z);
        textLight.castShadow = true;
        scene.add(textLight);
        
      } catch (error) {
        console.error('Failed to add 3D text:', error);
        // Create a fallback for text if font loading fails
        const fallbackGeometry = new THREE.BoxGeometry(text.length * 0.5, 1, 0.1);
        const fallbackMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
        fallbackMesh.position.set(x, y, z);
        scene.add(fallbackMesh);
      }
    };

    // Add 3D text at various positions - positionner au niveau du sol
    const textPositions = [
      { text: 'Bienvenue', x: 0, y: 0, z: -100 },
      { text: 'Services', x: 0, y: 0, z: -200 },
      { text: 'Projets', x: 0, y: 0, z: -300 },
      { text: 'A propos', x: 0, y: 0, z: -400 },
      { text: 'Contact', x: 0, y: 0, z: -500 },
    ];
    textPositions.forEach(pos => add3DText(pos.text, pos.x, pos.y, pos.z));


    // Animation loop with enhanced shape animation
    const animate = () => {
      shapes.forEach((shape) => {
        shape.rotation.y += 0.002;
        shape.rotation.z += 0.001;
      });

      // Animer les oiseaux
      birdFlocks.forEach(flock => {
        flock.forEach(bird => bird.update());
      });

      // Debug - afficher nombre d'oiseaux (première exécution seulement)
      if (!window.birdsLogged) {
        const totalBirds = birdFlocks.reduce((sum, flock) => sum + flock.length, 0);
        console.log(`Nombre total d'oiseaux créés: ${totalBirds}`);
        console.log(`Position du premier oiseau: `, birdFlocks[0][0].position);
        window.birdsLogged = true;
      }

      // Ensure floor material is updated
      if (floorMaterialRef.current) {
        floorMaterialRef.current.needsUpdate = true;
      }

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

      // Nettoyer les oiseaux
      birdFlocks.forEach(flock => {
        flock.forEach(bird => {
          scene.remove(bird.mesh);
          bird.mesh.geometry.dispose();
          (bird.mesh.material as THREE.Material).dispose();
        });
      });

      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Get the exact scroll position for smoother camera movement
  const exactScrollPosition = useStore((state) => state.exactScrollPosition);

  // Handle camera movement based on exact scroll position
  useEffect(() => {
    if (!cameraRef.current || !sceneRef.current || !floorMaterialRef.current)
      return;

    // Calculate the target camera position based on exact scroll position
    const targetZ = 10 - exactScrollPosition * 100;

    // Calculate the threshold values for accelerating camera movement
    const currentSectionThreshold = Math.floor(exactScrollPosition);
    const nextSectionThreshold = currentSectionThreshold + 0.8;
    const acceleration = exactScrollPosition > nextSectionThreshold ? 2.5 : 1;

    // Move camera with variable speed based on threshold
    gsap.to(cameraRef.current.position, {
      z: targetZ,
      duration: acceleration === 1 ? 0.8 : 0.5, // Faster when accelerating
      ease: acceleration === 1 ? "power1.out" : "power2.inOut",
    });

    // Determine which section we're in (same as before)
    const currentSection = Math.floor(exactScrollPosition);

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

    // Apply the color to the scene background with longer duration for smoother transitions
    gsap.to(sceneRef.current.background as THREE.Color, {
      r: targetColor.r,
      g: targetColor.g,
      b: targetColor.b,
      duration: 1.5,
    });

    // Update floor material color to match the current section
    if (floorMaterialRef.current) {
      // Directement assigner la couleur pour un effet immédiat
      floorMaterialRef.current.color = targetColor.clone();

      // Indiquer explicitement que le matériau a besoin d'être mis à jour
      floorMaterialRef.current.needsUpdate = true;

      console.log("Updated floor material color to:", 
        targetColor, 
        "for section:", 
        currentSection);
    }

    // Adjusting light intensities based on current section
    if (sceneRef.current) {
      const lights = sceneRef.current.children.filter(
        child => child instanceof THREE.Light
      ) as THREE.Light[];

      // Calculate distance factors for each section's lights
      // to create a smooth transition between sections
      const sectionKeys = ['home', 'services', 'projects', 'about', 'contact'];
      const sectionIdx = currentSection;
      const fraction = exactScrollPosition - sectionIdx;

      // Adjust intensity of each light based on distance to current scroll position
      lights.forEach((light) => {
        // Get the section this light belongs to
        const lightZPosition = light.position.z;
        const lightSectionIdx = Math.round(Math.abs(lightZPosition) / 100);

        // Calculate distance factor (closer to 1 when this is the active section)
        const distance = Math.abs(sectionIdx - lightSectionIdx) + fraction;
        const intensity = 1 - Math.min(distance * 0.7, 0.9); // Keep minimum 0.1 intensity

        // Apply intensity based on light type
        if (light instanceof THREE.AmbientLight) {
          gsap.to(light, { intensity: 0.3 + intensity * 0.7, duration: 1 });
        } else if (light instanceof THREE.DirectionalLight || 
                  light instanceof THREE.SpotLight || 
                  light instanceof THREE.PointLight) {
          gsap.to(light, { intensity: intensity * 1.2, duration: 1 });
        }
      });
    }
  }, [exactScrollPosition]);

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full z-[-1]"
    />
  );
}