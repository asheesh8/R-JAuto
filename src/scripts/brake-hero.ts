/**
 * The hero brake: rotor, caliper and pads (CC-BY, see modelCredits). The
 * rotor spins, the pointer tilts the assembly, and scrolling through
 * [data-brake-track] pulls the caliper and pads off the rotor, the way the
 * job actually starts.
 *
 * Lit for a light page: a soft key and sky fill, no coloured rim.
 */
import {
  Box3,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export async function mountBrake(canvas: HTMLCanvasElement, track: HTMLElement) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new Scene();
  scene.environment = new PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 1;
  scene.add(new HemisphereLight(0xf4f7f5, 0x7f8883, 0.9));
  const key = new DirectionalLight(0xffffff, 2.6);
  key.position.set(3, 5, 6);
  scene.add(key);
  const back = new DirectionalLight(0xe4ece7, 1.4);
  back.position.set(-4, 2, -4);
  scene.add(back);

  const camera = new PerspectiveCamera(30, 1, 0.1, 100);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync('/models/brake.glb');
  const model = gltf.scene;

  const box = new Box3().setFromObject(model);
  const size = box.getSize(new Vector3());
  model.position.sub(box.getCenter(new Vector3()));
  const holder = new Group();
  holder.add(model);
  holder.scale.setScalar(2.2 / Math.max(size.x, size.y, size.z));
  const assembly = new Group();
  assembly.add(holder);
  scene.add(assembly);

  const part = (n: string) => model.getObjectByName(n) as Mesh | undefined;
  const rotor = part('rotor');
  const caliper = part('caliper');
  const pads = part('pads');

  if (rotor) {
    rotor.material = new MeshPhysicalMaterial({ color: '#c6cacd', metalness: 1, roughness: 0.3, clearcoat: 0.2 });
    // Spin about the rotor's own axis (local Y), through its own centre.
    rotor.geometry.computeBoundingBox();
    const c = rotor.geometry.boundingBox!.getCenter(new Vector3());
    rotor.geometry.translate(-c.x, 0, -c.z);
    rotor.position.set(c.x, 0, c.z);
  }
  // Caliper in the plate green.
  if (caliper) caliper.material = new MeshPhysicalMaterial({ color: '#1d5236', metalness: 0.15, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.1 });
  if (pads) pads.material = new MeshPhysicalMaterial({ color: '#3b413e', metalness: 0.5, roughness: 0.6 });
  const home = { cal: caliper?.position.clone(), pad: pads?.position.clone() };

  let w = 0;
  let h = 0;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    if (r.width === w && r.height === h) return;
    w = r.width;
    h = r.height;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    // Pull back on tall canvases so the disc always fits the width.
    camera.position.set(0, 0, camera.aspect >= 1 ? 6.6 : Math.min(12, 5.4 / camera.aspect));
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  let px = 0, py = 0, tx = 0, ty = 0;
  addEventListener('pointermove', (e) => {
    tx = (e.clientX / innerWidth - 0.5) * 2;
    ty = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);

  let spin = 0;
  let explode = 0;
  let last = performance.now();
  const frame = (now: number) => {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!visible || document.hidden) return;
    resize();

    // Progress through the hero and the brakes copy beside it.
    const rect = track.getBoundingClientRect();
    const sticky = getComputedStyle(canvas).position === 'sticky';
    const span = sticky ? rect.height - innerHeight : innerHeight * 0.8;
    const p = clamp(-rect.top / Math.max(1, span));
    explode = reduce ? ease(p) : lerp(explode, ease(p), 0.08);

    px = lerp(px, tx, 0.06);
    py = lerp(py, ty, 0.06);
    if (!reduce) spin += dt * (0.8 + explode * 1.4);
    if (rotor) rotor.rotation.y = -spin;

    // Three-quarter view at rest, turning side-on as it comes apart.
    assembly.rotation.x = lerp(-0.38, -0.12, explode) + py * 0.1;
    assembly.rotation.y = lerp(-0.6, -1.1, explode) + px * 0.18;
    // Slide left as the parts come off so they stay in frame.
    assembly.position.x = lerp(0, -0.55, explode);

    if (caliper && home.cal) caliper.position.set(home.cal.x + explode * 14, home.cal.y + explode * 15, home.cal.z);
    if (pads && home.pad) pads.position.set(home.pad.x + explode * 7, home.pad.y + explode * 7.5, home.pad.z);

    renderer.render(scene, camera);
  };
  requestAnimationFrame(frame);
  canvas.dataset.ready = 'true';
}
