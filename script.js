/**
 * 20/10 GREETING CARD — REAL THREE.JS WEBGL 3D BUBBLE GLASS
 * Minh Hiếu ✈️ Ngọc Linh
 * Sử dụng đúng vật liệu MeshPhysicalMaterial + CubeCamera Refraction từ bản demo MINH HIẾU
 */

import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

// Font Google Baloo 2 Bold hỗ trợ đầy đủ tiếng Việt có dấu
const LOCAL_FONT_URL = './baloo2.ttf';
const BACKUP_FONT_URL = 'https://fonts.gstatic.com/s/baloo2/v23/wXK0E3kTposypRydzVT08TS3JnAmtdiayqpv.ttf';

document.addEventListener('DOMContentLoaded', async () => {
  initGlassBalloonsCanvas();
  initKissButton();
  initClickElements();
  initMusicBox();

  // Khởi tạo hệ thống chữ 3D Bubble Glass WebGL
  await initAll3DBubbleScenes();
});

/* ==========================================================
   1. HỆ THỐNG THREE.JS 3D BUBBLE GLASS (Y HỆT DEMO "MINH HIẾU")
   ========================================================== */
async function loadVietnameseFont() {
  if (!window.opentype) {
    console.error('opentype.js chưa được tải');
    return null;
  }

  // Thử tải font local trước
  try {
    const font = await window.opentype.load(LOCAL_FONT_URL);
    if (font) return font;
  } catch (err) {
    console.warn('Không tải được font local, chuyển sang CDN fallback:', err);
  }

  // Thử tải qua CDN Google Fonts hợp lệ
  try {
    const font = await window.opentype.load(BACKUP_FONT_URL);
    if (font) return font;
  } catch (err) {
    console.error('Không tải được font từ CDN:', err);
    return null;
  }
}

async function initAll3DBubbleScenes() {
  // Tải font chữ hỗ trợ Tiếng Việt qua opentype.js
  const font = await loadVietnameseFont();
  if (!font) {
    console.error('Lỗi: Không thể tải font chữ 3D');
    const loadingEl = document.querySelector('.webgl-loading');
    if (loadingEl) loadingEl.textContent = '⚠️ Không thể tải font 3D. Vui lòng thử tải lại trang!';
    return;
  }

  // Ẩn dòng chữ loading
  const loadingEl = document.querySelector('.webgl-loading');
  if (loadingEl) {
    loadingEl.style.opacity = '0';
    setTimeout(() => { loadingEl.style.display = 'none'; }, 400);
  }

  // 1. Dựng sân khấu 3D chính: CHÚC MỪNG 20/10 + PHỤ NỮ VIỆT NAM + NGỌC LINH
  const heroContainer = document.getElementById('webgl-hero-title');
  if (heroContainer) {
    createBubbleGlassStage(heroContainer, font, {
      lines: [
        { text: 'CHÚC MỪNG NGÀY', size: 42, y: 1.55, tint: 0xffd1ec },
        { text: 'PHỤ NỮ VIỆT NAM', size: 54, y: 0.15, tint: 0xffffff },
        { text: 'NGỌC LINH', size: 62, y: -1.45, tint: 0xffb8e0 }
      ],
      cameraZ: 7.4,
      bubbleCount: 24
    });
  }

  // 2. Dựng sân khấu 3D chữ ký: MINH HIẾU
  const sigContainer = document.getElementById('webgl-sig-title');
  if (sigContainer) {
    createBubbleGlassStage(sigContainer, font, {
      lines: [
        { text: 'MINH HIẾU', size: 68, y: 0, tint: 0xffffff }
      ],
      cameraZ: 4.5,
      bubbleCount: 10
    });
  }
}

/**
 * Hàm chuyển chuỗi Tiếng Việt (có dấu) thành khối Three.js ExtrudeGeometry bo tròn căng mọng
 */
