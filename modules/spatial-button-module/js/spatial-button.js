/** Standalone spatial interaction experiment. No framework or external dependencies. */
const moduleRoot = document.querySelector('[data-spatial-button]');
if (moduleRoot) initializeSpatialButton(moduleRoot);

function initializeSpatialButton(root) {
  const stage = root.querySelector('[data-stage]');
  const canvas = root.querySelector('[data-mesh]');
  const ctx = canvas.getContext('2d');
  const object = root.querySelector('[data-object]');
  const button = root.querySelector('[data-button]');
  const status = root.querySelector('[data-status]');
  const fieldToggle = root.querySelector('[data-field-toggle]');
  const depthInput = root.querySelector('[data-depth]');
  const depthOutput = root.querySelector('[data-depth-output]');
  const motionToggle = root.querySelector('[data-motion-toggle]');
  const resetButton = root.querySelector('[data-reset]');
  const uiKitLink = root.querySelector('[data-ui-kit-link]');
  // Replace with the actual URL of your UI kit when integrating.
  uiKitLink.addEventListener('click', (e) => { if (uiKitLink.getAttribute('href') === '#') e.preventDefault(); });

  const settings = { depth: .55, reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches };
  const state = { x: 0, y: 0, w: 190, h: 86, active: null, gesture: null, pressTimer: null, pointerStart: null, settle: null };
  const points = [];
  let cols = 0, rows = 0, width = 0, height = 0, lastTime = 0, raf = 0;
  const gap = 28;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const pointFromEvent = (e) => { const rect = stage.getBoundingClientRect(); return { x: e.clientX - rect.left, y: e.clientY - rect.top }; };
  const bounds = () => ({ minW: 115, maxW: Math.min(width * .58, 270), minH: 54, maxH: 116 });
  const margin = 14;
  const limitPosition = () => {
    const over = 0.28;
    state.x = clamp(state.x, -state.w * over, width - state.w * (1 - over));
    state.y = clamp(state.y, -state.h * over, height - state.h * (1 - over));
  };
  const renderObject = () => {
    object.style.left = `${state.x + state.w / 2}px`;
    object.style.top = `${state.y + state.h / 2}px`;
    object.style.width = `${state.w}px`;
    object.style.height = `${state.h}px`;
  };
  function rebuild() {
    const oldW = width, oldH = height;
    const r = stage.getBoundingClientRect();
    width = r.width; height = r.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.max(2, Math.ceil(width / gap) + 1);
    rows = Math.max(2, Math.ceil(height / gap) + 1);
    points.length = 0;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = i * width / (cols - 1), y = j * height / (rows - 1);
      points.push({ x, y, ox: x, oy: y, vx: 0, vy: 0, edge: i === 0 || j === 0 || i === cols - 1 || j === rows - 1 });
    }
    if (!oldW || !oldH) { state.x = (width - state.w) / 2; state.y = (height - state.h) / 2; }
    else { state.x *= width / oldW; state.y *= height / oldH; }
    state.w = clamp(state.w, bounds().minW, bounds().maxW);
    state.h = clamp(state.h, bounds().minH, bounds().maxH);
    limitPosition(); renderObject();
  }
  function influence(x, y, dx, dy, strength = 1) {
    if (settings.reduced || settings.depth === 0) return;
    const radius = 120;
    for (const p of points) {
      if (p.edge) continue;
      const dist = Math.hypot(p.x - x, p.y - y);
      if (dist > radius) continue;
      const falloff = Math.pow(1 - dist / radius, 2);
      p.vx += dx * falloff * settings.depth * strength;
      p.vy += dy * falloff * settings.depth * strength;
    }
  }
  function animate(t) {
    const dt = Math.min(2, (t - (lastTime || t)) / 16.67); lastTime = t;
    ctx.clearRect(0, 0, width, height);
    for (const p of points) {
      if (p.edge) continue;
      if (settings.reduced) { p.x = p.ox; p.y = p.oy; p.vx = p.vy = 0; }
      else {
        p.vx += (p.ox - p.x) * .065 * dt;
        p.vy += (p.oy - p.y) * .065 * dt;
        p.vx *= Math.pow(.82, dt); p.vy *= Math.pow(.82, dt);
        p.x += p.vx * dt; p.y += p.vy * dt;
      }
    }
    ctx.beginPath();
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const p = points[j * cols + i];
      if (i < cols - 1) { const q = points[j * cols + i + 1]; ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); }
      if (j < rows - 1) { const q = points[(j + 1) * cols + i]; ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); }
    }
    ctx.strokeStyle = 'rgba(130,183,225,.19)'; ctx.lineWidth = .7; ctx.stroke();
    ctx.fillStyle = 'rgba(160,205,237,.55)';
    for (const p of points) { ctx.beginPath(); ctx.arc(p.x, p.y, 1.45, 0, Math.PI * 2); ctx.fill(); }
    raf = requestAnimationFrame(animate);
  }
  function settle() {
    // Overscroll is temporary. The final position always stays inside the stage.
    const targetX = clamp(state.x, margin, Math.max(margin, width - state.w - margin));
    const targetY = clamp(state.y, margin, Math.max(margin, height - state.h - margin));
    if (state.settle) cancelAnimationFrame(state.settle);
    if (settings.reduced) { state.x = targetX; state.y = targetY; renderObject(); status.textContent = 'Settled'; return; }
    let vx = 0, vy = 0;
    const step = () => {
      vx = (vx + (targetX - state.x) * .13) * .72;
      vy = (vy + (targetY - state.y) * .13) * .72;
      state.x += vx; state.y += vy; renderObject();
      if (Math.abs(state.x - targetX) + Math.abs(state.y - targetY) + Math.abs(vx) + Math.abs(vy) > .35) state.settle = requestAnimationFrame(step);
      else { state.x = targetX; state.y = targetY; renderObject(); state.settle = null; status.textContent = 'Settled · Position retained'; }
    };
    step();
  }
  function start(e, kind, corner = '') {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (state.active) return;
    if (state.settle) { cancelAnimationFrame(state.settle); state.settle = null; }
    e.preventDefault();
    const p = pointFromEvent(e);
    state.active = { id: e.pointerId, kind, corner, x: p.x, y: p.y, startX: p.x, startY: p.y, initial: { x: state.x, y: state.y, w: state.w, h: state.h }, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
    if (kind === 'press') { object.classList.add('is-pressing'); status.textContent = 'Pressing · Elastic compression'; influence(p.x, p.y, 0, 10, 5); }
    else { object.classList.add('is-dragging'); status.textContent = 'Resizing · Size constraints active'; }
  }
  button.addEventListener('pointerdown', e => start(e, 'press'));
  root.querySelectorAll('[data-handle]').forEach(h => {
    h.addEventListener('pointerdown', e => start(e, 'resize', h.dataset.handle));
    h.addEventListener('keydown', e => {
      const step = e.shiftKey ? 16 : 6;
      if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      const b = bounds();
      if (e.key === 'ArrowRight') state.w = clamp(state.w + step, b.minW, b.maxW);
      if (e.key === 'ArrowLeft') state.w = clamp(state.w - step, b.minW, b.maxW);
      if (e.key === 'ArrowDown') state.h = clamp(state.h + step, b.minH, b.maxH);
      if (e.key === 'ArrowUp') state.h = clamp(state.h - step, b.minH, b.maxH);
      renderObject(); settle();
    });
  });
  function move(e) {
    const a = state.active;
    if (!a || a.id !== e.pointerId) return;
    const p = pointFromEvent(e);
    const dx = p.x - a.x, dy = p.y - a.y;
    a.x = p.x; a.y = p.y;
    const totalX = p.x - a.startX, totalY = p.y - a.startY;
    if (Math.hypot(totalX, totalY) > 5) a.moved = true;
    if (a.kind === 'press' && a.moved) {
      object.classList.remove('is-pressing'); object.classList.add('is-dragging');
      a.kind = 'drag'; status.textContent = 'Dragging · Field responding';
    }
    if (a.kind === 'drag') {
      const oldX = state.x, oldY = state.y;
      const targetX = a.initial.x + totalX, targetY = a.initial.y + totalY;
      const rubber = (v, low, high) => v < low ? low + (v - low) * .32 : v > high ? high + (v - high) * .32 : v;
      state.x = rubber(targetX, margin, width - state.w - margin);
      state.y = rubber(targetY, margin, height - state.h - margin);
      limitPosition(); renderObject();
      influence(p.x, p.y, state.x - oldX, state.y - oldY, 1.6);
    } else if (a.kind === 'resize') {
      const b = bounds(), i = a.initial;
      const left = a.corner.includes('w'), top = a.corner.includes('n');
      const desiredW = i.w + totalX * (left ? -1 : 1);
      const desiredH = i.h + totalY * (top ? -1 : 1);
      state.w = clamp(desiredW, b.minW, b.maxW);
      state.h = clamp(desiredH, b.minH, b.maxH);
      state.x = i.x + (left ? i.w - state.w : 0);
      state.y = i.y + (top ? i.h - state.h : 0);
      limitPosition(); renderObject();
      influence(p.x, p.y, dx, dy, 2);
    }
  }
  function finish(e) {
    const a = state.active;
    if (!a || a.id !== e.pointerId) return;
    if (a.kind === 'press' && !a.moved) {
      status.textContent = 'Activated · Soft press feedback';
      influence(a.x, a.y, 0, -9, 3);
    }
    state.active = null;
    object.classList.remove('is-pressing','is-dragging');
    settle();
  }
  object.addEventListener('pointermove', move);
  object.addEventListener('pointerup', finish);
  object.addEventListener('pointercancel', finish);
  button.addEventListener('click', e => {
    // Native keyboard activation remains available.
    if (e.detail === 0) { object.classList.add('is-pressing'); setTimeout(() => object.classList.remove('is-pressing'), 160); status.textContent = 'Activated with keyboard'; }
  });
  button.addEventListener('keydown', e => {
    if (!e.altKey || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return;
    e.preventDefault(); const step = e.shiftKey ? 20 : 8;
    if (e.key === 'ArrowLeft') state.x -= step;
    if (e.key === 'ArrowRight') state.x += step;
    if (e.key === 'ArrowUp') state.y -= step;
    if (e.key === 'ArrowDown') state.y += step;
    renderObject(); settle();
  });
  fieldToggle.addEventListener('change', () => { root.toggleAttribute('data-field-hidden', !fieldToggle.checked); });
  depthInput.addEventListener('input', () => { settings.depth = Number(depthInput.value) / 100; depthOutput.textContent = `${depthInput.value}%`; });
  function applyMotion() { root.toggleAttribute('data-reduced-motion', settings.reduced); }
  motionToggle.checked = settings.reduced; applyMotion();
  motionToggle.addEventListener('change', () => { settings.reduced = motionToggle.checked; applyMotion(); });
  resetButton.addEventListener('click', () => {
    if (state.settle) cancelAnimationFrame(state.settle);
    state.w = width < 600 ? 160 : 190; state.h = width < 600 ? 74 : 86;
    state.x = (width - state.w) / 2; state.y = (height - state.h) / 2;
    for (const p of points) { p.x = p.ox; p.y = p.oy; p.vx = p.vy = 0; }
    renderObject(); status.textContent = 'Reset to resting position';
  });
  rebuild();
  new ResizeObserver(rebuild).observe(stage);
  raf = requestAnimationFrame(animate);
}
