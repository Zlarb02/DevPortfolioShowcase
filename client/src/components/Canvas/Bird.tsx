import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

export class Bird {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  position: THREE.Vector3;
  leader: Bird | null;
  offset: THREE.Vector3;

  constructor(scene: THREE.Scene, position: THREE.Vector3, leader: Bird | null = null) {
    // Créer une forme d'oiseau plus élaborée avec des ailes
    const bodyGeometry = new THREE.ConeGeometry(0.5, 1.5, 5);
    bodyGeometry.rotateX(Math.PI / 2);

    // Ailes
    const wingGeometry = new THREE.BoxGeometry(2, 0.1, 0.8);
    wingGeometry.translate(0, 0.2, 0);

    // Tête
    const headGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    headGeometry.translate(0, 0, 0.9);

    // Fusionner les géométries
    const geometry = new THREE.BufferGeometry();

    // Combiner les géométries en utilisant BufferGeometryUtils.mergeGeometries
    const mergedGeometry = BufferGeometryUtils.mergeGeometries([
      bodyGeometry,
      wingGeometry,
      headGeometry
    ]);

    // Choisir une couleur aléatoire parmi une palette d'oiseaux
    const birdColors = [
      0x333333, // noir
      0x555555, // gris foncé
      0x777777, // gris
      0x4A2C2A, // brun foncé
      0x6A4C4A, // brun
    ];

    const color = birdColors[Math.floor(Math.random() * birdColors.length)];

    const material = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.8,
      metalness: 0.1,
      flatShading: true
    });

    this.mesh = new THREE.Mesh(mergedGeometry, material);
    scene.add(this.mesh);

    // Initialiser la position
    this.position = position;
    this.mesh.position.copy(position);

    // Direction initiale vers le bas de la scène
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05,
      (Math.random() - 0.5) * 0.05
    );

    // Information sur le leader
    this.leader = leader;
    this.offset = new THREE.Vector3();
    if (leader) {
      this.offset.copy(this.position).sub(leader.position);
    }
  }

  update() {
    // Constantes pour un vol plus stable
    const GROUND_HEIGHT = 5; // Altitude minimale
    const MAX_HEIGHT = 12;   // Altitude maximale
    const TARGET_HEIGHT = GROUND_HEIGHT + Math.random() * (MAX_HEIGHT - GROUND_HEIGHT);

    // Si nous avons un leader, suivre le leader
    if (this.leader) {
      // Force d'attraction vers la position relative
      const target = new THREE.Vector3().copy(this.leader.position).add(this.offset);

      // Maintenir une altitude stable (parallèle au sol)
      target.y = GROUND_HEIGHT + (Math.random() * 2); // Légère variation d'altitude

      const direction = new THREE.Vector3().subVectors(target, this.position);

      // Normaliser et appliquer la force avec un facteur d'ajustement
      direction.normalize().multiplyScalar(0.03);
      this.velocity.add(direction);
    } else {
      // Comportement du leader - vol stable et parallèle au sol
      // Stabiliser l'altitude - force vers l'altitude cible
      const heightDiff = TARGET_HEIGHT - this.position.y;
      this.velocity.y += heightDiff * 0.01;

      // Mouvement horizontal uniquement
      this.velocity.x += (Math.random() - 0.5) * 0.01;
      this.velocity.z -= 0.01 + Math.random() * 0.01; // Avancer constamment

      // Limiter strictement la vitesse verticale
      this.velocity.y = Math.max(-0.03, Math.min(0.03, this.velocity.y));
    }

    // Appliquer des limites de vitesse naturelles
    const maxSpeed = 0.1;
    if (this.velocity.length() > maxSpeed) {
      this.velocity.normalize().multiplyScalar(maxSpeed);
    }

    // Ralentir progressivement (friction de l'air)
    this.velocity.multiplyScalar(0.98);

    // Mettre à jour la position
    this.position.add(this.velocity);

    // Forcer l'altitude dans les limites
    this.position.y = Math.max(GROUND_HEIGHT, Math.min(MAX_HEIGHT, this.position.y));

    // Mettre à jour la position du mesh
    this.mesh.position.copy(this.position);

    // Orienter l'oiseau dans la direction du mouvement mais garder l'axe Y stable
    if (this.velocity.length() > 0.01) {
      // Créer un vecteur direction qui pointe vers l'avant mais reste horizontal
      const direction = new THREE.Vector3(this.velocity.x, 0, this.velocity.z).normalize();

      // Créer un point devant l'oiseau pour qu'il regarde dans cette direction
      const lookTarget = new THREE.Vector3().copy(this.position).add(direction);
      this.mesh.lookAt(lookTarget);

      // Légère inclinaison des ailes pour le virage
      const bankAngle = this.velocity.x * 0.2;
      this.mesh.rotation.z = -bankAngle;
    }

    // Empêcher de s'éloigner trop latéralement
    if (Math.abs(this.position.x) > 30) {
      // Diriger graduellement vers le centre
      this.velocity.x -= this.position.x * 0.001;
    }
  }
}