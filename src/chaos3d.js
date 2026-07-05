import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Renders the Blender-authored shattered-typography asset (chaos_typo.glb)
// as the Chaos Mode backdrop. Letters drift slowly; debris shards float
// on individual sine phases; the whole cloud follows the mouse as parallax.
export class ChaosScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.isActive = false;
    this.animationFrameId = null;
    this.clock = new THREE.Clock();
    this.pointer = { x: 0, y: 0 };
    this.shards = [];
    this.letters = [];
    this.targetX = 1.0; // follows the 静/沌 boundary so the cloud stays in the chaos pane

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      50
    );
    this.camera.position.set(0, 0, 6.5);

    // Procedural IBL so the GLB's PBR materials don't collapse to black
    // (no env map = dark metal), per the Blender->WebGL rescue pattern.
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const green = new THREE.PointLight(0x00ff66, 30, 20);
    green.position.set(3, 2, 4);
    this.scene.add(green);
    const violet = new THREE.PointLight(0x8c4aff, 30, 20);
    violet.position.set(-3, -2, 3);
    this.scene.add(violet);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    new GLTFLoader().load(
      `${import.meta.env.BASE_URL}assets/chaos_typo.glb`,
      (gltf) => {
        gltf.scene.traverse((node) => {
          if (!node.isMesh) return;
          if (node.name.startsWith('Shard_')) {
            this.shards.push({
              mesh: node,
              baseY: node.position.y,
              phase: Math.random() * Math.PI * 2,
              speed: 0.4 + Math.random() * 0.8,
              spin: (Math.random() - 0.5) * 0.8,
            });
          } else if (node.name.startsWith('Letter_')) {
            this.letters.push({
              mesh: node,
              baseRotZ: node.rotation.z,
              phase: Math.random() * Math.PI * 2,
            });
          }
        });
        this.group.add(gltf.scene);
      },
      undefined,
      (err) => console.error('chaos_typo.glb load failed:', err)
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
    if (this.isActive) return;
    this.isActive = true;
    this.clock.start();
    this.animate();
  }

  stop() {
    this.isActive = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  // pct = boundary position in vw%; recenter the cloud toward the chaos pane
  setSplit(pct) {
    this.targetX = (pct / 100 - 0.35) * 4;
  }

  animate() {
    if (!this.isActive) return;
    const t = this.clock.getElapsedTime();

    this.group.position.x += (this.targetX - this.group.position.x) * 0.05;
    this.group.rotation.y = Math.sin(t * 0.08) * 0.25 + this.pointer.x * 0.18;
    this.group.rotation.x = this.pointer.y * 0.1;

    for (const s of this.shards) {
      s.mesh.position.y = s.baseY + Math.sin(t * s.speed + s.phase) * 0.18;
      s.mesh.rotation.x += 0.002 * s.spin;
      s.mesh.rotation.y += 0.003 * s.spin;
    }
    for (const l of this.letters) {
      l.mesh.rotation.z = l.baseRotZ + Math.sin(t * 0.5 + l.phase) * 0.02;
    }

    this.renderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
}
