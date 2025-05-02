class ParticleSystem {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.particles = [];
    this.colors = ['#0ff', '#f0f', '#ff0', '#0f0'];
  }

  createExplosion(x, y, count = 30, color = null) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(
        x,
        y,
        Math.random() * 3 + 1,
        Math.random() * Math.PI * 2,
        Math.random() * 5 + 2,
        color || this.colors[Math.floor(Math.random() * this.colors.length)],
        Math.random() * 0.5 + 0.5
      ));
    }
  }

  createTrail(x, y, direction, speed, color = '#0ff') {
    // Create fewer particles for trails to avoid performance issues
    for (let i = 0; i < 3; i++) {
      const angle = direction + (Math.random() - 0.5) * Math.PI / 4;
      const size = Math.random() * 2 + 1;
      const velocity = speed * 0.3 * (Math.random() * 0.5 + 0.5);
      
      this.particles.push(new Particle(
        x,
        y,
        velocity,
        angle,
        size,
        color,
        Math.random() * 0.3 + 0.1
      ));
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render() {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(this.ctx);
    }
  }
}

class Particle {
  constructor(x, y, speed, angle, size, color, fade) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.angle = angle;
    this.size = size;
    this.color = color;
    this.alpha = 1;
    this.fadeSpeed = fade || 0.02;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.fadeSpeed;
    this.size *= 0.99;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}

class ScreenShake {
  constructor(canvas) {
    this.canvas = canvas;
    this.intensity = 0;
    this.startTime = 0;
    this.duration = 0;
    this.originalTransform = canvas.style.transform;
  }

  shake(intensity = 5, duration = 300) {
    this.intensity = intensity;
    this.startTime = Date.now();
    this.duration = duration;
  }

  update() {
    if (this.intensity <= 0) return;
    
    const elapsed = Date.now() - this.startTime;
    if (elapsed > this.duration) {
      this.intensity = 0;
      this.canvas.style.transform = this.originalTransform;
      return;
    }

    // Diminishing intensity over time
    const remaining = 1 - (elapsed / this.duration);
    const currentIntensity = this.intensity * remaining;
    
    const dx = (Math.random() - 0.5) * 2 * currentIntensity;
    const dy = (Math.random() - 0.5) * 2 * currentIntensity;
    
    this.canvas.style.transform = `translate(${dx}px, ${dy}px)`;
  }
}

class Scanner {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.scanLinePos = 0;
    this.scanLineSpeed = 2;
    this.scanLineHeight = 2;
  }

  update() {
    this.scanLinePos += this.scanLineSpeed;
    if (this.scanLinePos > this.canvas.height) {
      this.scanLinePos = 0;
    }
  }

  render() {
    this.ctx.save();
    
    // Draw scan line
    const gradient = this.ctx.createLinearGradient(0, this.scanLinePos - this.scanLineHeight, 0, this.scanLinePos + this.scanLineHeight);
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
    gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, this.scanLinePos - this.scanLineHeight, this.canvas.width, this.scanLineHeight * 2);
    
    // Add a subtle screen-wide flicker effect
    if (Math.random() > 0.97) {
      this.ctx.fillStyle = 'rgba(0, 255, 255, 0.03)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    this.ctx.restore();
  }
}

class Grid {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.gridSize = 30;
    this.gridOpacity = 0.1;
  }

  render() {
    this.ctx.save();
    this.ctx.strokeStyle = `rgba(0, 255, 255, ${this.gridOpacity})`;
    this.ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let x = 0; x < this.canvas.width; x += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < this.canvas.height; y += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }
} 