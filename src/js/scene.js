import * as THREE from 'three';

export function mountScene(canvas) {
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  let renderer, scene, camera, raf, disposed = false;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: window.devicePixelRatio < 2 });
  } catch (error) { canvas.style.display = 'none'; return () => {}; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 8.5);

  const root = new THREE.Group();
  root.position.set(2.05, -0.15, -0.3);
  scene.add(root);

  const coreGeo = new THREE.IcosahedronGeometry(1.2, 5);
  const coreMat = new THREE.MeshPhysicalMaterial({ color: 0x416f95, metalness: 0.72, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.12, emissive: 0x132c44, emissiveIntensity: 0.45 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  root.add(core);

  const torusMat = new THREE.MeshStandardMaterial({ color: 0x7beee6, metalness: 0.72, roughness: 0.22, emissive: 0x155c66, emissiveIntensity: 0.7 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.72, 0.026, 12, 220), torusMat);
  ring.rotation.set(0.9, 0.2, -0.42); root.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.48, 0.014, 10, 180), new THREE.MeshStandardMaterial({ color: 0xa78bfa, metalness: 0.6, roughness: 0.24, emissive: 0x452d8a, emissiveIntensity: 0.9 }));
  ring2.rotation.set(0.2, 0.9, 0.6); root.add(ring2);
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.85, 0.018, 140, 8, 2, 5), new THREE.MeshStandardMaterial({ color: 0xf09add, metalness: 0.7, roughness: 0.16, emissive: 0x51254b, emissiveIntensity: 0.75 }));
  knot.rotation.set(0.7, 0.2, 0); root.add(knot);

  const particlesCount = window.innerWidth < 700 ? 250 : 700;
  const positions = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount; i++) {
    const radius = 2.2 + Math.random() * 5.4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  const particleGeo = new THREE.BufferGeometry(); particleGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color: 0x9cafff, size: 0.018, transparent: true, opacity: 0.65, sizeAttenuation: true }));
  scene.add(particles);
  scene.add(new THREE.AmbientLight(0x9eaeff, 1.2));
  const key = new THREE.PointLight(0x69f2e6, 28, 18); key.position.set(3, 3, 4); scene.add(key);
  const fill = new THREE.PointLight(0x9574ff, 22, 16); fill.position.set(-3, -2, 3); scene.add(fill);
  let mx = 0, my = 0;
  const pointer = (event) => { mx = (event.clientX / innerWidth - .5) * .5; my = (event.clientY / innerHeight - .5) * .35; };
  window.addEventListener('pointermove', pointer, { passive: true });
  const resize = () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight, false); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7)); };
  window.addEventListener('resize', resize, { passive: true });
  const clock = new THREE.Clock();
  const tick = () => {
    if (disposed) return;
    const t = clock.getElapsedTime();
    root.rotation.y = t * 0.12 + mx * .25; root.rotation.x = Math.sin(t * .16) * .08 + my;
    core.rotation.y = t * .08; ring.rotation.z += .0009; ring2.rotation.x += .0006; knot.rotation.z = t * .11;
    particles.rotation.y = t * .008; particles.rotation.x = Math.sin(t * .04) * .06;
    camera.position.x += (mx * 1.8 - camera.position.x) * .025;
    camera.position.y += (-my * 1.3 - camera.position.y) * .025;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  tick();
  return () => { disposed = true; cancelAnimationFrame(raf); window.removeEventListener('pointermove', pointer); window.removeEventListener('resize', resize); renderer.dispose(); coreGeo.dispose(); coreMat.dispose(); particleGeo.dispose(); };
}