function createVietnamese3DTextGeometry(font, text, fontSize) {
  const svgLoader = new SVGLoader();
  const scale = 0.018 * (fontSize / 50);

  // Lấy đường path vector chuẩn của toàn bộ câu Tiếng Việt
  const otPath = font.getPath(text, 0, 0, 72);
  const pathData = otPath.toPathData(2);

  // Dùng SVGLoader của Three.js để tự động phân tách lòng chữ và dấu
  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${pathData}"/></svg>`;
  const svgData = svgLoader.parse(svgMarkup);

  const shapes = [];
  svgData.paths.forEach((p) => {
    // Sử dụng p.toShapes(true) chuẩn Three.js hiện đại để tự động ghép lỗ rỗng (O, A, Ư, Ợ...)
    const pathShapes = p.toShapes(true);
    shapes.push(...pathShapes);
  });

  // Đúc khối 3D với cạnh vát tròn trịa (tối ưu số segment để render 60FPS cực mượt mà vẫn căng bóng)
  const extrudeSettings = {
    depth: 16,
    bevelEnabled: true,
    bevelThickness: 7.5,
    bevelSize: 4.2,
    bevelOffset: 0,
    bevelSegments: 5,
    curveSegments: 6
  };

  const geometry = new THREE.ExtrudeGeometry(shapes, extrudeSettings);
  // Lật trục Y do hệ tọa độ SVG ngược với WebGL và thu phóng về kích thước chuẩn
  geometry.scale(scale, -scale, scale);
  geometry.center();
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Dựng cảnh WebGL Three.js với vật liệu kính khúc xạ MeshPhysicalMaterial & CubeCamera
 */
function createBubbleGlassStage(container, font, config) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 0, config.cameraZ);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  container.appendChild(renderer.domElement);

  // CubeCamera để tạo phản xạ gương & khúc xạ môi trường 360 độ giống hệt bản demo MINH HIẾU
  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
    format: THREE.RGBAFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter
  });
  const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
  scene.add(cubeCamera);

  // Nền lưới phát sáng ẩn phía sau để mặt kính bẻ cong ánh sáng (Refraction Backdrop)
  const backdropGroup = new THREE.Group();
  scene.add(backdropGroup);

  const orbColors = [0xff2a85, 0xa855f7, 0x38bdf8, 0xff9ec7, 0xffffff];
  const envOrbs = [];
  const orbGeo = new THREE.SphereGeometry(1, 24, 24);

  for (let i = 0; i < 14; i++) {
    const color = orbColors[i % orbColors.length];
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(orbGeo, mat);
    const angle = (i / 14) * Math.PI * 2;
    const radius = 3.2 + (i % 3) * 1.4;
    mesh.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * (radius * 0.65),
      -2.8 - (i % 3) * 0.8
    );
    mesh.scale.setScalar(0.35 + (i % 3) * 0.22);
    backdropGroup.add(mesh);
    envOrbs.push({ mesh, baseAngle: angle, radius, speed: 0.3 + (i % 4) * 0.1 });
  }

  // Hệ thống đèn 3D chiếu sáng viền kính (Specular & Rim Lights)
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
  scene.add(ambientLight);

  const lightPink = new THREE.PointLight(0xff4da6, 18, 25);
  lightPink.position.set(-4, 3, 4);
  scene.add(lightPink);

  const lightCyan = new THREE.PointLight(0x38bdf8, 16, 25);
  lightCyan.position.set(4, -2, 4);
  scene.add(lightCyan);

  const cursorLight = new THREE.PointLight(0xffffff, 22, 20);
  cursorLight.position.set(0, 1, 5);
  scene.add(cursorLight);

  // VẬT LIỆU BUBBLE GLASS THẬT (Giống hệt bản demo MINH HIẾU cậu thích)
  const createGlassMaterial = (tintHex) => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(tintHex),
    transmission: 0.96,       // Độ trong suốt truyền sáng qua kính
    opacity: 1,
    metalness: 0.05,
    roughness: 0.06,          // Bề mặt bóng loáng như pha lê
    ior: 1.52,                // Chỉ số khúc xạ bẻ cong hình ảnh phía sau
    thickness: 2.4,           // Độ dày khối kính 3D
    envMap: cubeRenderTarget.texture,
    envMapIntensity: 2.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    iridescence: 0.85,        // Tán sắc cầu vồng 7 màu trên rìa bong bóng
    iridescenceIOR: 1.35,
    specularIntensity: 1.5,
    specularColor: new THREE.Color(0xffffff)
  });

  // Nhóm chứa toàn bộ các dòng chữ 3D
  const textGroup = new THREE.Group();
  scene.add(textGroup);

  const textMeshes = [];
  config.lines.forEach((lineInfo) => {
    const geo = createVietnamese3DTextGeometry(font, lineInfo.text, lineInfo.size);
    const mat = createGlassMaterial(lineInfo.tint);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = lineInfo.y;
    textGroup.add(mesh);
    textMeshes.push(mesh);
  });

  // Thêm các hạt bong bóng thủy tinh 3D nhỏ bay lơ lửng xung quanh chữ
  const floatingBubbles = [];
  const bubbleGeo = new THREE.SphereGeometry(1, 32, 32);
  const sharedBubbleMat = createGlassMaterial(0xffebf5);

  for (let i = 0; i < config.bubbleCount; i++) {
    const bMesh = new THREE.Mesh(bubbleGeo, sharedBubbleMat);
    const scale = 0.08 + Math.random() * 0.22;
    bMesh.scale.setScalar(scale);

    const spreadX = (Math.random() - 0.5) * 8.5;
    const spreadY = (Math.random() - 0.5) * 4.2;
    const spreadZ = (Math.random() - 0.5) * 2.5;
    bMesh.position.set(spreadX, spreadY, spreadZ);

    scene.add(bMesh);
    floatingBubbles.push({
      mesh: bMesh,
      baseY: spreadY,
      speed: 0.8 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2
    });
  }

  // Đo bề rộng thực tế của các dòng chữ trong không gian 3D
  let maxLineWidth = 1;
  textMeshes.forEach((mesh) => {
    mesh.geometry.computeBoundingBox();
    const bb = mesh.geometry.boundingBox;
    const w = bb.max.x - bb.min.x;
    if (w > maxLineWidth) maxLineWidth = w;
  });

  // Tương tác di chuột / chạm tay xoay góc 3D mượt mà
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

  const onPointerMove = (e) => {
    const rect = container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    pointer.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.targetY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  };
  container.addEventListener('pointermove', onPointerMove);

  const resetPointer = () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
  };
  container.addEventListener('pointerleave', resetPointer);
  container.addEventListener('pointerup', resetPointer);
  container.addEventListener('pointercancel', resetPointer);

  // Nhấp vào chữ 3D sẽ nảy nhẹ và phát tiếng chuông pha lê
  let bounceImpulse = 0;
  container.addEventListener('pointerdown', () => {
    bounceImpulse = 0.14;
    playChime();
  });

  // Tự động co giãn theo màn hình (Responsive động dựa theo tầm nhìn Camera Frustum)
  const updateResponsiveScale = () => {
    const w = container.clientWidth || 300;
    const h = container.clientHeight || 200;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);

    // Tính bề rộng thực tế của tầm nhìn camera tại độ sâu z=0
    const vHeight = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * config.cameraZ;
    const vWidth = vHeight * (w / h);

    // Giữ lề an toàn để chữ không bao giờ bị cắt cụt trên bất kỳ màn hình nào
    const safeFitScale = (vWidth * 0.88) / maxLineWidth;
    const targetScale = Math.min(1.0, safeFitScale);
    textGroup.scale.setScalar(targetScale);
  };

  window.addEventListener('resize', updateResponsiveScale);
  updateResponsiveScale();

  // Vòng lặp Render 60FPS
  const clock = new THREE.Clock();
  let frameCount = 0;

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    frameCount++;

    // Làm mượt chuyển động chuột
    pointer.x += (pointer.targetX - pointer.x) * 0.08;
    pointer.y += (pointer.targetY - pointer.y) * 0.08;

    // Xoay nghiêng khối chữ 3D theo chuột + nhịp thở bồng bềnh
    textGroup.rotation.y = pointer.x * 0.38 + Math.sin(t * 0.9) * 0.08;
    textGroup.rotation.x = -pointer.y * 0.25 + Math.cos(t * 0.7) * 0.05;
    textGroup.position.y = Math.sin(t * 1.4) * 0.08;

    // Hiệu ứng nảy khi click
    if (bounceImpulse > 0.001) {
      textGroup.position.z = bounceImpulse * 3;
      bounceImpulse *= 0.88;
    } else {
      textGroup.position.z = 0;
    }

    // Di chuyển đèn theo chuột để viền chữ lấp lánh
    cursorLight.position.x = pointer.x * 5;
    cursorLight.position.y = pointer.y * 3;

    // Chuyển động các quả cầu phát sáng phía sau để khúc xạ qua lớp kính luôn sống động
    envOrbs.forEach((o, idx) => {
      const a = o.baseAngle + t * o.speed * (idx % 2 === 0 ? 1 : -1);
      o.mesh.position.x = Math.cos(a) * o.radius;
      o.mesh.position.y = Math.sin(a * 1.2) * (o.radius * 0.55);
    });

    // Chuyển động các bong bóng 3D nhỏ
    floatingBubbles.forEach((b) => {
      b.mesh.position.y = b.baseY + Math.sin(t * b.speed + b.phase) * 0.28;
    });

    // Cập nhật môi trường phản chiếu CubeCamera định kỳ giúp tối ưu hiệu năng mượt mà
    if (frameCount % 3 === 0) {
      textGroup.visible = false;
      cubeCamera.update(renderer, scene);
      textGroup.visible = true;
    }

    renderer.render(scene, camera);
  }

  animate();
}

