class SmoothProgressBar {
  constructor(selector, options = {}) {
    this.selector = selector;
    this.element = document.querySelector(selector);

    // Créer l'élément si non existant
    if (!this.element) {
      this.element = document.createElement("div");
      this.element.className = "smooth-progress-bar";
      if (options.gradient) this.element.classList.add("gradient");
      document.body.appendChild(this.element);
    }

    this.progress = 0;
    this.targetProgress = 0;
    this.animationFrame = null;
    this.options = {
      smoothness: options.smoothness || 0.1,
      autoHide: options.autoHide !== undefined ? options.autoHide : true,
    };

    this.update = this.update.bind(this);
  }

  update() {
    // Calculer le nouveau progrès avec effet de lissage
    this.progress +=
      (this.targetProgress - this.progress) * this.options.smoothness;

    // Appliquer le progrès à l'élément
    this.element.style.width = `${this.progress}%`;

    // Auto-masquer si à 100%
    if (this.options.autoHide && this.progress >= 99.9) {
      setTimeout(() => {
        this.element.style.opacity = "0";

        setTimeout(() => {
          this.reset();
        }, 300);
      }, 500);
    } else {
      this.element.style.opacity = "1";
    }

    // Continuer l'animation si nécessaire
    if (Math.abs(this.progress - this.targetProgress) > 0.1) {
      this.animationFrame = requestAnimationFrame(this.update);
    }
  }

  updateProgress(percent) {
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;

    this.targetProgress = percent;

    if (!this.animationFrame) {
      this.animationFrame = requestAnimationFrame(this.update);
    }
  }

  reset() {
    this.progress = 0;
    this.targetProgress = 0;
    this.element.style.width = "0";
    this.element.style.opacity = "1";
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
}
