import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useStore } from "@/lib/store";
import { Bird } from "./Bird";
import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

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
      1000
    );
    camera.position.set(0, 3, 10); // Fixed height above ground
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
    const floorGeometry = new THREE.PlaneGeometry(600, 1000, 600, 100);
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
    const shapes: THREE.Mesh<
      | THREE.TorusGeometry
      | THREE.OctahedronGeometry
      | THREE.IcosahedronGeometry
      | THREE.DodecahedronGeometry
      | THREE.TorusKnotGeometry,
      THREE.MeshStandardMaterial,
      THREE.Object3DEventMap
    >[] = [];
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
        new THREE.DirectionalLight(0xffa07a, 1),
      ],
      services: [
        new THREE.AmbientLight(0xd0e8f9, 0.3),
        new THREE.SpotLight(0x4169e1, 1),
      ],
      projects: [
        new THREE.AmbientLight(0xe8d0f9, 0.4),
        new THREE.PointLight(0xff1493, 1),
        new THREE.PointLight(0x4169e1, 1),
      ],
      about: [
        new THREE.AmbientLight(0xd0f9e8, 0.7),
        new THREE.DirectionalLight(0xffffff, 0.5),
      ],
      contact: [
        new THREE.AmbientLight(0xf9d0d0, 0.4),
        new THREE.SpotLight(0xffa07a, 1),
      ],
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
    Object.values(sectionLights)
      .flat()
      .forEach((light) => {
        if (
          light instanceof THREE.DirectionalLight ||
          light instanceof THREE.SpotLight
        ) {
          light.shadow.mapSize.width = 512;
          light.shadow.mapSize.height = 512;
          light.shadow.camera.near = 0.5;
          light.shadow.camera.far = 50;
        }
        scene.add(light);
      });

    // Créer des oiseaux distribués dans la scène
    const createBirds = () => {
      const birds = [];
      // Créer 30 oiseaux distribués dans l'espace
      const totalBirds = 30;

      for (let i = 0; i < totalBirds; i++) {
        // Répartir les oiseaux sur différentes sections de la scène
        const sectionZ = -20 - Math.random() * 500; // Entre -20 et -520

        // Position aléatoire mais visible
        const position = new THREE.Vector3(
          (Math.random() - 0.5) * 40, // Largeur: entre -20 et 20
          5 + Math.random() * 15, // Hauteur: entre 5 et 20
          sectionZ
        );

        const bird = new Bird(scene, position);
        bird.mesh.castShadow = true;
        birds.push(bird);
      }
      return birds;
    };

    const birds = createBirds();

    // Function to add 3D text
    const add3DText = async (text: string, y: number, z: number) => {
      try {
        // Use relative path instead of absolute path
        const fontUrl = "./assets/fonts/helvetiker_regular.typeface.json";
        const font = await new Promise<Font>((resolve, reject) => {
          fontLoader.load(fontUrl, resolve, undefined, (err) => {
            console.error("Font loading error:", err);
            reject(err);
          });
        });

        const geometry = new TextGeometry(text, {
          font: font,
          size: 0.58,
          depth: 0.1, // Profondeur proportionnelle à la taille
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.05, // Valeur proportionnelle à la taille
          bevelSize: 0.03, // Valeur proportionnelle à la taille
          bevelOffset: 0,
          bevelSegments: 5,
        });

        // Calculer la boîte englobante pour centrer le texte
        geometry.computeBoundingBox();
        const textWidth = geometry.boundingBox
          ? geometry.boundingBox.max.x - geometry.boundingBox.min.x
          : 0;

        // Position x calculée pour centrer le texte
        const x = -textWidth / 2 + 0.035;

        // Créer une texture pour le texte
        const textureLoader = new THREE.TextureLoader();
        const woodTexture = textureLoader.load(
          "./assets/textures/wood.jpg",
          () => {
            console.log("Texture de bois chargée avec succès");
          },
          undefined,
          (err) => {
            console.error("Erreur de chargement de texture:", err);
          }
        );

        // Configurer la texture
        woodTexture.wrapS = THREE.RepeatWrapping;
        woodTexture.wrapT = THREE.RepeatWrapping;
        woodTexture.repeat.set(1, 1);

        // Créer un matériau texturé
        const material = new THREE.MeshStandardMaterial({
          map: woodTexture,
          bumpMap: woodTexture,
          bumpScale: 0.05,
          color: 0xeeeeee, // Une teinte légère qui n'affecte pas trop la texture
          metalness: 0.2,
          roughness: 0.8,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z); // Position centrée sur l'axe X
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
      } catch (error) {
        console.error("Failed to add 3D text:", error);
        // Create a fallback for text if font loading fails
        const fallbackGeometry = new THREE.BoxGeometry(
          text.length * 0.5,
          1,
          0.1
        );

        // Créer une texture simple pour le fallback
        const textureLoader = new THREE.TextureLoader();
        const simpleTexture = textureLoader.load(
          "./assets/textures/concrete.jpg",
          undefined,
          undefined,
          (err) => {
            console.error("Erreur de chargement de texture de secours:", err);
          }
        );

        const fallbackMaterial = new THREE.MeshStandardMaterial({
          map: simpleTexture,
          color: 0xdddddd,
          roughness: 0.7,
        });

        const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
        // Centrer le fallback sur l'axe X
        fallbackMesh.position.set(-((text.length * 0.5) / 2), y, z);
        fallbackMesh.castShadow = true;
        fallbackMesh.receiveShadow = true;
        scene.add(fallbackMesh);
      }
    };

    // Add 3D text at various positions
    const textPositions = [
      { text: "Bienvenue", z: -50 },
      { text: "Services", z: -150 },
      { text: "Projets", z: -250 },
      { text: `A Propos`, z: -350 },
      { text: "Contact", z: -450 },
    ];
    textPositions.forEach((pos) => add3DText(pos.text, 6.11, pos.z));

    // Animation loop with enhanced shape animation
    const animate = () => {
      shapes.forEach((shape) => {
        shape.rotation.y += 0.002;
        shape.rotation.z += 0.001;
      });

      // Animer les oiseaux
      birds.forEach((bird) => bird.update());

      // Debug - afficher nombre d'oiseaux (première exécution seulement)
      if (!window.birdsLogged) {
        console.log(`Nombre total d'oiseaux créés: ${birds.length}`);
        console.log(`Position du premier oiseau: `, birds[0].position);
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
      birds.forEach((bird) => {
        scene.remove(bird.mesh);
        bird.mesh.geometry.dispose();
        (bird.mesh.material as THREE.Material).dispose();
      });

      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Get the exact scroll position for smoother camera movement
  const exactScrollPosition = useStore((state) => state.exactScrollPosition);

  // Définir les positions exactes pour chaque section avec un décalage cohérent
  const SECTION_POSITIONS = {
    home: -40, // Position verrouillée pour home
    services: -140, // Position verrouillée pour services
    projects: -240, // Position verrouillée pour projects
    about: -340, // Position verrouillée pour about
    contact: -440, // Inchangé puisque ça fonctionne bien
  };

  // Dans le useEffect de la gestion de la caméra
  useEffect(() => {
    if (!cameraRef.current || !sceneRef.current || !floorMaterialRef.current)
      return;

    // Limiter exactScrollPosition à la plage valide (0 à 4.99)
    const clampedScrollPosition = Math.min(
      4.99,
      Math.max(0, exactScrollPosition)
    );

    // Identifier la section actuelle (sans fraction)
    const currentIndex = Math.floor(clampedScrollPosition);
    const sectionKeys = ["home", "services", "projects", "about", "contact"];
    const currentSectionKey = sectionKeys[
      currentIndex
    ] as keyof typeof SECTION_POSITIONS;

    // Verrouiller la caméra sur la position de la section actuelle (pas d'interpolation)
    const targetZ = SECTION_POSITIONS[currentSectionKey];

    // Move camera with variable speed based on section transition
    gsap.to(cameraRef.current.position, {
      z: targetZ,
      duration: 0.8,
      ease: "power2.out",
    });

    // Determine which section we're in with proper clamping
    const currentSection = Math.min(
      4,
      Math.max(0, Math.floor(clampedScrollPosition))
    );

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

      console.log(
        "Updated floor material color to:",
        targetColor,
        "for section:",
        currentSection
      );
    }

    // Adjusting light intensities based on current section
    if (sceneRef.current) {
      const lights = sceneRef.current.children.filter(
        (child) => child instanceof THREE.Light
      ) as THREE.Light[];

      // Calculate distance factors for each section's lights
      // to create a smooth transition between sections
      const sectionKeys = ["home", "services", "projects", "about", "contact"];
      const sectionIdx = currentSection;
      const fraction = clampedScrollPosition - sectionIdx;

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
        } else if (
          light instanceof THREE.DirectionalLight ||
          light instanceof THREE.SpotLight ||
          light instanceof THREE.PointLight
        ) {
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
