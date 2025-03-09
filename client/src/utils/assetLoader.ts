import * as THREE from "three";
import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader.js";

// Gestionnaire de cache pour éviter les chargements multiples
class AssetCache {
  private textures: Map<string, THREE.Texture> = new Map();
  private fonts: Map<string, Promise<Font>> = new Map();

  // Gestion des textures
  async loadTexture(path: string): Promise<THREE.Texture> {
    if (this.textures.has(path)) {
      return this.textures.get(path)!;
    }

    const loader = new THREE.TextureLoader();

    return new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(
        path,
        (texture) => {
          this.textures.set(path, texture);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error(`Erreur de chargement de texture: ${path}`, error);
          reject(error);
        }
      );
    });
  }

  // Gestion des fonts
  async loadFont(path: string): Promise<Font> {
    if (!this.fonts.has(path)) {
      const fontLoader = new FontLoader();
      const fontPromise = new Promise<Font>((resolve, reject) => {
        fontLoader.load(path, resolve, undefined, (err) => {
          console.error(`Erreur de chargement de police: ${path}`, err);
          reject(err);
        });
      });

      this.fonts.set(path, fontPromise);
    }

    return this.fonts.get(path)!;
  }

  // Méthode pour créer une texture de matériau
  async createMaterial(
    texturePath: string,
    options: {
      color?: number;
      roughness?: number;
      metalness?: number;
      bumpScale?: number;
    } = {}
  ): Promise<THREE.MeshStandardMaterial> {
    const texture = await this.loadTexture(texturePath);

    // Configurer la texture
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      bumpMap: texture,
      color: options.color || 0xffffff,
      roughness: options.roughness !== undefined ? options.roughness : 0.7,
      metalness: options.metalness !== undefined ? options.metalness : 0.2,
      bumpScale: options.bumpScale || 0.05,
    });

    return material;
  }
}

export const assetCache = new AssetCache();
