import { Scene, Vector3, Clock } from "three";
import * as THREE from "three";
import { modelLoader, LoadedModel } from "@/services/ModelLoader";
import { AnimationDebugger } from "@/utils/AnimationDebugger";
import { MixamoFixer } from "@/utils/MixamoFixer";

export class Avatar {
  private scene: Scene;
  private position: Vector3;
  private model: LoadedModel | null = null;
  private currentSection: string = "home";
  private clock: Clock;
  private lastSectionChangeTime: number = 0;
  private changeSectionThrottleMs: number = 1000; // Limite à un changement par seconde
  private isDebug: boolean = process.env.NODE_ENV !== "production";

  constructor(scene: Scene, position: Vector3) {
    this.scene = scene;
    this.position = position;
    this.clock = new Clock();
  }

  async initialize(): Promise<void> {
    try {
      // Nettoyer tout modèle existant avant d'initialiser
      this.cleanupCurrentModel();

      // Démarrer l'horloge pour s'assurer que les deltas sont corrects
      this.clock.start();

      // Charger l'avatar initial (utiliser getModelPathForSection pour cohérence)
      this.model = await modelLoader.loadModel(
        this.scene,
        this.getModelPathForSection("home"),
        true // forcer le premier chargement
      );

      if (this.model) {
        // Positionner l'avatar
        this.model.model.position.copy(this.getSectionPosition("home"));

        // Appliquer des corrections spécifiques pour Mixamo si nécessaire
        MixamoFixer.fixMixamoModel(this.model);

        // Vérifier la compatibilité des animations
        if (this.isDebug) {
          AnimationDebugger.checkAnimationCompatibility(this.model);
        }

        // Debugger les animations disponibles
        if (this.isDebug) {
          this.logAvailableAnimations();
        }

        // Jouer la première animation disponible
        this.playFirstAvailableAnimation();

        // Forcer une mise à jour immédiate du mixer
        this.update();

        if (this.isDebug) console.log("Avatar chargé avec succès");
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation de l'avatar:", error);
    }
  }

  // Nettoyer le modèle actuel
  private cleanupCurrentModel(): void {
    if (this.model) {
      // Arrêter toutes les animations en cours
      modelLoader.stopAllAnimations(this.model);

      // Retirer tous les objets du modèle de la scène
      this.scene.remove(this.model.model);

      // Libérer la référence
      this.model = null;
    }
  }

  // Obtenir la position appropriée pour chaque section
  private getSectionPosition(section: string): Vector3 {
    const basePosition = this.position.clone();

    switch (section) {
      case "home":
        basePosition.z = -41;
        basePosition.x = -0.5;
        break;
      case "services":
        basePosition.z = -141;
        break;
      case "projects":
        basePosition.z = -242;
        basePosition.x = 0.5;
        break;
      case "about":
        basePosition.z = -341;
        break;
      case "contact":
        basePosition.z = -442.2;
        basePosition.x = -0.5;
        break;
    }

    return basePosition;
  }

  // Jouer la première animation disponible dans le modèle
  private playFirstAvailableAnimation(): void {
    if (!this.model || !this.model.actions || this.model.actions.size === 0) {
      if (this.isDebug)
        console.warn("Aucune animation disponible pour l'avatar");
      return;
    }

    // Obtenir la liste des animations disponibles
    const animationNames = Array.from(this.model.actions.keys());

    if (this.isDebug) {
      console.log(
        `Animations disponibles (${animationNames.length}):`,
        animationNames
      );
    }

    // Chercher une animation spécifique pour cette section
    let targetAnimation: string | null = null;

    // Chercher des animations spécifiques selon la section
    switch (this.currentSection) {
      case "home":
        // Essayer de trouver une animation de salut
        targetAnimation = this.findAnimationByKeywords([
          "wave",
          "waving",
          "hello",
          "greeting",
          "salut",
        ]);
        break;
      case "projects":
        targetAnimation = this.findAnimationByKeywords([
          "click",
          "pointing",
          "swap",
        ]);
        break;
      case "contact":
        targetAnimation = this.findAnimationByKeywords([
          "call",
          "phone",
          "contact",
        ]);
        break;
      default:
        targetAnimation = this.findAnimationByKeywords([
          "idle",
          "stand",
          "welcome",
        ]);
        break;
    }

    // Si aucune animation spécifique n'est trouvée, utiliser la première disponible
    if (!targetAnimation && animationNames.length > 0) {
      targetAnimation = animationNames[0];
      if (this.isDebug)
        console.log(
          `Aucune animation spécifique trouvée, utilisation de: ${targetAnimation}`
        );
    }

    // Jouer l'animation sélectionnée
    if (targetAnimation) {
      // Arrêter d'abord toutes les animations
      modelLoader.stopAllAnimations(this.model!);

      // Puis jouer la nouvelle animation
      modelLoader.playAnimation(this.model!, targetAnimation, true);

      if (this.isDebug) console.log(`Animation jouée: ${targetAnimation}`);
    }
  }

  // Nouvelle méthode pour trouver une animation par mots-clés
  private findAnimationByKeywords(keywords: string[]): string | null {
    if (!this.model || !this.model.actions) return null;

    const animationNames = Array.from(this.model.actions.keys());

    // Convertir tous les noms d'animations en minuscules pour une comparaison insensible à la casse
    const lowerCaseAnimationNames = animationNames.map((name) =>
      name.toLowerCase()
    );

    // Chercher la première animation qui contient un des mots-clés
    for (const keyword of keywords) {
      const matchIndex = lowerCaseAnimationNames.findIndex((name) =>
        name.includes(keyword.toLowerCase())
      );

      if (matchIndex !== -1) {
        if (this.isDebug)
          console.log(
            `Animation trouvée avec le mot-clé '${keyword}': ${animationNames[matchIndex]}`
          );
        return animationNames[matchIndex];
      }
    }

    return null;
  }

  // Méthode pour afficher toutes les animations disponibles
  private logAvailableAnimations(): void {
    if (!this.model || !this.model.actions) {
      console.log("Aucune animation disponible (model ou actions null)");
      return;
    }

    const animationNames = Array.from(this.model.actions.keys());
    console.log(
      `Animations disponibles (${animationNames.length}):`,
      animationNames
    );
  }

  async changeSection(section: string): Promise<void> {
    // Vérification stricte pour éviter les rechargements inutiles
    if (section === this.currentSection) {
      return;
    }

    // Vérifier si on a changé de section récemment (throttling)
    const now = Date.now();
    if (now - this.lastSectionChangeTime < this.changeSectionThrottleMs) {
      return;
    }
    this.lastSectionChangeTime = now;

    // Calculer la nouvelle position basée sur la section
    const newPosition = this.getSectionPosition(section);

    try {
      // Déterminer le chemin du modèle pour cette section
      let modelPath = this.getModelPathForSection(section);

      // Charger ou récupérer le modèle du cache
      this.model = await modelLoader.loadModel(this.scene, modelPath);

      if (this.model) {
        // Positionner le modèle à la nouvelle position
        this.model.model.position.copy(newPosition);

        // Appliquer des corrections spécifiques pour Mixamo si nécessaire
        MixamoFixer.fixMixamoModel(this.model);

        // Vérifier la compatibilité des animations
        if (this.isDebug) {
          AnimationDebugger.checkAnimationCompatibility(this.model);
        }

        // Debugger les animations disponibles
        if (this.isDebug) {
          this.logAvailableAnimations();
        }

        // Mettre à jour la section avant de jouer l'animation
        this.currentSection = section;

        // Jouer la première animation disponible
        this.playFirstAvailableAnimation();

        if (this.isDebug) {
          console.log(
            `Avatar changé pour la section: ${section}, position: ${newPosition.x.toFixed(
              1
            )}, ${newPosition.y.toFixed(1)}, ${newPosition.z.toFixed(1)}`
          );
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors du changement de section pour l'avatar:",
        error
      );
    }
  }

  // Obtenir le chemin du modèle en fonction de la section
  private getModelPathForSection(section: string): string {
    switch (section) {
      case "projects":
        return "/assets/models/avatar_click-swap.glb";
      case "contact":
        return "/assets/models/avatar_call-me.glb";
      case "home":
        return "/assets/models/avatar_waving.glb";
      case "services":
      case "about":
      default:
        return "/assets/models/avatar_on-welcome.glb";
    }
  }

  update(): void {
    if (!this.model) return;

    const delta = this.clock.getDelta();

    // S'assurer que le delta est raisonnable (éviter les sauts après pause/resume)
    const cappedDelta = Math.min(delta, 0.1);

    if (this.model.mixer) {
      this.model.mixer.update(cappedDelta);

      // Debug pour vérifier que l'update est bien appelé
      if (this.isDebug && Math.random() < 0.01) {
        // Log seulement occasionnellement pour ne pas spammer
        console.log(`Mixer mis à jour avec delta: ${cappedDelta}`);
      }
    }
  }

  // Méthode pour jouer une animation spécifique
  playAnimation(animationName: string, loop: boolean = true): void {
    if (!this.model) return;

    modelLoader.playAnimation(this.model, animationName, loop);
  }
}
