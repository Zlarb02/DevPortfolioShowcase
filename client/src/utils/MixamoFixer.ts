import { AnimationClip, Object3D, SkinnedMesh, Bone } from "three";
import { LoadedModel } from "@/services/ModelLoader";
import { AnimationDebugger } from "./AnimationDebugger";

/**
 * Utilitaire pour résoudre les problèmes courants avec les modèles et animations Mixamo
 */
export class MixamoFixer {
  /**
   * Analyse et répare les problèmes d'animations Mixamo
   */
  static fixMixamoModel(loadedModel: LoadedModel): void {
    console.group("MixamoFixer: Analyse du modèle");

    // Vérifier si c'est bien un modèle Mixamo
    const isMixamoModel = this.isMixamoModel(loadedModel);
    console.log("Modèle Mixamo détecté:", isMixamoModel);

    if (isMixamoModel) {
      // Analyser le modèle et les animations
      this.analyzeAndFixAnimations(loadedModel);

      // Vérifier la structure d'armature
      this.checkArmatureSetup(loadedModel);
    }

    console.groupEnd();
  }

  /**
   * Détermine si le modèle est un modèle Mixamo basé sur les noms d'animations
   */
  private static isMixamoModel(loadedModel: LoadedModel): boolean {
    // Vérifier les noms d'animations pour identifier un modèle Mixamo
    if (!loadedModel.animations || loadedModel.animations.length === 0) {
      return false;
    }

    // Les animations Mixamo ont généralement un format spécifique
    return loadedModel.animations.some(
      (animation) =>
        animation.name.includes("mixamo.com") ||
        animation.name.includes("Armature_") ||
        animation.name.includes("|Layer0")
    );
  }

  /**
   * Analyse et corrige les problèmes d'animations
   */
  private static analyzeAndFixAnimations(loadedModel: LoadedModel): void {
    if (!loadedModel.animations || loadedModel.animations.length === 0) {
      console.log("Aucune animation à analyser");
      return;
    }

    console.log(`Analyse de ${loadedModel.animations.length} animations...`);

    // Vérifier les doublons d'animations
    const uniqueNames = new Set<string>();
    const duplicates: string[] = [];

    loadedModel.animations.forEach((clip) => {
      if (uniqueNames.has(clip.name)) {
        duplicates.push(clip.name);
      } else {
        uniqueNames.add(clip.name);
      }
    });

    if (duplicates.length > 0) {
      console.warn(`Animations dupliquées détectées: ${duplicates.join(", ")}`);
      console.log("Suppression des doublons...");

      // Filtrer les animations pour ne garder que les uniques
      const uniqueAnimations = loadedModel.animations.filter((clip, index) => {
        // Garder la première occurrence de chaque nom d'animation
        return (
          loadedModel.animations.findIndex((c) => c.name === clip.name) ===
          index
        );
      });

      // Mettre à jour les animations dans le modèle chargé
      loadedModel.animations = uniqueAnimations;

      // Recréer les actions avec les animations uniques
      if (loadedModel.mixer) {
        // Vider d'abord la map des actions existantes
        loadedModel.actions.clear();

        // Recréer les actions pour les animations uniques
        uniqueAnimations.forEach((clip) => {
          const action = loadedModel.mixer.clipAction(clip);
          loadedModel.actions.set(clip.name, action);
        });
      }

      console.log(`Animations après déduplication: ${uniqueAnimations.length}`);
    }

    // Vérifier les noms d'animations
    loadedModel.animations.forEach((clip) => {
      if (clip.name.includes("|")) {
        console.log(`Animation avec nom complexe: "${clip.name}"`);
        // Simplifier les noms d'animations si nécessaire
      }
    });
  }

  /**
   * Vérifie la structure d'armature et la configuration des os
   */
  private static checkArmatureSetup(loadedModel: LoadedModel): void {
    console.log("Vérification de l'armature...");

    // Trouver tous les SkinnedMesh dans le modèle
    const skinnedMeshes: SkinnedMesh[] = [];
    loadedModel.model.traverse((object) => {
      if (object instanceof SkinnedMesh) {
        skinnedMeshes.push(object);
      }
    });

    if (skinnedMeshes.length === 0) {
      console.warn("Aucun SkinnedMesh trouvé dans le modèle");
      return;
    }

    console.log(`Trouvé ${skinnedMeshes.length} SkinnedMesh`);

    // Vérifier l'armature pour chaque SkinnedMesh
    skinnedMeshes.forEach((mesh, index) => {
      console.log(`SkinnedMesh ${index + 1}: ${mesh.name}`);

      if (!mesh.skeleton) {
        console.warn(`- Pas de squelette attaché à ${mesh.name}`);
        return;
      }

      console.log(`- Squelette trouvé avec ${mesh.skeleton.bones.length} os`);

      // Vérifier si le squelette est correctement configuré
      if (mesh.skeleton.bones.length === 0) {
        console.warn("- Squelette sans os!");
      } else {
        // Vérifier les os racines
        const rootBones = mesh.skeleton.bones.filter(
          (bone) => !bone.parent || !(bone.parent instanceof Bone)
        );
        console.log(
          `- Os racines: ${rootBones.length} (${rootBones
            .map((b) => b.name)
            .join(", ")})`
        );
      }
    });
  }

  /**
   * Visualise le squelette pour déboguer
   */
  static visualizeSkeleton(loadedModel: LoadedModel): void {
    // Cette méthode pourrait être développée pour ajouter
    // des aides visuelles au squelette dans la scène
    console.log("Visualisation du squelette non implémentée");
    AnimationDebugger.logObjectHierarchy(loadedModel.model);
  }
}
