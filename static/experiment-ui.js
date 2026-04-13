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
    this._onResizeCb = null;

    this._resize();
    this._ro = new ResizeObserver(() => { this._resize(); if (this._onResizeCb) this._onResizeCb(); });
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

  // ── Resize callback (fires when canvas gets real dimensions) ──

  onResize(callback) { this._onResizeCb = callback; }

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

  /** Draw an arc in world coords (angles in radians, math convention) */
  drawArc(cx, cy, r, startAngle, endAngle, color = '#fff', lineWidth = 1.5) {
    const ctx = this.ctx;
    const [sx, sy] = this.worldToScreen(cx, cy);
    const rPx = r * this.unitPx;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    // Negate angles for canvas Y-flip, swap order and use counterclockwise
    ctx.arc(sx, sy, rPx, -startAngle, -endAngle, true);
    ctx.stroke();
  }

  /** Draw a closed polygon from world-coord points */
  drawPolygon(points, strokeColor = null, fillColor = null, lineWidth = 2) {
    if (points.length < 2) return;
    const ctx = this.ctx;
    ctx.beginPath();
    const [x0, y0] = this.worldToScreen(points[0][0], points[0][1]);
    ctx.moveTo(x0, y0);
    for (let i = 1; i < points.length; i++) {
      const [x, y] = this.worldToScreen(points[i][0], points[i][1]);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    if (fillColor) { ctx.fillStyle = fillColor; ctx.fill(); }
    if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = lineWidth; ctx.stroke(); }
  }

  /** Draw axis labels (e.g. "Re"/"Im" for complex plane) */
  drawAxisLabels(xLabel, yLabel, color = 'rgba(255,255,255,0.5)') {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.font = '13px "Fira Code", monospace';
    // x-axis label near right end
    const [rx, ry] = this.worldToScreen(this.range[1] - 0.3, 0);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(xLabel, rx, ry + 8);
    // y-axis label near top
    const [tx, ty] = this.worldToScreen(0, this.range[1] - 0.3);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(yLabel, tx + 8, ty);
  }
}


// ── BlochSphere ──────────────────────────────────────────────────────────────
// 2D projected Bloch sphere renderer. DPR-aware, animated, reusable.
// Used by Ch 7 (Gate Lab), Ch 8 (Coin Toss), Ch 9, 10, 12.

export class BlochSphere {
  constructor(canvasEl, opts = {}) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.color = opts.color || '#00C9A7';
    this.showLabels = opts.showLabels !== false;
    this._theta = 0;  // 0 = |0⟩ (north pole)
    this._phi = 0;
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

  getState() { return { theta: this._theta, phi: this._phi }; }

  setState(theta, phi) {
    this._theta = theta;
    this._phi = phi;
    this.render();
  }

  animateState(theta, phi, duration = 400) {
    return new Promise(resolve => {
      if (this._animId) cancelAnimationFrame(this._animId);
      const t0theta = this._theta;
      const t0phi = this._phi;
      const dTheta = theta - t0theta;
      // Shortest-arc phi interpolation
      let dPhi = phi - t0phi;
      while (dPhi > Math.PI) dPhi -= 2 * Math.PI;
      while (dPhi < -Math.PI) dPhi += 2 * Math.PI;
      const startTime = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - startTime) / duration);
        const ease = 1 - Math.pow(1 - p, 3);
        this._theta = t0theta + dTheta * ease;
        this._phi = t0phi + dPhi * ease;
        this.render();
        if (p < 1) {
          this._animId = requestAnimationFrame(step);
        } else {
          this._theta = theta;
          this._phi = phi;
          this._animId = null;
          this.render();
          resolve();
        }
      };
      this._animId = requestAnimationFrame(step);
    });
  }

  // Project 3D Bloch point to 2D screen coords
  _project(x, y, z) {
    const r = Math.min(this.w, this.h) * 0.38;
    const cx = this.w / 2;
    const cy = this.h / 2;
    // Oblique projection: Y axis goes into screen at an angle
    const foreshorten = 0.35;
    const angle = -0.5;
    const sx = cx + r * (x + y * foreshorten * Math.cos(angle));
    const sy = cy - r * (z + y * foreshorten * Math.sin(angle));
    return [sx, sy];
  }

  render() {
    const ctx = this.ctx;
    const r = Math.min(this.w, this.h) * 0.38;
    const cx = this.w / 2;
    const cy = this.h / 2;

    ctx.clearRect(0, 0, this.w, this.h);

    // Sphere outline
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Equator ellipse (foreshortened)
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.35, -0.15, 0, Math.PI * 2);
    ctx.stroke();

    // Axes (dashed)
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;

    // Z-axis (vertical)
    ctx.beginPath();
    ctx.moveTo(cx, cy - r - 8);
    ctx.lineTo(cx, cy + r + 8);
    ctx.stroke();

    // X-axis (horizontal through equator)
    const [xp, xpy] = this._project(1, 0, 0);
    const [xn, xny] = this._project(-1, 0, 0);
    ctx.beginPath();
    ctx.moveTo(xn, xny);
    ctx.lineTo(xp, xpy);
    ctx.stroke();

    // Y-axis
    const [yp, ypy] = this._project(0, 1, 0);
    const [yn, yny] = this._project(0, -1, 0);
    ctx.beginPath();
    ctx.moveTo(yn, yny);
    ctx.lineTo(yp, ypy);
    ctx.stroke();

    ctx.setLineDash([]);

    // Labels
    if (this.showLabels) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '13px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('|0⟩', cx, cy - r - 10);
      ctx.textBaseline = 'top';
      ctx.fillText('|1⟩', cx, cy + r + 10);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('|+⟩', xp + 8, xpy);
      ctx.textAlign = 'right';
      ctx.fillText('|−⟩', xn - 8, xny);
    }

    // State arrow
    const sx = Math.sin(this._theta) * Math.cos(this._phi);
    const sy = Math.sin(this._theta) * Math.sin(this._phi);
    const sz = Math.cos(this._theta);
    const [ax, ay] = this._project(sx, sy, sz);

    // Arrow line
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(ax, ay);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(ay - cy, ax - cx);
    const hs = 10;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax - hs * Math.cos(angle - 0.4), ay - hs * Math.sin(angle - 0.4));
    ctx.lineTo(ax - hs * Math.cos(angle + 0.4), ay - hs * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();

    // State dot
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(ax, ay, 5, 0, Math.PI * 2);
    ctx.fill();

    // Origin dot
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}


