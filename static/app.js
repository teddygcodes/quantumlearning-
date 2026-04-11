/**
 * app.js — SPA router, state machine, all screen renderers.
 *
 * Security note: root.innerHTML is set only with strings generated entirely by
 * our own code (hardcoded templates, chapter/lesson content from chapters.js,
 * and problem text from problems.js). User input is read via .value and is
 * never injected into the DOM. If user-generated content is ever rendered in
 * the future, add DOMPurify first.
 */
import { CHAPTERS } from './chapters.js';
import { generateRandomProblem, generateProblem, checkAnswer } from './problems.js';
import { CanvasManager } from './canvas.js';

// ── State ──────────────────────────────────────────────────────────────────

const DEFAULT_STATE = {
  chapters: Object.fromEntries(
    [1, 2, 3, 4, 5].map(id => [
      id,
      { unlocked: id === 1, completed: false, quizScore: null, bestScore: null, practiceCount: 0 },
    ])
  ),
  tutorMode: false,
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('qp') || '{}');
    return {
      ...DEFAULT_STATE,
      ...saved,
      chapters: { ...DEFAULT_STATE.chapters, ...saved.chapters },
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

const state = loadState();
function saveState() { localStorage.setItem('qp', JSON.stringify(state)); }

// ── DOM helpers ────────────────────────────────────────────────────────────

const root = document.getElementById('app');

// Safe: only called with our own code-generated HTML strings, never user input.
function setContent(html) { root.innerHTML = html; }

function navigate(path) { window.location.hash = '#' + path; }

// ── Router ─────────────────────────────────────────────────────────────────

function route() {
  const hash  = window.location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean);
  switch (parts[0] || '') {
    case 'lesson':   renderLesson(+parts[1]);       break;
    case 'practice': renderProblemScreen(+parts[1], false); break;
    case 'quiz':     renderProblemScreen(+parts[1], true);  break;
    default:         renderHome();
  }
}

window.addEventListener('hashchange', route);
document.addEventListener('DOMContentLoaded', route);

// ── Home — skill tree ──────────────────────────────────────────────────────

function renderHome() {
  const nodes = CHAPTERS.map((ch, i) => {
    const cs  = state.chapters[ch.id];
    const cls = cs.completed ? 'completed' : cs.unlocked ? 'unlocked' : 'locked';
    const connector = i < CHAPTERS.length - 1
      ? `<div class="tree-connector" style="background: repeating-linear-gradient(to bottom, var(--ch${ch.id}-border,var(--border)) 0, var(--ch${ch.id}-border,var(--border)) 6px, transparent 6px, transparent 12px);"></div>`
      : '';
    const icon = cs.completed ? '★' : cs.unlocked ? ch.id : '🔒';
    const badge = cs.bestScore !== null
      ? `<span style="position:absolute;top:-6px;right:-6px;background:var(--gold);color:#000;font-size:11px;font-weight:800;border-radius:8px;padding:2px 6px;">${cs.bestScore}/${ch.quizCount}</span>`
      : '';
    return `
      <div class="chapter-node ${cls}" data-ch="${ch.id}"
           style="--ch-color:var(--ch${ch.id});--ch-dk:var(--ch${ch.id}-dk);${cs.unlocked || cs.completed ? 'cursor:pointer' : ''}"
           onclick="window.__chapterTap(${ch.id})">
        <span style="font-size:28px;font-weight:800;color:${cs.completed ? '#fff' : cs.unlocked ? 'var(--ch'+ch.id+')' : 'var(--text-muted)'};">${icon}</span>
        <span style="font-size:11px;font-weight:800;color:${cs.completed ? '#fff' : 'var(--text-muted)'};margin-top:2px;">${ch.title.split(' ').slice(0,2).join(' ')}</span>
        ${badge}
      </div>
      ${connector}`;
  }).join('');

  const tutorToggleLabel = state.tutorMode ? 'Tutor ON' : 'Tutor OFF';
  const tutorToggleColor = state.tutorMode ? 'var(--green)' : 'var(--text-muted)';

  setContent(`
    <div class="skill-tree">
      <div style="width:100%;display:flex;justify-content:space-between;align-items:center;padding:0 8px;margin-bottom:24px;">
        <div>
          <div style="font-size:22px;font-weight:800;color:var(--text);">Quantum Primer</div>
          <div style="font-size:13px;color:var(--text-muted);">Master the math. Understand the physics.</div>
        </div>
        <div style="display:flex;gap:12px;align-items:center;">
          <button class="btn btn-ghost" style="font-size:12px;padding:8px 14px;color:${tutorToggleColor};border-color:${tutorToggleColor};"
                  onclick="window.__toggleTutor()">✏️ ${tutorToggleLabel}</button>
          <button class="btn btn-ghost" style="font-size:12px;padding:8px 14px;" onclick="window.__resetConfirm()">⚙️</button>
        </div>
      </div>
      ${nodes}
    </div>

    <div class="chapter-modal-overlay" id="chapter-modal-overlay" onclick="window.__closeModal(event)">
      <div class="chapter-modal" id="chapter-modal"></div>
    </div>
  `);

  window.__chapterTap = (id) => {
    const ch = CHAPTERS.find(c => c.id === id);
    const cs = state.chapters[id];
    if (!cs.unlocked && !cs.completed) return;
    showChapterDetail(ch, cs);
  };

  window.__toggleTutor = () => {
    state.tutorMode = !state.tutorMode;
    saveState();
    renderHome();
  };

  window.__resetConfirm = () => {
    if (confirm('Reset all progress? This cannot be undone.')) {
      localStorage.removeItem('qp');
      location.reload();
    }
  };

  window.__closeModal = (e) => {
    if (e.target.id === 'chapter-modal-overlay') closeModal();
  };
}

