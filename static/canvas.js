export class CanvasManager {
  constructor(canvasEl) {
    this.canvas  = canvasEl;
    this.ctx     = canvasEl.getContext('2d');
    this.strokes = [];
    this.current = null;
    this.activeId = null;
    this.tool    = 'pen';
    this.color   = '#2C2C2C';
    this.minW    = 1.5;
    this.maxW    = 5;
    this.dpr     = 0;
    this.w       = 0;
    this.h       = 0;
    this._hasPen = false;
    this._resizePending = false;
    this._bind();
    this._resize();
  }

  /* ── Sizing ─────────────────────────────────────────────────────── */

  _resize() {
    if (this.current) { this._resizePending = true; return; }

    const w = this.canvas.offsetWidth;
    const h = this.canvas.offsetHeight;
    if (w === 0 || h === 0) return;

    const d = window.devicePixelRatio || 1;
    if (w === this.w && h === this.h && d === this.dpr) return;

    this.dpr = d;
    this.w   = w;
    this.h   = h;
    this.canvas.width  = Math.round(w * d);
    this.canvas.height = Math.round(h * d);
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
    this._redraw();
  }

  /* ── Events ─────────────────────────────────────────────────────── */

  _bind() {
    const el = this.canvas;
    el.style.touchAction      = 'none';
    el.style.userSelect       = 'none';
    el.style.webkitUserSelect = 'none';

    const opt = { passive: false };
    el.addEventListener('pointerdown',   e => this._down(e),  opt);
    el.addEventListener('pointermove',   e => this._move(e),  opt);
    el.addEventListener('pointerup',     e => this._up(e),    opt);
    el.addEventListener('pointercancel', e => this._up(e),    opt);
    el.addEventListener('contextmenu',   e => e.preventDefault());

    // Kill all touch events — iOS Safari ignores touch-action:none in some
    // flex/scroll contexts. This fully prevents palm/finger from scrolling,
    // panning, or triggering any response on the canvas.
    el.addEventListener('touchstart', e => e.preventDefault(), opt);
    el.addEventListener('touchmove',  e => e.preventDefault(), opt);

    new ResizeObserver(() => this._resize()).observe(el.parentElement || el);
    (window.visualViewport || window).addEventListener('resize', () => this._resize());
  }

  _accept(e) {
    // Only pen (Apple Pencil) and mouse. Touch is always rejected — no palm issues.
    return e.pointerType === 'pen' || e.pointerType === 'mouse';
  }

  _pt(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, p: e.pressure ?? 0.5 };
  }

  /* ── Stroke lifecycle ───────────────────────────────────────────── */

  _down(e) {
    e.preventDefault();
    if (!this._accept(e)) return;

    if (this.current) {
      if (e.pointerType === 'touch') return;
      this._commit();
    }

    this.activeId = e.pointerId;
    this.current  = { color: this.tool === 'eraser' ? null : this.color, pts: [this._pt(e)] };
  }

  _move(e) {
    if (!this.current || e.pointerId !== this.activeId) return;
    e.preventDefault();

    // getCoalescedEvents can return empty on some iOS versions — always fall back.
    let evts;
    try { evts = e.getCoalescedEvents(); } catch (_) { evts = null; }
    if (!evts || evts.length === 0) evts = [e];

    for (const ev of evts) {
      this.current.pts.push(this._pt(ev));
      this._drawSeg(this.current);
    }
  }

  _up(e) {
    if (!this.current || e.pointerId !== this.activeId) return;
    this._commit();
  }

  _commit() {
    if (!this.current) return;
    const s = this.current;
    if (s.pts.length > 1) {
      if (this.tool === 'eraser' || s.color === null) {
        this._erase(s.pts);
      } else {
        this.strokes.push(s);
      }
    }
    this.current  = null;
    this.activeId = null;
    if (this._resizePending) { this._resizePending = false; this._resize(); }
  }

  /* ── Drawing ────────────────────────────────────────────────────── */

  _drawSeg(stroke) {
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
      const p2  = pts[pts.length - 3];
      const mx0 = (p2.x + prev.x) / 2;
      const my0 = (p2.y + prev.y) / 2;
      const mx1 = (prev.x + curr.x) / 2;
      const my1 = (prev.y + curr.y) / 2;
      ctx.moveTo(mx0, my0);
      ctx.quadraticCurveTo(prev.x, prev.y, mx1, my1);
    }
    ctx.stroke();
  }

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
        const p2  = pts[i - 2];
        const mx0 = (p2.x + prev.x) / 2;
        const my0 = (p2.y + prev.y) / 2;
        const mx1 = (prev.x + curr.x) / 2;
        const my1 = (prev.y + curr.y) / 2;
        ctx.moveTo(mx0, my0);
        ctx.quadraticCurveTo(prev.x, prev.y, mx1, my1);
      }
      ctx.stroke();
    }
  }

  _erase(pts) {
    const R = 22;
    this.strokes = this.strokes.filter(s =>
      !s.pts.some(sp => pts.some(ep => Math.hypot(sp.x - ep.x, sp.y - ep.y) < R))
    );
    this._redraw();
  }

  _redraw() {
    this.ctx.clearRect(0, 0, this.w || this.canvas.width, this.h || this.canvas.height);
    for (const s of this.strokes) this._drawFull(s);
  }

  /* ── Public API ─────────────────────────────────────────────────── */

  setTool(t)  { this.tool = t; }
  setColor(c) { this.color = c; this.tool = 'pen'; }

  undo() {
    if (this.strokes.length) { this.strokes.pop(); this._redraw(); }
  }

  clear() { this.strokes = []; this._redraw(); }
  isBlank() { return this.strokes.length === 0; }

  getImageBase64() {
    const tmp = document.createElement('canvas');
    tmp.width  = this.canvas.width;
    tmp.height = this.canvas.height;
    const tc   = tmp.getContext('2d');
    tc.fillStyle = '#FFFBF0';
    tc.fillRect(0, 0, tmp.width, tmp.height);
    tc.drawImage(this.canvas, 0, 0);
    return tmp.toDataURL('image/png');
  }
}
