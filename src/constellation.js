import * as THREE from 'three';

// Constellation backdrop for the zen sections below the hero: ink dots and
// hairline connections drifting slowly in 3D over the paper-white page.
// Ink-on-white so the Swiss layout stays dominant.
export class ConstellationScene {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.z = 14;

    this.pointer = { x: 0, y: 0 };
    this.clock = new THREE.Clock();
    this.running = false;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    const COUNT = 130;
    const points = [];
    for (let i = 0; i < COUNT; i++) {
      points.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 26,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 6
        )
      );
    }

    const dotGeo = new THREE.BufferGeometry().setFromPoints(points);
    this.group.add(
      new THREE.Points(
        dotGeo,
        new THREE.PointsMaterial({
          color: 0x111111,
          size: 0.09,
          transparent: true,
          opacity: 0.75,
        })
      )
    );

    // sparse accent stars in the zen palette's orange
    const accents = points.filter((_, i) => i % 17 === 0);
    const accentGeo = new THREE.BufferGeometry().setFromPoints(accents);
    this.group.add(
      new THREE.Points(
        accentGeo,
        new THREE.PointsMaterial({
          color: 0xff3c00,
          size: 0.16,
          transparent: true,
          opacity: 0.9,
        })
      )
    );

    // connect near neighbours into constellation lines
    const linePoints = [];
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        if (points[i].distanceTo(points[j]) < 2.8) {
          linePoints.push(points[i], points[j]);
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    this.group.add(
      new THREE.LineSegments(
        lineGeo,
        new THREE.LineBasicMaterial({
          color: 0x111111,
          transparent: true,
          opacity: 0.14,
        })
      )
    );

    window.addEventListener('mousemove', (e) => {
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    });
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    this.animate();
  }

  animate() {
    if (!this.running) return;
    const t = this.clock.getElapsedTime();

    this.group.rotation.y = t * 0.03 + this.pointer.x * 0.08;
    this.group.rotation.x = Math.sin(t * 0.05) * 0.06 + this.pointer.y * 0.05;
    // gentle depth shift as the page scrolls
    this.group.position.y = window.scrollY * 0.0006;

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }
}
