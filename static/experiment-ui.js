/**
 * experiment-ui.js — Shared UI components for chapter experiments.
 *
 * Provides reusable rendering primitives: coordinate grids, physics beams,
 * drag handlers, tweening, and toast notifications.
 *
 * Security note: all innerHTML usage is with our own code-generated strings only.
 */

// ── GridCanvas ────────────────────────────────────────────────────────────────
// 2D coordinate grid on HTML5 Canvas. DPR-aware. Used by Ch 2, 3, 4, 5.

export class GridCanvas {
  constructor(canvasEl, opts = {}) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.range = opts.range || [-6, 6]; // [min, max] for both axes
    this.showGrid = opts.showGrid !== false;
    this.gridColor = opts.gridColor || 'rgba(255,255,255,0.06)';
    this.axisColor = opts.axisColor || 'rgba(255,255,255,0.25)';
    this.labelColor = opts.labelColor || 'rgba(255,255,255,0.35)';
    this.dpr = 0;
    this.w = 0;
    this.h = 0;
    this._dragCb = null;
    this._dragEndCb = null;
    this._pointerDown = false;

    this._resize();
    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(canvasEl);

    // Pointer events for drag
    canvasEl.style.touchAction = 'none';
    canvasEl.style.userSelect = 'none';
    canvasEl.style.webkitUserSelect = 'none';
    this._onDown = this._onDown.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onUp = this._onUp.bind(this);
    canvasEl.addEventListener('pointerdown', this._onDown);
    canvasEl.addEventListener('pointermove', this._onMove);
    canvasEl.addEventListener('pointerup', this._onUp);
    canvasEl.addEventListener('pointercancel', this._onUp);
  }

  destroy() {
    this._ro.disconnect();
    this.canvas.removeEventListener('pointerdown', this._onDown);
    this.canvas.removeEventListener('pointermove', this._onMove);
    this.canvas.removeEventListener('pointerup', this._onUp);
    this.canvas.removeEventListener('pointercancel', this._onUp);
  }

  // ── Sizing (DPR-aware, same pattern as canvas.js) ──

  _resize() {
    const w = this.canvas.offsetWidth;
    const h = this.canvas.offsetHeight;
    if (w === 0 || h === 0) return;
    const d = window.devicePixelRatio || 1;
    if (w === this.w && h === this.h && d === this.dpr) return;
    this.dpr = d;
    this.w = w;
    this.h = h;
    this.canvas.width = Math.round(w * d);
    this.canvas.height = Math.round(h * d);
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
  }

  // ── Coordinate transforms ──

  /** Size of one grid unit in CSS pixels */
  get unitPx() {
    const span = this.range[1] - this.range[0];
    return Math.min(this.w, this.h) / span;
  }

  /** World (math) coords → screen (CSS pixel) coords */
  worldToScreen(wx, wy) {
    const u = this.unitPx;
    const cx = this.w / 2;
    const cy = this.h / 2;
    return [cx + wx * u, cy - wy * u];
  }

  /** Screen (CSS pixel) coords → world (math) coords */
  screenToWorld(sx, sy) {
    const u = this.unitPx;
    const cx = this.w / 2;
    const cy = this.h / 2;
    return [(sx - cx) / u, (cy - sy) / u];
  }

  // ── Drag interaction ──

  onDrag(callback, onEnd) {
    this._dragCb = callback;
    this._dragEndCb = onEnd || null;
  }

  _onDown(e) {
    this._pointerDown = true;
    this.canvas.setPointerCapture(e.pointerId);
    if (this._dragCb) {
      const rect = this.canvas.getBoundingClientRect();
      const [wx, wy] = this.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      this._dragCb(wx, wy, 'start');
    }
  }

  _onMove(e) {
    if (!this._pointerDown || !this._dragCb) return;
    const rect = this.canvas.getBoundingClientRect();
    const [wx, wy] = this.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    this._dragCb(wx, wy, 'move');
  }

  _onUp(e) {
    if (!this._pointerDown) return;
    this._pointerDown = false;
    if (this._dragEndCb) this._dragEndCb();
  }

  // ── Drawing primitives ──

  clear() {
    this.ctx.clearRect(0, 0, this.w, this.h);
  }

  drawGrid() {
    const ctx = this.ctx;
    const [lo, hi] = this.range;

    // Grid lines
    if (this.showGrid) {
      ctx.strokeStyle = this.gridColor;
      ctx.lineWidth = 1;
      for (let i = lo; i <= hi; i++) {
        if (i === 0) continue;
        const [sx] = this.worldToScreen(i, 0);
        const [, sy] = this.worldToScreen(0, i);
        ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, this.h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(this.w, sy); ctx.stroke();
      }
    }

    // Axes
    ctx.strokeStyle = this.axisColor;
    ctx.lineWidth = 1.5;
    const [ox, oy] = this.worldToScreen(0, 0);
    ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(this.w, oy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, this.h); ctx.stroke();

    // Labels
    ctx.fillStyle = this.labelColor;
    ctx.font = '11px "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = lo; i <= hi; i++) {
      if (i === 0) continue;
      const [sx] = this.worldToScreen(i, 0);
      ctx.fillText(i, sx, oy + 4);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = lo; i <= hi; i++) {
      if (i === 0) continue;
      const [, sy] = this.worldToScreen(0, i);
      ctx.fillText(i, ox - 6, sy);
    }
  }

  drawVector(from, to, color = '#fff', label = '', lineWidth = 2.5) {
    const ctx = this.ctx;
    const [x1, y1] = this.worldToScreen(from[0], from[1]);
    const [x2, y2] = this.worldToScreen(to[0], to[1]);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const len = Math.hypot(x2 - x1, y2 - y1);
    if (len < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Arrowhead
    const hs = Math.min(14, len * 0.3);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - hs * Math.cos(angle - 0.4), y2 - hs * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - hs * Math.cos(angle + 0.4), y2 - hs * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();

    // Label
    if (label) {
      ctx.fillStyle = color;
      ctx.font = '13px "Fira Code", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      ctx.fillText(label, mx + 8, my - 6);
    }
  }

  drawCircle(cx, cy, r, color = '#fff', dashed = false) {
    const ctx = this.ctx;
    const [sx, sy] = this.worldToScreen(cx, cy);
    const rPx = r * this.unitPx;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    if (dashed) ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(sx, sy, rPx, 0, Math.PI * 2);
    ctx.stroke();
    if (dashed) ctx.setLineDash([]);
  }

  drawPoint(x, y, color = '#fff', radius = 5, label = '') {
    const ctx = this.ctx;
    const [sx, sy] = this.worldToScreen(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fill();
    if (label) {
      ctx.font = '12px "Fira Code", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(label, sx + radius + 4, sy - 4);
    }
  }

  /** Draw a dashed line segment in world coords */
  drawDashedLine(from, to, color = 'rgba(255,255,255,0.2)', dash = [4, 4]) {
    const ctx = this.ctx;
    const [x1, y1] = this.worldToScreen(from[0], from[1]);
    const [x2, y2] = this.worldToScreen(to[0], to[1]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}


// ── PhysicsBeam ───────────────────────────────────────────────────────────────
// Balance beam renderer for Ch 1 — Equation Balancer.

export class PhysicsBeam {
  constructor(canvasEl, opts = {}) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.beamColor = opts.beamColor || '#8B9EA7';
    this.fulcrumColor = opts.fulcrumColor || '#58CC02';
    this.tilt = 0; // radians, positive = right side down
    this.dpr = 0;
    this.w = 0;
    this.h = 0;
    this._animId = null;

    this._resize();
    this._ro = new ResizeObserver(() => { this._resize(); this.render(); });
    this._ro.observe(canvasEl);
  }

  destroy() {
    this._ro.disconnect();
    if (this._animId) cancelAnimationFrame(this._animId);
  }

  _resize() {
    const w = this.canvas.offsetWidth;
    const h = this.canvas.offsetHeight;
    if (w === 0 || h === 0) return;
    const d = window.devicePixelRatio || 1;
    if (w === this.w && h === this.h && d === this.dpr) return;
    this.dpr = d;
    this.w = w;
    this.h = h;
    this.canvas.width = Math.round(w * d);
    this.canvas.height = Math.round(h * d);
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
  }

  /** Render beam at current tilt angle, with optional block labels */
  render(leftLabel = '', rightLabel = '', leftColor = '#1CB0F6', rightColor = '#FF9600') {
    const ctx = this.ctx;
    const cx = this.w / 2;
    const cy = this.h * 0.65;
    const beamLen = this.w * 0.75;
    const beamH = 10;
    const fulcrumH = this.h * 0.22;

    ctx.clearRect(0, 0, this.w, this.h);

    // Fulcrum triangle
    ctx.fillStyle = this.fulcrumColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - 24, cy + fulcrumH);
    ctx.lineTo(cx + 24, cy + fulcrumH);
    ctx.closePath();
    ctx.fill();

    // Beam (rotated)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.tilt);

    // Beam bar
    ctx.fillStyle = this.beamColor;
    const r = 5;
    const bx = -beamLen / 2;
    const by = -beamH / 2;
    ctx.beginPath();
    ctx.roundRect(bx, by, beamLen, beamH, r);
    ctx.fill();

    // Left block
    if (leftLabel) {
      const bw = Math.min(120, leftLabel.length * 14 + 24);
      const bh = 44;
      const lx = -beamLen / 2 + 20;
      const ly = -beamH / 2 - bh - 4;
      ctx.fillStyle = leftColor;
      ctx.beginPath();
      ctx.roundRect(lx, ly, bw, bh, 8);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '700 18px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(leftLabel, lx + bw / 2, ly + bh / 2);
    }

    // Right block
    if (rightLabel) {
      const bw = Math.min(120, rightLabel.length * 14 + 24);
      const bh = 44;
      const rx = beamLen / 2 - 20 - bw;
      const ry = -beamH / 2 - bh - 4;
      ctx.fillStyle = rightColor;
      ctx.beginPath();
      ctx.roundRect(rx, ry, bw, bh, 8);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '700 18px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rightLabel, rx + bw / 2, ry + bh / 2);
    }

    ctx.restore();
  }

  /** Animate tilt to target angle over duration ms */
  animateTilt(targetAngle, duration = 600) {
    return new Promise(resolve => {
      if (this._animId) cancelAnimationFrame(this._animId);
      const start = this.tilt;
      const diff = targetAngle - start;
      const t0 = performance.now();
      const step = (now) => {
        const elapsed = now - t0;
        const p = Math.min(1, elapsed / duration);
        // Ease out cubic
        const ease = 1 - Math.pow(1 - p, 3);
        this.tilt = start + diff * ease;
        this.render(this._leftLabel, this._rightLabel, this._leftColor, this._rightColor);
        if (p < 1) {
          this._animId = requestAnimationFrame(step);
        } else {
          this._animId = null;
          resolve();
        }
      };
      this._animId = requestAnimationFrame(step);
    });
  }

  /** Set labels for animation rendering */
  setLabels(left, right, leftColor, rightColor) {
    this._leftLabel = left;
    this._rightLabel = right;
    this._leftColor = leftColor || '#1CB0F6';
    this._rightColor = rightColor || '#FF9600';
  }
}


// ── Utility: createDragHandler ────────────────────────────────────────────────

export function createDragHandler(element, { onStart, onMove, onEnd }) {
  element.style.touchAction = 'none';
  let active = false;

  function down(e) {
    active = true;
    element.setPointerCapture(e.pointerId);
    if (onStart) onStart(e.clientX, e.clientY, e);
  }
  function move(e) {
    if (!active) return;
    if (onMove) onMove(e.clientX, e.clientY, e);
  }
  function up(e) {
    if (!active) return;
    active = false;
    if (onEnd) onEnd(e.clientX, e.clientY, e);
  }

  element.addEventListener('pointerdown', down);
  element.addEventListener('pointermove', move);
  element.addEventListener('pointerup', up);
  element.addEventListener('pointercancel', up);

  return () => {
    element.removeEventListener('pointerdown', down);
    element.removeEventListener('pointermove', move);
    element.removeEventListener('pointerup', up);
    element.removeEventListener('pointercancel', up);
  };
}


// ── Utility: animateValue ─────────────────────────────────────────────────────

export function animateValue(from, to, duration, onUpdate, onDone) {
  const t0 = performance.now();
  let id;
  function step(now) {
    const p = Math.min(1, (now - t0) / duration);
    const ease = 1 - Math.pow(1 - p, 3); // ease-out cubic
    onUpdate(from + (to - from) * ease);
    if (p < 1) {
      id = requestAnimationFrame(step);
    } else if (onDone) {
      onDone();
    }
  }
  id = requestAnimationFrame(step);
  return () => cancelAnimationFrame(id);
}


// ── Utility: showToast ────────────────────────────────────────────────────────

export function showToast(container, message, type = 'info') {
  // Remove existing toast
  const old = container.querySelector('.experiment-toast');
  if (old) old.remove();

  const el = document.createElement('div');
  el.className = `experiment-toast ${type}`;
  el.textContent = message;
  container.appendChild(el);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => el.classList.add('visible'));
  });

  setTimeout(() => {
    el.classList.remove('visible');
    setTimeout(() => el.remove(), 300);
  }, 1800);
}