/* ==========================================================
   2. CANVAS NỀN: BÓNG BAY THỦY TINH 2D TRÔI LƠ LỬNG
   ========================================================== */
function initGlassBalloonsCanvas() {
  const canvas = document.getElementById('balloon-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = window.innerWidth;
  let h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  window.addEventListener('resize', () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
  });

  const glassTints = [
    { base: 'rgba(255, 255, 255, 0.45)', edge: 'rgba(244, 114, 182, 0.75)', glow: 'rgba(244, 114, 182, 0.3)' },
    { base: 'rgba(255, 255, 255, 0.45)', edge: 'rgba(192, 132, 252, 0.7)', glow: 'rgba(192, 132, 252, 0.3)' },
    { base: 'rgba(255, 255, 255, 0.45)', edge: 'rgba(186, 230, 253, 0.7)', glow: 'rgba(186, 230, 253, 0.28)' },
    { base: 'rgba(255, 255, 255, 0.55)', edge: 'rgba(255, 255, 255, 0.95)', glow: 'rgba(255, 255, 255, 0.45)' }
  ];

  const balloons = [];
  const count = Math.min(Math.floor((w * h) / 22000), 36);

  for (let i = 0; i < count; i++) {
    balloons.push(createBalloon(w, h, glassTints, true));
  }

  function createBalloon(w, h, tints, init) {
    const r = Math.random() * 24 + 14;
    const tint = tints[Math.floor(Math.random() * tints.length)];
    return {
      x: Math.random() * w,
      y: init ? Math.random() * h : h + r + Math.random() * 120,
      r,
      tint,
      speedY: -(Math.random() * 0.55 + 0.28),
      speedX: (Math.random() - 0.5) * 0.3,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.016 + 0.006,
      opacity: Math.random() * 0.35 + 0.45,
      isBalloon: Math.random() > 0.55
    };
  }

  function drawGlassOrb(ctx, b) {
    ctx.save();
    ctx.globalAlpha = b.opacity;
    const { x, y, r, tint } = b;

    const bodyGrad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.08, x, y, r);
    bodyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
    bodyGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.12)');
    bodyGrad.addColorStop(0.9, tint.edge);
    bodyGrad.addColorStop(1, 'rgba(255, 255, 255, 0.85)');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.ellipse(x - r * 0.35, y - r * 0.38, r * 0.38, r * 0.2, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Nếu là bóng bay thật, vẽ thêm cuống bóng và dây bay lượn sóng
    if (b.isBalloon) {
      ctx.fillStyle = tint.edge;
      ctx.beginPath();
      ctx.moveTo(x - 3.5, y + r + 3.5);
      ctx.lineTo(x + 3.5, y + r + 3.5);
      ctx.lineTo(x, y + r - 0.5);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(x, y + r + 3.5);
      ctx.bezierCurveTo(
        x - Math.sin(b.wobblePhase) * 7, y + r + 14,
        x + Math.sin(b.wobblePhase) * 7, y + r + 24,
        x, y + r + 36
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < balloons.length; i++) {
      const b = balloons[i];
      b.wobblePhase += b.wobbleSpeed;
      b.y += b.speedY;
      b.x += b.speedX + Math.sin(b.wobblePhase) * 0.35;
      if (b.y < -b.r * 2.5) {
        Object.assign(b, createBalloon(w, h, glassTints, false));
      }
      drawGlassOrb(ctx, b);
    }
    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================
   3. NÚT GỬI NỤ HÔN & BÓNG BAY + HIỆU ỨNG ÂM THANH
   ========================================================== */
function initKissButton() {
  const btn = document.getElementById('kiss-button');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top;

    burstFloatingElements(cx, cy, 36);
    playChime();
  });
}

