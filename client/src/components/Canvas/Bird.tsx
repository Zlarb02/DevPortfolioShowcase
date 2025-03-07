
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
    if (this.leader) {
      // Suivre le leader avec la distance d'origine
      const targetPosition = new THREE.Vector3().copy(this.leader.position).add(this.offset);
      const steer = new THREE.Vector3().subVectors(targetPosition, this.position).multiplyScalar(0.05);
      this.velocity.add(steer);
    } else {
      // Le leader a un comportement plus libre
      // Légère variation aléatoire dans la direction
      this.velocity.add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        )
      );
    }

    // Limiter la vitesse maximale
    const maxSpeed = this.leader ? 0.25 : 0.2;
    if (this.velocity.length() > maxSpeed) {
      this.velocity.normalize().multiplyScalar(maxSpeed);
    }

    // Mise à jour de la position
    this.position.add(this.velocity);
    this.mesh.position.copy(this.position);

    // Orienter l'oiseau dans la direction du mouvement
    if (this.velocity.length() > 0.001) {
      this.mesh.lookAt(new THREE.Vector3().addVectors(this.position, this.velocity));
    }

    // Animation de battement d'ailes
    // À implémenter
  }
}