function showChapterDetail(ch, cs) {
  const overlay = document.getElementById('chapter-modal-overlay');
  const modal   = document.getElementById('chapter-modal');

  const scoreText = cs.bestScore !== null
    ? `Best quiz score: <strong>${cs.bestScore}/${ch.quizCount}</strong>`
    : 'No quiz attempts yet';
  const practiceText = cs.practiceCount > 0
    ? `Practice problems solved: <strong>${cs.practiceCount}</strong>`
    : 'No practice yet';

  modal.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
      <div>
        <div style="font-size:22px;font-weight:800;color:var(--ch${ch.id});">${ch.title}</div>
        <div style="font-size:14px;color:var(--text-muted);margin-top:4px;">${ch.description}</div>
      </div>
      <button id="modal-close" class="btn btn-ghost" style="padding:8px 12px;font-size:18px;">✕</button>
    </div>
    <div style="display:flex;gap:12px;font-size:13px;color:var(--text-muted);margin-bottom:20px;">
      <span>${scoreText}</span>
      <span>·</span>
      <span>${practiceText}</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px;">
      <button id="modal-lesson"   class="btn btn-blue btn-full">📖 Start Lesson</button>
      <button id="modal-practice" class="btn btn-green btn-full">✏️ Practice Problems</button>
      <button id="modal-quiz" class="btn btn-ghost btn-full"
              ${!cs.unlocked && !cs.completed ? 'disabled style="opacity:0.4;cursor:default;"' : ''}>
        🎯 Take Quiz (${ch.quizPass}/${ch.quizCount} to pass)
      </button>
    </div>
  `;

  modal.querySelector('#modal-close').addEventListener('click', closeModal);
  modal.querySelector('#modal-lesson').addEventListener('click', () => { closeModal(); navigate('/lesson/' + ch.id); });
  modal.querySelector('#modal-practice').addEventListener('click', () => { closeModal(); navigate('/practice/' + ch.id); });
  const quizBtn = modal.querySelector('#modal-quiz');
  if (cs.unlocked || cs.completed) {
    quizBtn.addEventListener('click', () => { closeModal(); navigate('/quiz/' + ch.id); });
  }

  requestAnimationFrame(() => {
    overlay.classList.add('open');
  });
}

function closeModal() {
  const overlay = document.getElementById('chapter-modal-overlay');
  if (overlay) overlay.classList.remove('open');
}

// Expose to inline onclick handlers (ES module functions aren't on window by default)
window.navigate   = navigate;
window.closeModal = closeModal;

// ── Lesson screen (multi-step: teach → practice → next section) ───────────

function renderLesson(chapterId) {
  const ch = CHAPTERS.find(c => c.id === chapterId);
  if (!ch) { navigate('/'); return; }

  let stepIdx = 0;
  let canvas  = null;

  function renderStep() {
    const step   = ch.lessonSteps[stepIdx];
    const isLast = stepIdx === ch.lessonSteps.length - 1;
    const pct    = (stepIdx / ch.lessonSteps.length) * 100;

    const problem = generateProblem(chapterId, step.problemType, 1);
    let answered  = false;

    const hints = {
      vector:  'Format: x, y &nbsp; (e.g. 3, 4)',
      complex: 'Format: a + bi &nbsp; (e.g. 3 + 4i)',
      matrix:  'Format: a b; c d &nbsp; (e.g. 1 2; 3 4)',
      yesno:   'Type yes or no',
      numeric: '',
    };

    setContent(`
      <div class="problem-screen" data-ch="${chapterId}" style="--ch-color:var(--ch${chapterId});--ch-dk:var(--ch${chapterId}-dk);">

        <div class="problem-topbar">
          <button class="btn btn-ghost" style="padding:8px 16px;" onclick="navigate('/');">✕</button>
          <div style="flex:1;font-size:14px;font-weight:800;color:var(--ch${chapterId});text-align:center;">
            ${ch.title}
          </div>
          <div style="font-size:12px;color:var(--text-muted);white-space:nowrap;padding-right:4px;">
            ${stepIdx + 1} / ${ch.lessonSteps.length}
          </div>
        </div>

        <div class="progress-wrap" style="padding:0 4px;">
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pct}%;background:var(--ch${chapterId});"></div>
          </div>
        </div>

        <div class="problem-left">
          <div class="card" style="padding:18px 20px;">
            <div style="font-size:12px;font-weight:800;color:var(--ch${chapterId});text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">
              ${step.title}
            </div>
            ${step.html}
          </div>

          <div class="card" style="padding:16px 20px;">
            <div style="font-size:12px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">
              Try it
            </div>
            <div class="problem-text" style="font-size:20px;margin-bottom:14px;" id="lesson-q">
              ${problem.question}
            </div>
            <input class="answer-input" id="lesson-ans" type="text"
                   placeholder="Your answer…"
                   autocomplete="off" autocorrect="off" spellcheck="false"
                   onkeydown="if(event.key==='Enter')window.__lessonSubmit();" />
            <div style="font-size:11px;color:var(--text-muted);margin-top:6px;">${hints[problem.answerType] || ''}</div>
          </div>

          <button class="btn btn-green btn-full" id="lesson-check" onclick="window.__lessonSubmit();">
            Check Answer
          </button>
        </div>

        <div class="problem-right">
          <div style="font-size:12px;color:var(--text-muted);font-weight:800;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">
            Show Your Work
          </div>
          <div class="canvas-wrap">
            <canvas id="work-canvas"></canvas>
          </div>
          <div class="canvas-toolbar">
            <button class="tool-btn active" id="tool-pen"    onclick="window.__setTool('pen')"    title="Pen">✏️</button>
            <button class="tool-btn"         id="tool-eraser" onclick="window.__setTool('eraser')" title="Eraser">⬜</button>
            <button class="tool-btn" onclick="window.__undo()"        title="Undo">↩️</button>
            <button class="tool-btn" onclick="window.__clearCanvas()" title="Clear">🗑️</button>
            <div style="flex:1;"></div>
            <div class="color-swatch" style="background:#2C2C2C;" onclick="window.__setColor('#2C2C2C')" data-color="#2C2C2C"></div>
            <div class="color-swatch" style="background:#1a5c8f;" onclick="window.__setColor('#1a5c8f')" data-color="#1a5c8f"></div>
            <div class="color-swatch" style="background:#8B0000;" onclick="window.__setColor('#8B0000')" data-color="#8B0000"></div>
          </div>
        </div>
      </div>

      <div class="result-banner" id="result-banner">
        <div id="result-icon" style="font-size:28px;"></div>
        <div style="flex:1;">
          <div id="result-title" style="font-size:16px;font-weight:800;"></div>
          <div id="result-detail" style="font-size:13px;color:var(--text-muted);margin-top:2px;"></div>
        </div>
        <button class="btn btn-green" id="lesson-next" style="display:none;white-space:nowrap;" onclick="window.__lessonNext();">
          ${isLast ? 'Finish →' : 'Next →'}
        </button>
      </div>
    `);

    requestAnimationFrame(() => {
      canvas = new CanvasManager(document.getElementById('work-canvas'));
      document.getElementById('lesson-ans')?.focus();
    });

    // ── Answer handling ──────────────────────────────────────────

    window.__lessonSubmit = () => {
      if (answered) return;
      const inp   = document.getElementById('lesson-ans');
      const value = inp?.value?.trim();
      if (!value) return;

      const { correct, formattedAnswer } = checkAnswer(value, problem);
      answered = true;

      const banner = document.getElementById('result-banner');
      banner.className = 'result-banner ' + (correct ? 'correct' : 'incorrect');
      document.getElementById('result-icon').textContent  = correct ? '✅' : '❌';
      document.getElementById('result-title').textContent = correct ? 'Correct!' : 'Not quite';
      document.getElementById('result-detail').textContent = correct
        ? (isLast ? 'Lesson complete!' : 'On to the next concept!')
        : `Answer: ${formattedAnswer}`;
      setTimeout(() => banner.classList.add('visible'), 50);

      if (!correct) {
        if (answerMode === 'draw') {
          const wrap = document.getElementById('answer-canvas-wrap');
          if (wrap) { wrap.classList.add('shake'); setTimeout(() => wrap.classList.remove('shake'), 450); }
        } else {
          const inp = document.getElementById('answer-input');
          if (inp) { inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 450); }
        }
      }

      document.getElementById('lesson-check').style.display = 'none';
      document.getElementById('lesson-next').style.display  = '';
    };

    window.__lessonNext = () => {
      canvas?.clear();
      if (isLast) {
        navigate('/practice/' + chapterId);
      } else {
        stepIdx++;
        renderStep();
      }
    };

    // Canvas tools
    window.__setTool = (t) => {
      canvas?.setTool(t);
      document.querySelectorAll('.tool-btn[id^="tool-"]').forEach(b => b.classList.remove('active'));
      const btn = document.getElementById('tool-' + t);
      if (btn) btn.classList.add('active');
    };
    window.__setColor = (c) => {
      canvas?.setColor(c);
      document.querySelectorAll('.color-swatch').forEach(s => {
        s.style.outline = s.dataset.color === c ? '3px solid var(--blue)' : 'none';
        s.style.outlineOffset = '2px';
      });
    };
    window.__undo        = () => canvas?.undo();
    window.__clearCanvas = () => canvas?.clear();
  }

  renderStep();
}

// ── Problem screen (practice + quiz) ──────────────────────────────────────

function renderProblemScreen(chapterId, isQuiz) {
  const chapter = CHAPTERS.find(c => c.id === chapterId);
  if (!chapter) { navigate('/'); return; }
  const cs = state.chapters[chapterId];
  if (!cs.unlocked && !cs.completed) { navigate('/'); return; }

  // ── All session state in closure — never module-level globals ──
  let problem        = null;
  let answered       = false;
  let lastWasCorrect = false;
  let sessionDone    = 0;
  let quizScore      = 0;
  let canvas         = null;
  let answerCanvas   = null;  // CanvasManager for the answer notepad
  let answerMode     = 'draw'; // 'draw' | 'type'

  const totalQ = isQuiz ? chapter.quizCount : 99999;

  // ── Build screen ──────────────────────────────────────────────

  const modeToggle = !isQuiz ? `
    <button id="btn-mode-toggle" class="btn btn-ghost" style="font-size:12px;padding:6px 12px;color:${state.tutorMode ? 'var(--green)' : 'var(--text-muted)'};"
            onclick="window.__toggleTutorMode()">
      ✏️ ${state.tutorMode ? 'Tutor ON' : 'Tutor OFF'}
    </button>` : '';

  setContent(`
    <div class="problem-screen" data-ch="${chapterId}" style="--ch-color:var(--ch${chapterId});--ch-dk:var(--ch${chapterId}-dk);">

      <div class="problem-topbar">
        <button class="btn btn-ghost" style="padding:8px 16px;" onclick="navigate('/');">✕</button>
        <div style="flex:1;font-size:14px;font-weight:800;color:var(--ch${chapterId});text-align:center;">
          ${chapter.title}${isQuiz ? ' <span style="background:var(--gold);color:#000;font-size:11px;padding:2px 8px;border-radius:8px;vertical-align:middle;">QUIZ</span>' : ''}
        </div>
        ${modeToggle}
      </div>

      <div class="progress-wrap" style="padding:0 4px;">
        <div class="progress-bar">
          <div class="progress-fill" id="progress-fill" style="width:0%;background:var(--ch${chapterId});"></div>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px;text-align:right;" id="progress-label">
          ${isQuiz ? '0 / ' + totalQ : 'Practice'}
        </div>
      </div>

      <div class="problem-left">
        <div class="card" style="padding:20px;">
          <div class="problem-text" id="problem-text" style="font-family:var(--mono);font-size:22px;line-height:1.5;color:var(--text);min-height:60px;"></div>
        </div>

        <div class="answer-section">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <label style="font-size:13px;color:var(--ch${chapterId});font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">
              Write Your Answer
            </label>
            <button id="btn-type-toggle" style="font-size:11px;color:var(--text-muted);background:none;border:none;cursor:pointer;text-decoration:underline;" onclick="window.__toggleAnswerMode()">type instead</button>
          </div>

          <!-- Handwriting answer canvas (default) -->
          <div id="answer-canvas-wrap" class="answer-canvas-wrap">
            <canvas id="answer-canvas"></canvas>
            <div id="answer-placeholder" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;color:#bbb;font-size:15px;font-family:var(--font);">
              ✍️ write here
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;align-items:center;">
            <button class="tool-btn" style="width:36px;height:36px;font-size:15px;" onclick="window.__clearAnswer()" title="Clear">🗑️</button>
            <button class="tool-btn" style="width:36px;height:36px;font-size:15px;" onclick="window.__undoAnswer()" title="Undo">↩️</button>
            <div id="recognized-text" style="flex:1;text-align:right;font-size:12px;color:var(--text-muted);font-style:italic;"></div>
          </div>

          <!-- Text fallback (hidden by default) -->
          <div id="answer-text-wrap" style="display:none;">
            <input class="answer-input" id="answer-input" type="text"
                   placeholder="Type your answer…"
                   autocomplete="off" autocorrect="off" spellcheck="false"
                   onkeydown="if(event.key==='Enter')window.__submit();" />
            <div style="font-size:11px;color:var(--text-muted);margin-top:6px;" id="hint-text"></div>
          </div>
        </div>

        <button class="btn btn-green btn-full" id="btn-submit" onclick="window.__submit();">
          Check Answer
        </button>

        <div id="worked-solution" style="display:none;background:var(--surface);border:2px solid var(--border);border-left:4px solid var(--red);border-radius:var(--radius);padding:16px 18px;">
          <div style="font-size:12px;font-weight:800;color:var(--red);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">How to solve it</div>
          <div id="worked-solution-steps" style="font-family:var(--mono);font-size:13px;color:var(--text);line-height:2;"></div>
        </div>

        <div id="tutor-feedback-card" style="display:none;" class="card" style="padding:16px;border-left:4px solid var(--purple);">
          <div style="font-size:12px;font-weight:800;color:var(--purple);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Tutor Feedback</div>
          <div id="tutor-feedback-text" style="font-size:14px;color:var(--text);line-height:1.6;"></div>
        </div>
      </div>

      <div class="problem-right">
        <div style="font-size:12px;color:var(--text-muted);font-weight:800;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">
          Show Your Work
        </div>
        <div class="canvas-wrap">
          <canvas id="work-canvas"></canvas>
        </div>
        <div class="canvas-toolbar">
          <button class="tool-btn active" id="tool-pen" onclick="window.__setTool('pen')" title="Pen">✏️</button>
          <button class="tool-btn" id="tool-eraser" onclick="window.__setTool('eraser')" title="Eraser">⬜</button>
          <button class="tool-btn" onclick="window.__undo()" title="Undo">↩️</button>
          <button class="tool-btn" onclick="window.__clearCanvas()" title="Clear">🗑️</button>
          <div style="flex:1;"></div>
          <div class="color-swatch" style="background:#2C2C2C;" onclick="window.__setColor('#2C2C2C')" data-color="#2C2C2C"></div>
          <div class="color-swatch" style="background:#1a5c8f;" onclick="window.__setColor('#1a5c8f')" data-color="#1a5c8f"></div>
          <div class="color-swatch" style="background:#8B0000;" onclick="window.__setColor('#8B0000')" data-color="#8B0000"></div>
          ${!isQuiz && state.tutorMode ? '<button class="btn" id="btn-review" style="font-size:11px;padding:6px 10px;background:var(--purple);color:#fff;border-bottom:3px solid var(--purple-dk);white-space:nowrap;" onclick="window.__reviewWork()">Review My Work</button>' : ''}
        </div>
      </div>
    </div>

    <div class="result-banner" id="result-banner">
      <div id="result-icon" style="font-size:28px;"></div>
      <div style="flex:1;">
        <div id="result-title" style="font-size:16px;font-weight:800;"></div>
        <div id="result-detail" style="font-size:13px;color:var(--text-muted);margin-top:2px;"></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:stretch;min-width:110px;">
        ${!isQuiz ? '<button class="btn btn-ghost" id="btn-similar" style="display:none;font-size:12px;padding:8px 12px;" onclick="window.__trySimilar();">Try Similar</button>' : ''}
        <button class="btn btn-green" id="btn-next" style="display:none;white-space:nowrap;" onclick="window.__next();">
          ${isQuiz ? 'Next →' : 'Next →'}
        </button>
      </div>
    </div>
  `);

  // ── Init canvas after layout ──────────────────────────────────

  requestAnimationFrame(() => {
    const canvasEl = document.getElementById('work-canvas');
    canvas = new CanvasManager(canvasEl);

    const answerEl = document.getElementById('answer-canvas');
    if (answerEl) {
      answerCanvas = new CanvasManager(answerEl);
      answerCanvas.minW = 2;
      answerCanvas.maxW = 8;
      // Show/hide placeholder based on strokes
      const placeholder = document.getElementById('answer-placeholder');
      const origDown = answerCanvas._down.bind(answerCanvas);
      answerCanvas._down = (e) => { origDown(e); if (placeholder) placeholder.style.display = 'none'; };
    }

    newProblem();
  });

  // ── Inner helpers (all closures over session state) ───────────

  function showTutorFeedback(msg) {
    const card = document.getElementById('tutor-feedback-card');
    const text = document.getElementById('tutor-feedback-text');
    if (!card || !text) return;
    text.textContent = msg;
    card.style.display = 'block';
    card.style.padding = '16px';
    card.style.borderLeft = '4px solid var(--purple)';
  }

  function newProblem(type) {
    answered       = false;
    lastWasCorrect = false;

    problem = generateRandomProblem(chapter, sessionDone < 5 ? 1 : sessionDone < 10 ? 2 : 3);

    const textEl = document.getElementById('problem-text');
    const hintEl = document.getElementById('hint-text');
    if (textEl) textEl.textContent = problem.question;
    if (hintEl) {
      const hints = {
        vector:  'Format: x, y  (e.g. 3, 4)',
        complex: 'Format: a + bi  (e.g. 3 + 4i)',
        matrix:  'Format: a b; c d  (e.g. 1 2; 3 4)',
        yesno:   'Type yes or no',
        numeric: '',
      };
      hintEl.textContent = hints[problem.answerType] || '';
    }

    // Clear answer area
    if (answerMode === 'draw') {
      answerCanvas?.clear();
      const ph = document.getElementById('answer-placeholder');
      if (ph) ph.style.display = '';
      const rt = document.getElementById('recognized-text');
      if (rt) rt.textContent = '';
    } else {
      const inp = document.getElementById('answer-input');
      if (inp) { inp.value = ''; inp.classList.remove('shake'); inp.focus(); }
    }

    const banner = document.getElementById('result-banner');
    if (banner) { banner.classList.remove('visible', 'correct', 'incorrect'); }

    const btnNext    = document.getElementById('btn-next');
    const btnSimilar = document.getElementById('btn-similar');
    if (btnNext)    btnNext.style.display    = 'none';
    if (btnSimilar) btnSimilar.style.display = 'none';

    const fc = document.getElementById('tutor-feedback-card');
    if (fc) fc.style.display = 'none';
    const ws = document.getElementById('worked-solution');
    if (ws) ws.style.display = 'none';

    const submit = document.getElementById('btn-submit');
    if (submit) submit.style.display = '';
  }

  async function handleSubmit() {
    if (answered) return;

    let value = '';

    if (answerMode === 'draw') {
      if (!answerCanvas || answerCanvas.isBlank()) {
        const rt = document.getElementById('recognized-text');
        if (rt) { rt.textContent = 'Write your answer first!'; rt.style.color = 'var(--red)'; }
        return;
      }
      const btn = document.getElementById('btn-submit');
      if (btn) { btn.disabled = true; btn.textContent = 'Reading…'; }
      try {
        const res = await fetch('/api/read-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: answerCanvas.getImageBase64(),
            problem: { question: problem.question, answerType: problem.answerType },
          }),
        });
        const data = await res.json();
        value = (data.answer || '').trim();
        const rt = document.getElementById('recognized-text');
        if (rt) {
          rt.style.color = 'var(--text-muted)';
          rt.textContent = value && value !== 'unreadable' ? `Read: ${value}` : '';
        }
        if (!value || value === 'unreadable') {
          if (rt) { rt.textContent = "Couldn't read — try writing more clearly"; rt.style.color = 'var(--orange)'; }
          if (btn) { btn.disabled = false; btn.textContent = 'Check Answer'; }
          return;
        }
      } catch {
        const rt = document.getElementById('recognized-text');
        if (rt) { rt.textContent = 'Reading failed — type your answer instead'; rt.style.color = 'var(--orange)'; }
        if (btn) { btn.disabled = false; btn.textContent = 'Check Answer'; }
        return;
      }
      if (btn) { btn.disabled = false; btn.textContent = 'Check Answer'; }
    } else {
      const inp = document.getElementById('answer-input');
      if (!inp) return;
      value = inp.value.trim();
      if (!value) return;
    }

    const { correct, formattedAnswer } = checkAnswer(value, problem);

    answered       = true;
    lastWasCorrect = correct;
    sessionDone++;

    state.chapters[chapterId].practiceCount++;
    if (isQuiz && correct) quizScore++;
    saveState();

    // Progress bar
    if (isQuiz) {
      const pct = (sessionDone / totalQ) * 100;
      const fill  = document.getElementById('progress-fill');
      const label = document.getElementById('progress-label');
      if (fill)  fill.style.width  = pct + '%';
      if (label) label.textContent = `${sessionDone} / ${totalQ}`;
    }

    // Result banner
    const banner = document.getElementById('result-banner');
    if (banner) {
      banner.className = 'result-banner ' + (correct ? 'correct' : 'incorrect');
      const icon   = document.getElementById('result-icon');
      const title  = document.getElementById('result-title');
      const detail = document.getElementById('result-detail');
      if (icon)   icon.textContent   = correct ? '✅' : '❌';
      if (title)  title.textContent  = correct ? 'Correct!' : 'Not quite';
      if (detail) detail.textContent = correct ? 'Great work!' : `Answer: ${formattedAnswer}`;
      setTimeout(() => banner.classList.add('visible'), 50);

      // Show worked solution on wrong answer in practice mode
      if (!correct && !isQuiz && problem.steps?.length) {
        const sol   = document.getElementById('worked-solution');
        const steps = document.getElementById('worked-solution-steps');
        if (sol && steps) {
          steps.innerHTML = problem.steps.map(s => `<div style="padding:2px 0;">${s}</div>`).join('');
          sol.style.display = 'block';
        }
      }
    }

    // Shake on wrong
    if (!correct) {
      if (answerMode === 'draw') {
        const wrap = document.getElementById('answer-canvas-wrap');
        if (wrap) { wrap.classList.add('shake'); setTimeout(() => wrap.classList.remove('shake'), 450); }
      } else {
        const inp2 = document.getElementById('answer-input');
        if (inp2) { inp2.classList.add('shake'); setTimeout(() => inp2.classList.remove('shake'), 450); }
      }
    }

    // Show action buttons in banner
    const btnNext2    = document.getElementById('btn-next');
    const btnSimilar2 = document.getElementById('btn-similar');
    if (btnNext2)    btnNext2.style.display    = '';
    if (btnSimilar2) btnSimilar2.style.display = '';

    const submit = document.getElementById('btn-submit');
    if (submit) submit.style.display = 'none';

    // Quiz end
    if (isQuiz && sessionDone === totalQ) {
      setTimeout(showQuizResults, 900);
    }
  }

  function showQuizResults() {
    const passed = quizScore >= chapter.quizPass;

    if (passed) {
      state.chapters[chapterId].completed = true;
      if (state.chapters[chapterId].bestScore === null || quizScore > state.chapters[chapterId].bestScore) {
        state.chapters[chapterId].bestScore = quizScore;
      }
      // Unlock next chapter
      const nextId = chapterId + 1;
      if (nextId <= 5 && state.chapters[nextId]) {
        state.chapters[nextId].unlocked = true;
      }
      saveState();
    } else {
      if (state.chapters[chapterId].bestScore === null || quizScore > state.chapters[chapterId].bestScore) {
        state.chapters[chapterId].bestScore = quizScore;
      }
      saveState();
    }

    setContent(`
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100dvh;padding:32px 24px;text-align:center;">
        <div style="font-size:72px;margin-bottom:16px;">${passed ? '🎉' : '💪'}</div>
        <div style="font-size:28px;font-weight:800;color:${passed ? 'var(--gold)' : 'var(--text)'};margin-bottom:8px;">
          ${passed ? 'Chapter Complete!' : 'Keep Practicing!'}
        </div>
        <div style="font-size:48px;font-weight:800;color:${passed ? 'var(--green)' : 'var(--orange)'};margin:16px 0;">
          ${quizScore} / ${totalQ}
        </div>
        <div style="font-size:16px;color:var(--text-muted);margin-bottom:32px;">
          ${passed
            ? `You passed! ${chapterId < 5 ? 'Chapter ' + (chapterId + 1) + ' is now unlocked.' : 'You\'ve completed all chapters!'}`
            : `Need ${chapter.quizPass} to pass. You got ${quizScore}. Practice more and try again!`
          }
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;width:100%;max-width:340px;">
          ${passed && chapterId < 5
            ? `<button class="btn btn-green btn-full" onclick="navigate('/');">Continue →</button>`
            : ''
          }
          <button class="btn btn-blue btn-full" onclick="navigate('/quiz/${chapterId}');">
            ${passed ? 'Retake Quiz' : 'Try Again'}
          </button>
          <button class="btn btn-ghost btn-full" onclick="navigate('/practice/${chapterId}');">
            More Practice
          </button>
          <button class="btn btn-ghost btn-full" onclick="navigate('/');">
            ← Home
          </button>
        </div>
      </div>
    `);

    if (passed) showConfetti();
  }

  // ── Vision API (in closure — sees canvas, problem, lastWasCorrect) ────

  async function reviewWork() {
    const btn = document.getElementById('btn-review');
    if (!btn) return;
    btn.disabled = true;
    btn.textContent = 'Reviewing…';

    if (!canvas || canvas.isBlank()) {
      showTutorFeedback('Write your work on the canvas first, then tap Review.');
      btn.disabled = false;
      btn.textContent = 'Review My Work';
      return;
    }

    const studentAnswer = (document.getElementById('answer-input') || {}).value || '';

    try {
      const res = await fetch('/api/review-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image:          canvas.getImageBase64(),
          problem:        { question: problem.question, answerDisplay: problem.answerDisplay },
          student_answer: studentAnswer,
          was_correct:    lastWasCorrect,
        }),
      });
      const data = await res.json();
      showTutorFeedback(data.feedback || 'Tutor feedback unavailable right now.');
    } catch {
      showTutorFeedback('Tutor feedback unavailable right now.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Review My Work';
    }
  }

  // ── Expose inner functions to onclick handlers ────────────────

  window.__submit     = handleSubmit;
  window.__next       = () => { canvas && canvas.clear(); newProblem(); };
  window.__trySimilar = () => { canvas && canvas.clear(); newProblem(problem.type); };

  window.__clearAnswer = () => {
    answerCanvas?.clear();
    const ph = document.getElementById('answer-placeholder');
    if (ph) ph.style.display = '';
    const rt = document.getElementById('recognized-text');
    if (rt) rt.textContent = '';
  };
  window.__undoAnswer = () => answerCanvas?.undo();

  window.__toggleAnswerMode = () => {
    answerMode = answerMode === 'draw' ? 'type' : 'draw';
    const canvasWrap = document.getElementById('answer-canvas-wrap');
    const miniTools  = canvasWrap?.nextElementSibling;
    const textWrap   = document.getElementById('answer-text-wrap');
    const toggle     = document.getElementById('btn-type-toggle');
    if (answerMode === 'type') {
      if (canvasWrap) canvasWrap.style.display = 'none';
      if (miniTools)  miniTools.style.display  = 'none';
      if (textWrap)   textWrap.style.display   = '';
      if (toggle)     toggle.textContent        = 'draw instead';
      const inp = document.getElementById('answer-input');
      if (inp) inp.focus();
    } else {
      if (canvasWrap) canvasWrap.style.display = '';
      if (miniTools)  miniTools.style.display  = 'flex';
      if (textWrap)   textWrap.style.display   = 'none';
      if (toggle)     toggle.textContent        = 'type instead';
    }
  };
  window.__reviewWork = reviewWork;

  window.__setTool = (t) => {
    canvas && canvas.setTool(t);
    document.querySelectorAll('.tool-btn[id^="tool-"]').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('tool-' + t);
    if (btn) btn.classList.add('active');
  };

  window.__setColor = (c) => {
    canvas && canvas.setColor(c);
    document.querySelectorAll('.color-swatch').forEach(s => {
      s.style.outline = s.dataset.color === c ? '3px solid var(--blue)' : 'none';
      s.style.outlineOffset = '2px';
    });
    window.__setTool('pen');
  };

  window.__undo        = () => canvas && canvas.undo();
  window.__clearCanvas = () => canvas && canvas.clear();

  window.__toggleTutorMode = () => {
    state.tutorMode = !state.tutorMode;
    saveState();
    renderProblemScreen(chapterId, isQuiz);
  };
}

// ── Confetti ───────────────────────────────────────────────────────────────

function showConfetti() {
  const el     = document.createElement('div');
  el.className = 'confetti-overlay';
  const colors = ['#58CC02', '#1CB0F6', '#FF9600', '#CE82FF', '#FFC800', '#FF4B4B'];
  for (let i = 0; i < 90; i++) {
    const p     = document.createElement('div');
    p.className = 'confetti-particle';
    const w     = 4 + Math.random() * 8;
    const h     = 4 + Math.random() * 8;
    p.style.cssText = [
      `left:${Math.random() * 100}%`,
      `background:${colors[i % 6]}`,
      `animation-delay:${(Math.random() * 0.6).toFixed(2)}s`,
      `animation-duration:${(0.9 + Math.random() * 1.2).toFixed(2)}s`,
      `width:${w.toFixed(1)}px`,
      `height:${h.toFixed(1)}px`,
      `border-radius:${Math.random() > 0.5 ? '50%' : '2px'}`,
    ].join(';');
    el.appendChild(p);
  }
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2700);
}
