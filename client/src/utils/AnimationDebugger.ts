import { LoadedModel } from "@/services/ModelLoader";
import { Object3D, AnimationMixer, SkinnedMesh, Bone } from "three";

/**
 * Utilitaire pour déboguer les problèmes d'animation
 */
export class AnimationDebugger {
  /**
   * Vérifier l'état d'un modèle et de ses animations
   */
  static checkModelState(model: LoadedModel): void {
    console.group("Diagnostic du modèle 3D");

    // Vérifier que le model est bien défini
    console.log("Model chargé:", !!model.model);

    // Vérifier les animations
    console.log(`Animations: ${model.animations?.length || 0} trouvées`);
    model.animations?.forEach((clip, i) => {
      console.log(
        `- Animation ${i}: "${clip.name}", durée: ${clip.duration.toFixed(2)}s`
      );
    });

    // Vérifier les actions
    console.log(`Actions: ${model.actions?.size || 0} disponibles`);
    if (model.actions) {
      model.actions.forEach((action, name) => {
        console.log(`- Action "${name}":`, {
          isActive: action.isScheduled(),
          isRunning: action.isRunning(),
          weight: action.getEffectiveWeight(),
          timeScale: action.getEffectiveTimeScale(),
        });
      });
    }

    // Vérifier l'action courante
    console.log(
      "Action courante:",
      model.currentAction ? "définie" : "non définie"
    );
    if (model.currentAction) {
      console.log("État action courante:", {
        isActive: model.currentAction.isScheduled(),
        isRunning: model.currentAction.isRunning(),
        weight: model.currentAction.getEffectiveWeight(),
        timeScale: model.currentAction.getEffectiveTimeScale(),
      });
    }

    // Vérifier les SkinnedMesh et leurs squelettes
    this.checkSkinnedMeshes(model.model);

    // Vérifier la hiérarchie du modèle
    this.logObjectHierarchy(model.model);

    console.groupEnd();
  }

  /**
   * Vérifier les SkinnedMesh et leurs squelettes
   */
  static checkSkinnedMeshes(rootObject: Object3D): void {
    console.group("Vérification des SkinnedMesh");

    const skinnedMeshes: SkinnedMesh[] = [];
    rootObject.traverse((object) => {
      if (object instanceof SkinnedMesh) {
        skinnedMeshes.push(object);
      }
    });

    if (skinnedMeshes.length === 0) {
      console.warn("Aucun SkinnedMesh trouvé dans le modèle");
      console.groupEnd();
      return;
    }

    console.log(`${skinnedMeshes.length} SkinnedMesh trouvés`);

    skinnedMeshes.forEach((mesh, index) => {
      console.group(`SkinnedMesh ${index + 1}: ${mesh.name}`);

      console.log(
        "Matrice de bind inversée:",
        mesh.bindMatrix ? "définie" : "non définie"
      );

      if (!mesh.skeleton) {
        console.warn("Pas de squelette attaché");
      } else {
        console.log(`Squelette avec ${mesh.skeleton.bones.length} os`);

        const rootBones = mesh.skeleton.bones.filter(
          (bone) => !bone.parent || !(bone.parent instanceof Bone)
        );
        console.log(`Os racines: ${rootBones.length}`);

        if (mesh.skeleton.boneInverses.length !== mesh.skeleton.bones.length) {
          console.warn(
            `Problème potentiel: ${mesh.skeleton.boneInverses.length} matrices inverses pour ${mesh.skeleton.bones.length} os`
          );
        }

        // Vérifier si le skinning est appliqué (matrice liée aux os)
        console.log(
          "Matrices de pose:",
          mesh.skeleton.boneMatrices ? "définies" : "non définies"
        );
      }

      console.log(
        "Nombre d'influences par vertex:",
        mesh.morphTargetInfluences
          ? mesh.morphTargetInfluences.length
          : "aucune"
      );

      console.groupEnd();
    });

    console.groupEnd();
  }

  /**
   * Afficher la hiérarchie d'un objet 3D
   */
  static logObjectHierarchy(object: Object3D, indent = 0): void {
    const prefix = " ".repeat(indent * 2);
    console.log(`${prefix}- ${object.name || "Sans nom"} [${object.type}]`);

    // Vérifier si c'est un squelette/os
    if (object.type.includes("Bone") || object.type.includes("Skeleton")) {
      console.log(`${prefix}  (Élément d'armature/squelette)`);
    }

    // Vérifier si des animations sont attachées
    if (
      "animations" in object &&
      Array.isArray(object.animations) &&
      object.animations.length > 0
    ) {
      console.log(
        `${prefix}  (${object.animations.length} animations attachées)`
      );
    }

    // Si c'est un SkinnedMesh, afficher des informations sur son skinning
    if (object instanceof SkinnedMesh) {
      console.log(
        `${prefix}  (SkinnedMesh avec ${object.skeleton?.bones.length || 0} os)`
      );
    }

    // Explorer récursivement les enfants
    for (const child of object.children) {
      this.logObjectHierarchy(child, indent + 1);
    }
  }

  /**
   * Vérifier l'état d'un AnimationMixer
   */
  static checkMixer(mixer: AnimationMixer): void {
    console.group("État du AnimationMixer");
    // Vérifier si le mixer est actif, combien d'animations sont gérées, etc.
    // Note: AnimationMixer n'expose pas beaucoup d'API publique pour diagnostiquer son état interne
    console.log("Mixer existe:", !!mixer);
    console.log("Mixer time:", mixer.time);

    // Afficher toute autre information accessible
    const mixerObj = mixer as any; // Type assertion pour accéder à des propriétés non documentées
    if (mixerObj._actions) {
      console.log(`Actions dans le mixer: ${mixerObj._actions.length}`);
    }
    if (mixerObj._bindings) {
      console.log(`Bindings dans le mixer: ${mixerObj._bindings.length}`);
    }

    console.groupEnd();
  }

  /**
   * Vérifier la compatibilité des animations avec un modèle
   */
  static checkAnimationCompatibility(model: LoadedModel): void {
    console.group("Vérification de compatibilité des animations");

    if (!model.animations || model.animations.length === 0) {
      console.log("Aucune animation à vérifier");
      console.groupEnd();
      return;
    }

    // Collecter tous les noms d'os du modèle
    const boneNames = new Set<string>();
    model.model.traverse((object) => {
      if (object instanceof Bone) {
        boneNames.add(object.name);
      }
    });

    console.log(`Modèle avec ${boneNames.size} os nommés`);

    // Vérifier chaque animation
    model.animations.forEach((clip, i) => {
      console.group(`Animation ${i}: "${clip.name}"`);

      let tracksMatchingBones = 0;
      const unmatchedTracks = new Set<string>();

      clip.tracks.forEach((track) => {
        // Extraire le nom de l'os ciblé par cette piste d'animation
        const trackName = track.name;
        const boneName = trackName.split(".")[0]; // Le format est généralement "boneName.property"

        if (boneNames.has(boneName)) {
          tracksMatchingBones++;
        } else {
          unmatchedTracks.add(boneName);
        }
      });

      console.log(`Pistes totales: ${clip.tracks.length}`);
      console.log(`Pistes correspondant à des os: ${tracksMatchingBones}`);

      if (unmatchedTracks.size > 0) {
        console.warn(`Pistes sans os correspondant: ${unmatchedTracks.size}`);
        console.log("Os non trouvés:", Array.from(unmatchedTracks).join(", "));
      }

      console.groupEnd();
    });

    console.groupEnd();
  }
}
