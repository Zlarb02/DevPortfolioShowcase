import {
  Scene,
  AnimationMixer,
  AnimationAction,
  AnimationClip,
  LoopRepeat,
  LoopOnce,
  Group,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MixamoFixer } from "@/utils/MixamoFixer";
import { AnimationDebugger } from "@/utils/AnimationDebugger";

export interface LoadedModel {
  model: Group;
  animations: AnimationClip[];
  mixer: AnimationMixer;
  actions: Map<string, AnimationAction>;
  currentAction?: AnimationAction;
  url: string;
}

class ModelLoader {
  private loader: GLTFLoader;
  private modelCache: Map<string, LoadedModel> = new Map();
  private isDebug: boolean = process.env.NODE_ENV !== "production";

  constructor() {
    this.loader = new GLTFLoader();
  }

  async loadModel(
    scene: Scene,
    url: string,
    forceReload = false
  ): Promise<LoadedModel> {
    // Vérifier si le modèle est déjà dans le cache et on ne force pas le rechargement
    if (!forceReload && this.modelCache.has(url)) {
      const cachedModel = this.modelCache.get(url)!;

      // Vérifier si le modèle est déjà dans la scène
      const isInScene = scene.children.includes(cachedModel.model);
      if (!isInScene) {
        scene.add(cachedModel.model);
        if (this.isDebug) console.log(`Modèle récupéré du cache: ${url}`);
      }

      return cachedModel;
    }

    // Si on force le rechargement, supprimer d'abord le modèle du cache
    if (forceReload && this.modelCache.has(url)) {
      const oldModel = this.modelCache.get(url)!;
      scene.remove(oldModel.model);
      this.modelCache.delete(url);
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          if (this.isDebug) console.log(`Modèle chargé: ${url}`);
          const model = gltf.scene;
          const animations = gltf.animations;

          scene.add(model);

          // Création du mixer pour gérer les animations
          const mixer = new AnimationMixer(model);

          // Créer un Map pour stocker les actions d'animation par nom
          const actions = new Map<string, AnimationAction>();

          // Analyser et stocker toutes les animations disponibles
          if (animations && animations.length > 0) {
            if (this.isDebug) {
              console.log(
                `${animations.length} animations trouvées dans ${url}:`,
                animations.map((a) => a.name || "Sans nom").join(", ")
              );
            }

            animations.forEach((clip) => {
              // Créer une action pour chaque clip d'animation
              const action = mixer.clipAction(clip);
              // Utiliser le nom de l'animation comme clé, ou son index si pas de nom
              const clipName =
                clip.name || `animation_${animations.indexOf(clip)}`;

              // Assurer que l'action est prête à être jouée
              action.reset();

              actions.set(clipName, action);

              if (this.isDebug) console.log(`Action créée pour: ${clipName}`);
            });
          } else {
            if (this.isDebug)
              console.warn(`Aucune animation trouvée dans: ${url}`);
          }

          const loadedModel: LoadedModel = {
            model,
            animations,
            mixer,
            actions,
            url,
          };

          // Appliquer des corrections spécifiques pour les modèles Mixamo
          if (
            this.isModelFromMixamo(url) ||
            this.containsMixamoAnimations(animations)
          ) {
            if (this.isDebug)
              console.log(
                "Modèle Mixamo détecté, application de corrections..."
              );

            // Utiliser MixamoFixer pour corriger les problèmes courants
            MixamoFixer.fixMixamoModel(loadedModel);

            // Afficher des informations détaillées sur le modèle après correction
            if (this.isDebug) {
              AnimationDebugger.checkModelState(loadedModel);
            }
          }

          // Mettre en cache le modèle
          this.modelCache.set(url, loadedModel);

          resolve(loadedModel);
        },
        // Gestionnaire de progression (réduit pour éviter les logs excessifs)
        (progress) => {
          if (
            this.isDebug &&
            progress.total > 0 &&
            progress.loaded % (progress.total / 4) < progress.total / 8
          ) {
            const percentComplete = Math.round(
              (progress.loaded / progress.total) * 100
            );
            console.log(`Chargement du modèle ${url}: ${percentComplete}%`);
          }
        },
        // Gestionnaire d'erreur
        (error) => {
          console.error(`Erreur lors du chargement du modèle ${url}:`, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Détermine si un modèle provient de Mixamo basé sur son URL
   */
  private isModelFromMixamo(url: string): boolean {
    return (
      url.toLowerCase().includes("mixamo") ||
      url.toLowerCase().includes("avatar_")
    );
  }

  /**
   * Vérifie si les animations proviennent de Mixamo
   */
  private containsMixamoAnimations(animations: AnimationClip[]): boolean {
    if (!animations || animations.length === 0) return false;

    return animations.some(
      (anim) =>
        anim.name.includes("mixamo.com") ||
        anim.name.includes("Armature_") ||
        anim.name.includes("|Layer0")
    );
  }

  // Jouer une animation spécifique
  playAnimation(
    loadedModel: LoadedModel,
    animationName: string,
    loop: boolean = true
  ): void {
    // Si aucune animation n'est disponible, sortir
    if (!loadedModel.actions || loadedModel.actions.size === 0) {
      if (this.isDebug)
        console.warn(
          "Aucune action d'animation disponible pour:",
          loadedModel.url
        );
      return;
    }

    // Arrêter l'animation en cours si elle existe
    if (loadedModel.currentAction) {
      loadedModel.currentAction.stop();
    }

    // Trouver l'action par son nom
    const newAction = loadedModel.actions.get(animationName);

    if (newAction) {
      // Configurer l'action
      newAction.reset();
      newAction.setLoop(loop ? LoopRepeat : LoopOnce, Infinity);
      newAction.clampWhenFinished = !loop;
      newAction.setEffectiveWeight(1.0); // Appliquer un poids complet
      newAction.setEffectiveTimeScale(1.0); // S'assurer que l'échelle de temps est normale
      newAction.play();

      // Supprimer le fadeIn qui peut causer un délai dans l'application de l'animation
      // newAction.fadeIn(0.5);

      // Stocker l'action en cours
      loadedModel.currentAction = newAction;

      if (this.isDebug)
        console.log(
          `Animation démarrée: ${animationName} sur ${loadedModel.url}`
        );
    } else {
      // Jouer la première animation disponible comme fallback
      if (loadedModel.actions.size > 0) {
        const firstAnimationName = Array.from(loadedModel.actions.keys())[0];
        const fallbackAction = loadedModel.actions.get(firstAnimationName);

        if (fallbackAction) {
          fallbackAction.reset();
          fallbackAction.setLoop(loop ? LoopRepeat : LoopOnce, Infinity);
          fallbackAction.setEffectiveWeight(1.0); // Poids complet
          fallbackAction.play();
          loadedModel.currentAction = fallbackAction;

          if (this.isDebug)
            console.log(
              `Animation fallback démarrée: ${firstAnimationName} sur ${loadedModel.url}`
            );
        }
      }
    }
  }

  // Arrêter toutes les animations
  stopAllAnimations(loadedModel: LoadedModel): void {
    if (loadedModel.actions) {
      loadedModel.actions.forEach((action) => {
        action.stop();
      });
    }
    loadedModel.currentAction = undefined;
  }

  // Méthode pour nettoyer complètement le cache
  clearCache(): void {
    this.modelCache.clear();
  }
}

export const modelLoader = new ModelLoader();
