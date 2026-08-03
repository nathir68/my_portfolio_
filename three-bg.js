class ThreeBackground {
  constructor() {
    this.canvas = document.getElementById('bg-canvas');
    if (!this.canvas) return;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0b10, 0.015);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 8;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollY = 0;
    this.scrollProgress = 0;

    this.particles = null;
    this.lights = [];

    this.init();
  }

  init() {
    this.createLights();
    this.createParticles();
    this.setupEvents();
    this.animate();
  }

  createLights() {
    const ambientLight = new THREE.AmbientLight(0x0e0e2a, 1.5);
    this.scene.add(ambientLight);

    const purpleLight = new THREE.PointLight(0x9a4bfe, 15, 100);
    purpleLight.position.set(5, 5, 5);
    this.scene.add(purpleLight);
    this.lights.push({ light: purpleLight, speed: 0.001, angle: 0, radius: 10, yOffset: 2 });

    const cyanLight = new THREE.PointLight(0x00f0ff, 15, 100);
    cyanLight.position.set(-5, -5, 5);
    this.scene.add(cyanLight);
    this.lights.push({ light: cyanLight, speed: -0.0015, angle: Math.PI, radius: 8, yOffset: -2 });
  }

  createParticles() {
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorCyan = new THREE.Color(0x00f2fe);
    const colorPurple = new THREE.Color(0xc471ed);
    const colorWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 8 + Math.random() * 20;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);

      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi) - 5;

      const mixRatio = Math.random();
      let color;
      if (mixRatio < 0.45) {
        color = colorCyan.clone().lerp(colorWhite, Math.random() * 0.5);
      } else if (mixRatio < 0.9) {
        color = colorPurple.clone().lerp(colorWhite, Math.random() * 0.5);
      } else {
        color = colorWhite;
      }

      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Circular particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      map: texture,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  setupEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    window.addEventListener('scroll', () => {
      this.scrollY = window.scrollY;
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      this.scrollProgress = totalScroll > 0 ? this.scrollY / totalScroll : 0;
    });
  }

  animate = () => {
    requestAnimationFrame(this.animate);

    const time = performance.now() * 0.001;

    // Smooth mouse parallax camera movement
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    this.camera.position.x = this.mouse.x * 2.5;
    this.camera.position.y = this.mouse.y * 2.5;
    this.camera.lookAt(0, 0, 0);

    // Starfield rotation
    if (this.particles) {
      this.particles.rotation.y = time * 0.012 + this.scrollProgress * 0.4;
      this.particles.rotation.x = time * 0.006 + this.scrollProgress * 0.2;
    }

    // Dynamic light movement
    this.lights.forEach((lightObj) => {
      lightObj.angle += lightObj.speed;
      lightObj.light.position.x = Math.cos(lightObj.angle) * lightObj.radius;
      lightObj.light.position.z = Math.sin(lightObj.angle) * lightObj.radius;
      lightObj.light.position.y = lightObj.yOffset + Math.sin(time) * 1.5;
    });

    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  new ThreeBackground();
});