// ── HistogramRenderer ────────────────────────────────────────────────────────
// DOM-based animated bar chart. Used by Ch 8, 10, 17, 18.

export class HistogramRenderer {
  constructor(containerEl, opts = {}) {
    this.container = containerEl;
    this.labels = opts.labels || ['|0⟩', '|1⟩'];
    this.colors = opts.colors || ['#1CB0F6', '#FF9600'];
    this.barHeight = opts.height || 120;

    // Build DOM
    this.el = document.createElement('div');
    this.el.style.cssText = `display:flex;align-items:flex-end;justify-content:center;gap:12px;width:100%;`;
    this._bars = [];
    this._values = [];
    this._expected = [];

    this.labels.forEach((label, i) => {
      const group = document.createElement('div');
      group.style.cssText = 'display:flex;flex-direction:column;align-items:center;flex:1;max-width:80px;';

      const valEl = document.createElement('div');
      valEl.style.cssText = "font-family:'Fira Code',monospace;font-size:12px;color:var(--text-muted);height:18px;";
      valEl.textContent = '0';

      const barWrap = document.createElement('div');
      barWrap.style.cssText = `position:relative;width:100%;height:${this.barHeight}px;background:var(--surface);border:1px solid var(--border);border-radius:6px;overflow:hidden;`;

      const bar = document.createElement('div');
      const color = Array.isArray(this.colors) ? (this.colors[i] || this.colors[0]) : this.colors;
      bar.style.cssText = `position:absolute;bottom:0;left:0;right:0;height:0%;background:${color};border-radius:0 0 5px 5px;transition:height 0.3s ease;opacity:0.85;`;

      const exp = document.createElement('div');
      exp.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:0%;border-top:2px dashed rgba(255,255,255,0.3);transition:height 0.3s ease;pointer-events:none;';

      barWrap.append(bar, exp);

      const labelEl = document.createElement('div');
      labelEl.style.cssText = "font-family:'Fira Code',monospace;font-size:13px;color:var(--text);font-weight:700;margin-top:4px;";
      labelEl.textContent = label;

      group.append(valEl, barWrap, labelEl);
      this.el.appendChild(group);
      this._bars.push(bar);
      this._values.push(valEl);
      this._expected.push(exp);
    });

    containerEl.appendChild(this.el);
  }

  setData(values) {
    values.forEach((v, i) => {
      if (i < this._bars.length) {
        this._bars[i].style.height = `${(v * 100).toFixed(1)}%`;
        this._values[i].textContent = v >= 0.01 ? v.toFixed(2) : v > 0 ? '<.01' : '0';
      }
    });
  }

  setExpected(values) {
    values.forEach((v, i) => {
      if (i < this._expected.length) {
        this._expected[i].style.height = `${(v * 100).toFixed(1)}%`;
      }
    });
  }

  reset() {
    this._bars.forEach(b => b.style.height = '0%');
    this._values.forEach(v => v.textContent = '0');
    this._expected.forEach(e => e.style.height = '0%');
  }

