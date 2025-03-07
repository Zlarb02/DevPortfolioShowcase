import * as THREE from 'three';
import { useStore } from '@/lib/store';

export default class Lights {
  private scene: THREE.Scene;
  private lights: {
    [key: string]: THREE.Light[];
  };

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.lights = {
      home: [
        new THREE.AmbientLight(0xffffff, 0.5),
        new THREE.DirectionalLight(0xffa07a, 1)
      ],
      services: [
        new THREE.AmbientLight(0xffffff, 0.3),
        new THREE.SpotLight(0x4169e1, 1)
      ],
      projects: [
        new THREE.AmbientLight(0xffffff, 0.4),
        new THREE.PointLight(0xff1493, 1),
        new THREE.PointLight(0x4169e1, 1)
      ],
      about: [
        new THREE.AmbientLight(0xffffff, 0.7),
        new THREE.DirectionalLight(0xffffff, 0.5)
      ],
      contact: [
        new THREE.AmbientLight(0xffffff, 0.4),
        new THREE.SpotLight(0xffa07a, 1)
      ]
    };
  }

  setup() {
    // Add all lights to the scene
    Object.values(this.lights).flat().forEach(light => {
      this.scene.add(light);
    });

    // Position lights
    this.positionLights();
  }

  private positionLights() {
    // Home section
    this.lights.home[1].position.set(5, 5, 5);

    // Services section
    this.lights.services[1].position.set(-5, -5, 5);
    (this.lights.services[1] as THREE.SpotLight).angle = Math.PI / 4;

    // Projects section
    this.lights.projects[1].position.set(5, -15, 5);
    this.lights.projects[2].position.set(-5, -15, 5);

    // About section
    this.lights.about[1].position.set(0, -25, 5);

    // Contact section
    this.lights.contact[1].position.set(0, -35, 5);
    (this.lights.contact[1] as THREE.SpotLight).angle = Math.PI / 3;
  }
}
