/**
 * SmoothProgressBar - Une classe pour rendre fluide les barres de progression
 */
class SmoothProgressBar {
  constructor(selector, options = {}) {
    this.progressElement = document.querySelector(selector);
    if (!this.progressElement) {
      console.error(`Element not found: ${selector}`);
      return;
    }

    // Options par défaut
    this.options = {
      transitionDuration: options.transitionDuration || 300,
      updateFrequency: options.updateFrequency || 60,
      easing: options.easing || "ease-out",
    };

    // État interne
    this.currentValue = 0;
    this.targetValue = 0;
    this.animationFrameId = null;

    // Appliquer les styles initiaux
    this.setupStyles();
  }

  /**
   * Configure les styles nécessaires pour une animation fluide
   */
  setupStyles() {
    if (!this.progressElement) return;

    this.progressElement.style.transition = `width ${this.options.transitionDuration}ms ${this.options.easing}`;
  }

  /**
   * Met à jour la valeur cible et démarre l'animation si nécessaire
   * @param {number} value - Valeur entre 0 et 100
   */
  updateProgress(value) {
    if (!this.progressElement) return;

    // Limiter la valeur entre 0 et 100
    this.targetValue = Math.max(0, Math.min(100, value));

    // Démarrer l'animation si elle n'est pas déjà en cours
    if (this.animationFrameId === null) {
      this.animateProgress();
    }
  }

  /**
   * Anime la barre de progression vers la valeur cible
   */
  animateProgress() {
    if (!this.progressElement) {
      this.animationFrameId = null;
      return;
    }

    // Calculer la nouvelle valeur actuelle (approche fluide)
    const diff = this.targetValue - this.currentValue;

    // Si nous sommes très proches de la cible, on y va directement
    if (Math.abs(diff) < 0.1) {
      this.currentValue = this.targetValue;
      this.progressElement.style.width = `${this.currentValue}%`;
      this.animationFrameId = null;
      return;
    }

    // Sinon, on fait un mouvement fluide vers la cible
    this.currentValue += diff * 0.1;
    this.progressElement.style.width = `${this.currentValue}%`;

    // Continuer l'animation
    this.animationFrameId = requestAnimationFrame(() => this.animateProgress());
  }

  /**
   * Définit immédiatement la valeur sans animation
   * @param {number} value - Valeur entre 0 et 100
   */
  setProgressInstantly(value) {
    if (!this.progressElement) return;

    // Annuler toute animation en cours
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Définir directement la valeur
    this.currentValue = this.targetValue = Math.max(0, Math.min(100, value));
    this.progressElement.style.width = `${this.currentValue}%`;
  }
}

// Export pour une utilisation dans d'autres fichiers
window.SmoothProgressBar = SmoothProgressBar;
