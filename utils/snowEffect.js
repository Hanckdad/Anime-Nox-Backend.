// Snow effect utility for profile pictures
class SnowEffect {
  constructor(canvas, imageUrl) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.imageUrl = imageUrl;
    this.snowflakes = [];
    this.image = new Image();
    this.isLoaded = false;
    
    this.init();
  }

  init() {
    // Set canvas size
    this.canvas.width = 200;
    this.canvas.height = 200;

    // Load profile image
    this.image.onload = () => {
      this.isLoaded = true;
      this.createSnowflakes();
      this.animate();
    };
    
    this.image.onerror = () => {
      console.error('Failed to load profile image');
      this.isLoaded = true;
      this.createSnowflakes();
      this.animate();
    };
    
    this.image.src = this.imageUrl;
    this.image.crossOrigin = 'anonymous';
  }

  createSnowflakes() {
    this.snowflakes = [];
    const flakeCount = 50;

    for (let i = 0; i < flakeCount; i++) {
      this.snowflakes.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 3 + 1,
        speed: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        swing: Math.random() * 0.5 - 0.25
      });
    }
  }

  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw profile image
    if (this.isLoaded) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 90, 0, Math.PI * 2);
      this.ctx.closePath();
      this.ctx.clip();
      
      this.ctx.drawImage(this.image, 10, 10, 180, 180);
      this.ctx.restore();
    }

    // Draw snowflakes
    this.ctx.fillStyle = 'white';
    
    this.snowflakes.forEach(flake => {
      this.ctx.beginPath();
      this.ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      this.ctx.closePath();
      
      this.ctx.save();
      this.ctx.globalAlpha = flake.opacity;
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  update() {
    this.snowflakes.forEach(flake => {
      flake.y += flake.speed;
      flake.x += flake.swing;
      
      // Reset snowflake if it goes off screen
      if (flake.y > this.canvas.height) {
        flake.y = -10;
        flake.x = Math.random() * this.canvas.width;
      }
      
      // Keep snowflakes within horizontal bounds
      if (flake.x < -10) flake.x = this.canvas.width + 10;
      if (flake.x > this.canvas.width + 10) flake.x = -10;
    });
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  // Export as data URL
  getDataURL() {
    return this.canvas.toDataURL('image/png');
  }
}

module.exports = SnowEffect;