  destroy() {
    this.el.remove();
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


// ── CircuitSimulator ────────────────────────────────────────────────────────
// 1-2 qubit quantum circuit simulator. Used by Ch 10, 11, 14, 15.
// Qubit ordering: qubit 0 = MSB. Index 0b10 = q0=|1⟩, q1=|0⟩.

export class CircuitSimulator {
  constructor(numQubits = 1) {
    this.numQubits = numQubits;
    this.dim = 1 << numQubits;
    this.state = [];
    this.gates = [];
    // Single-qubit gate matrices (2x2 flat: [a,b,c,d])
    const S = 1 / Math.sqrt(2);
    this.GATES = {
      X: [{re:0,im:0},{re:1,im:0},{re:1,im:0},{re:0,im:0}],
      Y: [{re:0,im:0},{re:0,im:-1},{re:0,im:1},{re:0,im:0}],
      Z: [{re:1,im:0},{re:0,im:0},{re:0,im:0},{re:-1,im:0}],
      H: [{re:S,im:0},{re:S,im:0},{re:S,im:0},{re:-S,im:0}],
      S: [{re:1,im:0},{re:0,im:0},{re:0,im:0},{re:0,im:1}],
      T: [{re:1,im:0},{re:0,im:0},{re:0,im:0},{re:Math.cos(Math.PI/4),im:Math.sin(Math.PI/4)}],
    };
    this.reset();
  }

  reset() {
    this.state = Array.from({length: this.dim}, (_, i) =>
      i === 0 ? {re:1,im:0} : {re:0,im:0}
    );
    this.gates = [];
  }

  setState(vec) { this.state = vec.map(c => ({re:c.re, im:c.im})); }
  getState() { return this.state.map(c => ({re:c.re, im:c.im})); }

  probabilities() {
    return this.state.map(c => c.re * c.re + c.im * c.im);
  }

  addGate(name, qubit, control = null) {
    this.gates.push({name, qubit, control});
  }

  clearCircuit() { this.gates = []; }

  run() {
    this.state = Array.from({length: this.dim}, (_, i) =>
      i === 0 ? {re:1,im:0} : {re:0,im:0}
    );
    for (const g of this.gates) {
      this.applyGate(g.name, g.qubit, g.control);
    }
  }

  applyGate(name, qubit, control = null) {
    if (control !== null) {
      this._applyControlled(name, control, qubit);
    } else if (this.numQubits === 1) {
      const gate = this.GATES[name];
      const [a, b] = [this.state[0], this.state[1]];
      this.state[0] = this._cadd(this._cmul(gate[0], a), this._cmul(gate[1], b));
      this.state[1] = this._cadd(this._cmul(gate[2], a), this._cmul(gate[3], b));
    } else {
      this._applySingleOn2Q(name, qubit);
    }
  }

  measure() {
    const probs = this.probabilities();
    const r = Math.random();
    let cum = 0, result = probs.length - 1;
    for (let i = 0; i < probs.length; i++) {
      cum += probs[i];
      if (r < cum) { result = i; break; }
    }
    const norm = Math.sqrt(probs[result]);
    this.state = this.state.map((c, i) =>
      i === result ? {re: c.re / norm, im: c.im / norm} : {re:0, im:0}
    );
    return result;
  }

  measureQubit(qubit) {
    let p0 = 0;
    for (let i = 0; i < this.dim; i++) {
      const bit = (i >> (this.numQubits - 1 - qubit)) & 1;
      if (bit === 0) p0 += this.state[i].re * this.state[i].re + this.state[i].im * this.state[i].im;
    }
    const result = Math.random() < p0 ? 0 : 1;
    let norm2 = 0;
    for (let i = 0; i < this.dim; i++) {
      const bit = (i >> (this.numQubits - 1 - qubit)) & 1;
      if (bit !== result) {
        this.state[i] = {re:0, im:0};
      } else {
        norm2 += this.state[i].re * this.state[i].re + this.state[i].im * this.state[i].im;
      }
    }
    const norm = Math.sqrt(norm2);
    if (norm > 1e-12) {
      for (let i = 0; i < this.dim; i++) {
        this.state[i].re /= norm;
        this.state[i].im /= norm;
      }
    }
    return result;
  }

  _applySingleOn2Q(name, qubit) {
    const gate = this.GATES[name];
    const newState = this.state.map(c => ({re:c.re, im:c.im}));
    const shift = this.numQubits - 1 - qubit;
    for (let i = 0; i < this.dim; i++) {
      if (((i >> shift) & 1) !== 0) continue;
      const j = i | (1 << shift);
      newState[i] = this._cadd(this._cmul(gate[0], this.state[i]), this._cmul(gate[1], this.state[j]));
      newState[j] = this._cadd(this._cmul(gate[2], this.state[i]), this._cmul(gate[3], this.state[j]));
    }
    this.state = newState;
  }

  _applyControlled(name, control, target) {
    const gate = this.GATES[name];
    const newState = this.state.map(c => ({re:c.re, im:c.im}));
    const cShift = this.numQubits - 1 - control;
    const tShift = this.numQubits - 1 - target;
    for (let i = 0; i < this.dim; i++) {
      if (((i >> cShift) & 1) !== 1) continue;
      if (((i >> tShift) & 1) !== 0) continue;
      const j = i | (1 << tShift);
      newState[i] = this._cadd(this._cmul(gate[0], this.state[i]), this._cmul(gate[1], this.state[j]));
      newState[j] = this._cadd(this._cmul(gate[2], this.state[i]), this._cmul(gate[3], this.state[j]));
    }
    this.state = newState;
  }

  _cmul(a, b) { return {re: a.re*b.re - a.im*b.im, im: a.re*b.im + a.im*b.re}; }
  _cadd(a, b) { return {re: a.re+b.re, im: a.im+b.im}; }

  destroy() {}
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