function initClickElements() {
  document.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button') || e.target.closest('canvas')) return;
    spawnFloatingItem(e.clientX, e.clientY);
  });
}

function spawnFloatingItem(x, y, customEmoji) {
  const container = document.getElementById('flying-elements-layer');
  if (!container) return;

  const el = document.createElement('div');
  el.className = 'burst-element';

  const emojis = ['💖', '🎈', '✨', '🌸', '🫧', '💕', '🩷', '🩵', '🤍'];
  el.textContent = customEmoji || emojis[Math.floor(Math.random() * emojis.length)];

  el.style.left = (x - 14) + 'px';
  el.style.top = (y - 14) + 'px';
  el.style.fontSize = (Math.random() * 0.9 + 1.3) + 'rem';
  el.style.filter = 'drop-shadow(0 4px 12px rgba(244, 114, 182, 0.45))';

  container.appendChild(el);
  setTimeout(() => el.remove(), 3600);
}

function burstFloatingElements(x, y, count) {
  const emojis = ['💋', '💖', '🎈', '🫧', '✨', '🌸', '💕', '🩷', '🤍'];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const offsetX = (Math.random() - 0.5) * 280;
      const offsetY = (Math.random() - 0.5) * 90;
      spawnFloatingItem(x + offsetX, y + offsetY, emojis[Math.floor(Math.random() * emojis.length)]);
    }, i * 40);
  }
}

