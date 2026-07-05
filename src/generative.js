export class GenerativeEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animationFrameId = null;
    this.mouse = { x: null, y: null, radius: 120 };
    this.isActive = false;
    this.resizeTimeout = null;

    // Bind event listeners
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => this.resize(), 200);
    });
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('mouseleave', () => this.handleMouseLeave());
  }

  start() {
    this.isActive = true;
    this.resize();
    this.initParticles();
    this.animate();
  }

  stop() {
    this.isActive = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.isActive) {
      this.initParticles();
    }
  }

  handleMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  handleMouseLeave() {
    this.mouse.x = null;
    this.mouse.y = null;
  }

  initParticles() {
    this.particles = [];
    
    // Find target text elements on the page to digitize
    const targetElement = document.querySelector('.hero-title');
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    
    // Create an offscreen canvas to scan the text shape
    const offscreen = document.createElement('canvas');
    const oCtx = offscreen.getContext('2d');
    offscreen.width = rect.width;
    offscreen.height = rect.height;
    
    // Draw text to offscreen canvas
    oCtx.fillStyle = '#ffffff';
    oCtx.textBaseline = 'top';
    
    // Read styles of target element to match original bounds
    const style = window.getComputedStyle(targetElement);
    const fontSize = parseFloat(style.fontSize);
    const fontWeight = style.fontWeight;
    const fontFamily = style.fontFamily;
    
    oCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    
    // We split lines as in the HTML structure
    const lines = targetElement.querySelectorAll('.line');
    let currentY = 0;
    
    // Get line height adjustment
    const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.1;
    
    lines.forEach((line) => {
      oCtx.fillText(line.textContent, 0, currentY);
      currentY += lineHeight;
    });

    // Scan pixel data
    const imgData = oCtx.getImageData(0, 0, offscreen.width, offscreen.height);
    const data = imgData.data;
    
    // Sample pixels (higher value = better performance, lower = higher resolution)
    const sampleRate = window.innerWidth < 768 ? 6 : 4; 
    
    for (let y = 0; y < offscreen.height; y += sampleRate) {
      for (let x = 0; x < offscreen.width; x += sampleRate) {
        const index = (y * offscreen.width + x) * 4;
        const alpha = data[index + 3];
        
        if (alpha > 128) {
          // Pixel coordinate relative to the viewport
          const posX = rect.left + x + window.scrollX;
          const posY = rect.top + y + window.scrollY;
          
          this.particles.push(new Particle(posX, posY));
        }
      }
    }
  }

  animate() {
    if (!this.isActive) return;
    
    this.ctx.fillStyle = 'rgba(12, 12, 12, 0.2)'; // Trail fade effect
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw background grid in Chaos Mode
    this.drawBackgroundGrid();

    // Update and draw particles
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update(this.mouse);
      this.particles[i].draw(this.ctx);
    }
    
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  drawBackgroundGrid() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.01)';
    this.ctx.lineWidth = 1;
    const size = 80;
    
    for (let x = 0; x < this.canvas.width; x += size) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += size) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }
}

class Particle {
  constructor(x, y) {
    // Start at a random position on screen and fly to the typography grid
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.originX = x;
    this.originY = y;
    this.vx = 0;
    this.vy = 0;
    this.size = Math.random() * 2 + 1;
    this.ease = 0.06;
    this.friction = 0.88;
    this.density = Math.random() * 40 + 15;
    
    // Random characters (A-Z, 0-9) to paint typography particles
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@&+=*%'.split('');
    this.char = chars[Math.floor(Math.random() * chars.length)];
    
    // Color scheme: neon green or soft white/grey
    const rand = Math.random();
    if (rand > 0.85) {
      this.color = '#00ff66'; // Electric green
    } else if (rand > 0.7) {
      this.color = '#ff3c00'; // Accent orange
    } else {
      this.color = '#f5f4ef'; // Cream white
    }
  }

  update(mouse) {
    // Current target position (takes scrolling into account)
    const targetX = this.originX - window.scrollX;
    const targetY = this.originY - window.scrollY;

    let dx = targetX - this.x;
    let dy = targetY - this.y;
    
    // Elastic spring physics back to the typography blueprint
    this.vx += dx * this.ease;
    this.vy += dy * this.ease;
    
    // Mouse repulsion field
    if (mouse.x !== null && mouse.y !== null) {
      let mouseDx = mouse.x - this.x;
      let mouseDy = mouse.y - this.y;
      let distance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
      
      if (distance < mouse.radius) {
        let forceDirectionX = mouseDx / distance;
        let forceDirectionY = mouseDy / distance;
        let force = (mouse.radius - distance) / mouse.radius;
        
        this.vx -= forceDirectionX * force * this.density;
        this.vy -= forceDirectionY * force * this.density;
      }
    }
    
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.font = `${this.size * 3.5}px 'Space Grotesk'`;
    ctx.fillText(this.char, this.x, this.y);
  }
}
