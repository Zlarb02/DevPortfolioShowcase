import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

export class Bird {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  position: THREE.Vector3;
  wingAngle: number;
  wingSpeed: number;
  baseHeight: number;
  flightDirection: THREE.Vector3;

  constructor(scene: THREE.Scene, position: THREE.Vector3) {
    // Créer une forme d'oiseau plus élaborée avec des ailes
    const bodyGeometry = new THREE.ConeGeometry(0.5, 1.5, 5);
    bodyGeometry.rotateX(Math.PI / 2);

    // Ailes
    const wingGeometry = new THREE.BoxGeometry(2, 0.1, 0.8);
    wingGeometry.translate(0, 0.2, 0);

    // Tête
    const headGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    headGeometry.translate(0, 0, 0.9);

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
    const material = new THREE.MeshLambertMaterial({ color });

    // Créer le mesh final
    this.mesh = new THREE.Mesh(mergedGeometry, material);
    scene.add(this.mesh);

    // Initialiser la position
    this.position = position.clone();
    this.mesh.position.copy(position);
    this.baseHeight = position.y;

    // Direction fixe dans l'axe de la caméra (vers l'arrière de la scène)
    // Légères variations latérales pour éviter que tous les oiseaux se déplacent exactement au même rythme
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.02, // très légère variation horizontale
      0,                           // pas de variation verticale
      -0.2 - Math.random() * 0.05  // principalement vers l'arrière
    );

    // Paramètres pour l'animation des ailes
    this.wingAngle = Math.random() * Math.PI;
    this.wingSpeed = 0.1 + Math.random() * 0.05; // Vitesse modérée

    // Définir une direction de vol fixe (principalement dans l'axe de la caméra)
    this.flightDirection = new THREE.Vector3(0, 0, -1);
  }

  update() {
    // Maintenir une hauteur relativement constante
    const heightCorrection = (this.baseHeight - this.position.y) * 0.05;
    this.velocity.y = heightCorrection;

    // Très légères variations aléatoires pour éviter les mouvements robotiques
    this.velocity.x += (Math.random() - 0.5) * 0.001;

    // Garantir que l'oiseau se déplace principalement dans l'axe Z
    this.velocity.z = -0.2 - Math.random() * 0.05;

    // Mise à jour de la position
    this.position.add(this.velocity);
    this.mesh.position.copy(this.position);

    // Orienter l'oiseau dans la direction du mouvement
    this.mesh.lookAt(new THREE.Vector3().addVectors(this.position, this.flightDirection));

    // Animation de battement d'ailes simple
    this.wingAngle += this.wingSpeed;

    // Si l'oiseau va trop loin (sortie de vue), le repositionner en début de scène
    if (this.position.z < -550) {
      this.position.z = -10;
      this.position.x = (Math.random() - 0.5) * 40; // Position horizontale aléatoire
      this.position.y = 5 + Math.random() * 15;     // Hauteur entre 5 et 20
      this.baseHeight = this.position.y;
    }
  }
}