/* ==========================================================
   4. HỘP NHẠC WEB AUDIO
   ========================================================== */
let audioCtx = null;
let isMusicPlaying = false;
let musicInterval = null;

function initMusicBox() {
  const toggleBtn = document.getElementById('music-toggle');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (isMusicPlaying) {
      stopMusic(toggleBtn);
    } else {
      startMusic(toggleBtn);
    }
  });
}

const melodyNotes = [
  523.25, 659.25, 783.99, 987.77, 880.00, 783.99,
  659.25, 587.33, 523.25, 698.46, 659.25, 587.33,
  523.25, 659.25, 880.00, 1046.50, 987.77, 783.99,
  659.25, 587.33, 523.25, 587.33, 659.25, 523.25
];

let noteIndex = 0;

function startMusic(btn) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  isMusicPlaying = true;
  btn.classList.add('playing');
  btn.querySelector('.music-label').textContent = 'Đang phát ♪';
  playNextNote();
  musicInterval = setInterval(playNextNote, 620);
}

function stopMusic(btn) {
  isMusicPlaying = false;
  clearInterval(musicInterval);
  btn.classList.remove('playing');
  btn.querySelector('.music-label').textContent = 'Nhạc nhẹ';
}

function playNextNote() {
  if (!audioCtx || !isMusicPlaying) return;
  const freq = melodyNotes[noteIndex % melodyNotes.length];
  noteIndex++;
  playTone(freq, 1.4);
  if (noteIndex % 3 === 0) playTone(freq / 2, 2.0, 0.08);
}

function playTone(freq, duration = 1.2, volume = 0.12) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

function playChime() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  playTone(523.25, 1.2, 0.12);
  setTimeout(() => playTone(659.25, 1.2, 0.12), 80);
  setTimeout(() => playTone(783.99, 1.4, 0.14), 160);
  setTimeout(() => playTone(1046.50, 1.8, 0.16), 240);
}