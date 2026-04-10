/**
 * CanvasManager — Apple Pencil / pointer-events drawing engine.
 *
 * Features:
 *  - Bézier smoothing (quadratic midpoint interpolation)
 *  - Pressure-sensitive line width via event.pressure
 *  - Stroke storage as arrays of points (enables proper undo)
 *  - Per-segment beginPath/stroke on redraw (pressure visible after undo)
 *  - setTransform instead of scale() to prevent cumulative DPR stacking
 *  - ResizeObserver for responsive canvas sizing
 */
export class CanvasManager {
  constructor(canvasEl) {
    this.canvas  = canvasEl;
    this.ctx     = canvasEl.getContext('2d');
    this.strokes = [];       // [{color, pts:[{x,y,p}]}]
    this.current = null;     // stroke in progress
    this.tool    = 'pen';    // 'pen' | 'eraser'
    this.color   = '#2C2C2C';
    this.minW    = 1.5;
    this.maxW    = 5;
    this._resize();
    this._bind();
  }

  /** Resize canvas to match CSS layout size, correcting for DPR. */
  _resize() {
    const r = this.canvas.getBoundingClientRect();
    const d = window.devicePixelRatio || 1;
    this.canvas.width  = Math.round(r.width  * d);
    this.canvas.height = Math.round(r.height * d);
    // setTransform instead of scale() — assigning .width resets the transform
    // matrix to identity, so we must re-apply it. Using setTransform(d,0,0,d,0,0)
    // sets it exactly once and never accumulates across multiple resize calls.
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
    this._redraw();
  }

  _bind() {
    const el = this.canvas;
    el.addEventListener('pointerdown',   e => this._down(e), { passive: false });
    el.addEventListener('pointermove',   e => this._move(e), { passive: false });
    el.addEventListener('pointerup',     e => this._up(e));
    el.addEventListener('pointercancel', e => this._up(e));
    el.addEventListener('contextmenu',   e => e.preventDefault());

    const ro = new ResizeObserver(() => this._resize());
    ro.observe(this.canvas);
  }

  _pt(e) {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - r.left,
      y: e.clientY - r.top,
      p: e.pressure ?? 0.5,
    };
  }

  _down(e) {
    e.preventDefault();
    if (!e.isPrimary) return;
    this.canvas.setPointerCapture(e.pointerId);
    this.current = {
      color: this.tool === 'eraser' ? null : this.color,
      pts: [this._pt(e)],
    };
  }

  _move(e) {
    e.preventDefault();
    if (!this.current) return;
    const pt = this._pt(e);
    this.current.pts.push(pt);
    this._drawLive(this.current);
  }

  _up() {
    if (!this.current) return;
    if (this.current.pts.length > 1) {
      if (this.tool === 'eraser') {
        this._erase(this.current.pts);
      } else {
        this.strokes.push(this.current);
      }
    }
    this.current = null;
  }

  /** Draw only the newest segment during live input (fast path). */
  _drawLive(stroke) {
    const pts = stroke.pts;
    if (pts.length < 2) return;
    const ctx  = this.ctx;
    const prev = pts[pts.length - 2];
    const curr = pts[pts.length - 1];

    ctx.strokeStyle = stroke.color;
    ctx.lineWidth   = this.minW + curr.p * (this.maxW - this.minW);
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.beginPath();

    if (pts.length === 2) {
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
    } else {
      const p2      = pts[pts.length - 3];
      const midPrev = { x: (p2.x + prev.x) / 2, y: (p2.y + prev.y) / 2 };
      const midCurr = { x: (prev.x + curr.x) / 2, y: (prev.y + curr.y) / 2 };
      ctx.moveTo(midPrev.x, midPrev.y);
      ctx.quadraticCurveTo(prev.x, prev.y, midCurr.x, midCurr.y);
    }
    ctx.stroke();
  }

  /** Remove strokes that intersect the eraser path. */
  _erase(pts) {
    const R = 22;
    this.strokes = this.strokes.filter(s =>
      !s.pts.some(sp =>
        pts.some(ep => Math.hypot(sp.x - ep.x, sp.y - ep.y) < R)
      )
    );
    this._redraw();
  }

  /** Full redraw — clears canvas and repaints all stored strokes. */
  _redraw() {
    const { width, height } = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, width, height);
    for (const s of this.strokes) this._drawFull(s);
  }

  /**
   * Draw a complete stored stroke with per-segment pressure.
   *
   * Each segment gets its own beginPath/stroke cycle so that lineWidth
   * takes effect per segment. A single path with mid-path lineWidth changes
   * only uses the last value when stroke() is called — making undo/redraw
   * look flat compared to live drawing.
   */
  _drawFull(stroke) {
    const pts = stroke.pts;
    if (pts.length < 2) return;
    const ctx = this.ctx;
    ctx.strokeStyle = stroke.color;
    ctx.lineCap = ctx.lineJoin = 'round';

    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      ctx.lineWidth = this.minW + curr.p * (this.maxW - this.minW);
      ctx.beginPath();

      if (i === 1) {
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
      } else {
        const p2      = pts[i - 2];
        const midPrev = { x: (p2.x + prev.x) / 2, y: (p2.y + prev.y) / 2 };
        const midCurr = { x: (prev.x + curr.x) / 2, y: (prev.y + curr.y) / 2 };
        ctx.moveTo(midPrev.x, midPrev.y);
        ctx.quadraticCurveTo(prev.x, prev.y, midCurr.x, midCurr.y);
      }
      ctx.stroke();
    }
  }

  // ── Public API ──

  setTool(t) { this.tool = t; }

  setColor(c) {
    this.color = c;
    this.tool  = 'pen';
  }

  undo() {
    if (this.strokes.length > 0) {
      this.strokes.pop();
      this._redraw();
    }
  }

  clear() {
    this.strokes = [];
    this._redraw();
  }

  isBlank() {
    return this.strokes.length === 0;
  }

  /**
   * Export the canvas as a base64 PNG data URL.
   * Composites onto a cream background so the image is legible.
   */
  getImageBase64() {
    const tmp  = document.createElement('canvas');
    tmp.width  = this.canvas.width;
    tmp.height = this.canvas.height;
    const tc   = tmp.getContext('2d');
    tc.fillStyle = '#FFFBF0';
    tc.fillRect(0, 0, tmp.width, tmp.height);
    tc.drawImage(this.canvas, 0, 0);
    return tmp.toDataURL('image/png');
  }
}
