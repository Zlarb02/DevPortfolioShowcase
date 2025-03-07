import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { useStore } from "@/lib/store";

// Class pour créer un oiseau individuel
class Bird {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  position: THREE.Vector3;
  leader: Bird | null;
  offset: THREE.Vector3;
  
  constructor(scene: THREE.Scene, position: THREE.Vector3, leader: Bird | null = null) {
    // Créer une forme plus visible pour représenter l'oiseau
    const geometry = new THREE.ConeGeometry(0.8, 2, 3);
    geometry.rotateX(Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x000000, // Noir pour contraster avec le ciel
      transparent: false,
      opacity: 1
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
    this.position = position;
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.02
    );
    
    this.leader = leader;
    // Définir une position de décalage par rapport au leader
    this.offset = new THREE.Vector3(
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 1,
      (Math.random() - 0.5) * 3
    );
    
    scene.add(this.mesh);
  }
  
  update() {
    if (this.leader) {
      // Suivre le leader avec un léger décalage
      const targetPosition = new THREE.Vector3().copy(this.leader.position).add(this.offset);
      const direction = new THREE.Vector3().subVectors(targetPosition, this.position);
      direction.normalize().multiplyScalar(0.15); // Plus rapide
      
      // Mélanger la direction cible avec un peu de mouvement aléatoire
      this.velocity.add(direction);
      this.velocity.multiplyScalar(0.9); // Moins d'amortissement
    } else {
      // Comportement de leader - vol plus libre et visible
      if (Math.random() < 0.1) { // Plus de chance de changer de direction
        this.velocity.add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.1, // Mouvements plus importants
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.1
        ));
      }
      
      // Déplacement par défaut pour le leader (toujours avancer un peu)
      this.velocity.z -= 0.01; // Avancer à travers les sections
      
      // Rester dans les limites de la scène avec plus d'espace
      const boundsX = 50;
      const boundsY = 30;
      const boundsZ = 500; // Zone beaucoup plus large en Z
      if (Math.abs(this.position.x) > boundsX) this.velocity.x *= -0.8;
      if (Math.abs(this.position.y) > boundsY) this.velocity.y *= -0.8;
      
      // Si trop loin, revenir en arrière
      if (this.position.z < -boundsZ) {
        this.position.z = -10; // Retour au début
      }
    }
    
    // Appliquer la vélocité
    this.position.add(this.velocity);
    this.mesh.position.copy(this.position);
    
    // Orienter l'oiseau dans la direction du mouvement
    if (this.velocity.length() > 0.01) {
      const lookAt = new THREE.Vector3().addVectors(this.position, this.velocity);
      this.mesh.lookAt(lookAt);
    }
  }
}

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
      // Créer plusieurs formations
      for (let f = 0; f < 5; f++) { // Plus de formations
        const flock = [];
        
        // Créer un leader avec position plus visible
        const leaderPos = new THREE.Vector3(
          (Math.random() - 0.5) * 30,
          5 + Math.random() * 15,
          -20 - (f * 80) // Répartir les formations dans les différentes sections
        );
        const leader = new Bird(scene, leaderPos);
        flock.push(leader);
        
        // Créer les suiveurs en formation V
        const flockSize = 5 + Math.floor(Math.random() * 5);
        for (let i = 0; i < flockSize; i++) {
          const side = i % 2 === 0 ? 1 : -1;
          const row = Math.floor(i / 2) + 1;
          
          const followerPos = new THREE.Vector3(
            leaderPos.x + side * row * 1.5,
            leaderPos.y - row * 0.5,
            leaderPos.z - row * 2
          );
          
          const bird = new Bird(scene, followerPos, leader);
          flock.push(bird);
        }
        
        flocks.push(flock);
      }
      return flocks;
    };
    
    const birdFlocks = createBirdFlocks();
    
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