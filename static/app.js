/**
 * app.js — SPA router, state machine, all screen renderers.
 *
 * Security note: root.innerHTML is set only with strings generated entirely by
 * our own code (hardcoded templates, chapter/lesson content from chapters.js,
 * and problem text from problems.js). User input is read via .value and is
 * never injected into the DOM. If user-generated content is ever rendered in
 * the future, add DOMPurify first.
 */
import { CHAPTERS } from './chapters.js?v=6';
import { generateRandomProblem, generateProblem, checkAnswer } from './problems.js?v=5';
import { TEMPLATES } from './templates.js?v=2';
import { CanvasManager } from './canvas.js';

// ── State ──────────────────────────────────────────────────────────────────

const DEFAULT_STATE = {
  chapters: Object.fromEntries(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(id => [
      id,
      { unlocked: id === 1, completed: false, quizScore: null, bestScore: null, practiceCount: 0, lessonProgress: null },
    ])
  ),
  tutorMode: false,
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('qp') || '{}');
    const merged = {
      ...DEFAULT_STATE,
      ...saved,
      chapters: { ...DEFAULT_STATE.chapters, ...saved.chapters },
    };
    // Auto-unlock: if chapter N is completed, chapter N+1 should be unlocked.
    // Handles new chapters added after the user already passed earlier ones.
    for (let id = 1; id <= 11; id++) {
      if (merged.chapters[id]?.completed && merged.chapters[id + 1]) {
        merged.chapters[id + 1].unlocked = true;
      }
    }
    return merged;
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

// ── Keyboard dismiss: tap outside input to blur on iPad ──
document.addEventListener('touchstart', (e) => {
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
    if (!e.target.closest('input, textarea, button, .btn, .tool-btn, .color-swatch')) {
      active.blur();
    }
  }
}, { passive: true });

// ── Home — skill tree ──────────────────────────────────────────────────────

function renderHome() {
  // Count progress
  const totalChapters = CHAPTERS.length;
  const completedCount = CHAPTERS.filter(ch => state.chapters[ch.id]?.completed).length;
  const totalPractice = CHAPTERS.reduce((s, ch) => s + (state.chapters[ch.id]?.practiceCount || 0), 0);

  // Chapter icons
  const chapterIcons = ['🧮','📐','📏','💫','🔢','⚛️','🔮','📡','🔗','🌀','⚡'];

  const pathOffsets = [0, -1, -2, -1, 0, 1, 2, 1, 0, -1, -2];

  const nodes = CHAPTERS.map((ch, i) => {
    const cs  = state.chapters[ch.id];
    const cls = cs.completed ? 'completed' : cs.unlocked ? 'unlocked' : 'locked';
    const icon = cs.completed ? '✓' : cs.unlocked ? chapterIcons[i] : '🔒';
    const offset = pathOffsets[i] * 52;
    const badge = cs.bestScore !== null
      ? `<div class="node-badge">${cs.bestScore}/${ch.quizCount}</div>`
      : '';

    // Progress ring for unlocked (show practice progress)
    const progressPct = cs.completed ? 100 : cs.unlocked ? Math.min((cs.practiceCount || 0) / 10 * 100, 95) : 0;
    const circumference = 2 * Math.PI * 54;
    const strokeOffset = circumference - (progressPct / 100) * circumference;

    // Phase divider before chapter 6
    const phaseDivider = i === 5 ? `
      <div class="phase-divider" style="animation-delay:${i * 0.06}s;">
        <div class="phase-line"></div>
        <div class="phase-label">Quantum Computing</div>
        <div class="phase-line"></div>
      </div>` : '';

    // Connector to next node
    const connector = i < CHAPTERS.length - 1 ? (() => {
      const nextOffset = pathOffsets[i + 1] * 52;
      return `<div class="path-connector" style="--from:${offset}px;--to:${nextOffset}px;"></div>`;
    })() : '';

    return `
      ${phaseDivider}
      <div class="path-row" style="--offset:${offset}px;animation-delay:${i * 0.06}s;">
        <div class="chapter-node ${cls}" data-ch="${ch.id}"
             style="--ch-color:var(--ch${ch.id});--ch-dk:var(--ch${ch.id}-dk);--i:${i}"
             onclick="window.__chapterTap(${ch.id})">
          <svg class="progress-ring" viewBox="0 0 120 120">
            <circle class="progress-ring-bg" cx="60" cy="60" r="54" />
            ${progressPct > 0 ? `<circle class="progress-ring-fill" cx="60" cy="60" r="54"
              style="stroke:var(--ch${ch.id});stroke-dasharray:${circumference};stroke-dashoffset:${strokeOffset};" />` : ''}
          </svg>
          <div class="node-inner">
            <span class="node-icon">${icon}</span>
          </div>
          ${badge}
        </div>
        <div class="node-info ${cls}">
          <span class="node-chapter-num">Chapter ${ch.id}</span>
          <span class="node-title">${ch.title}</span>
          ${cs.completed ? '<span class="node-status completed-status">Complete ✓</span>' :
            cs.unlocked ? '<span class="node-status unlocked-status">In Progress</span>' :
            '<span class="node-status locked-status">Locked</span>'}
        </div>
      </div>
      ${connector}`;
  }).join('');

  const tutorToggleLabel = state.tutorMode ? 'ON' : 'OFF';
  const tutorToggleColor = state.tutorMode ? 'var(--green)' : 'var(--text-muted)';

  setContent(`
    <div class="home-bg">
      <div class="home-particles" id="home-particles"></div>
      <div class="skill-tree">

        <div class="home-header">
          <div class="home-brand">
            <div class="home-logo">⚛</div>
            <div>
              <div class="home-title">Quantum Primer</div>
              <div class="home-subtitle">Master the math. Understand the physics.</div>
            </div>
          </div>
          <div class="home-actions">
            <button class="home-btn ${state.tutorMode ? 'active' : ''}" onclick="window.__toggleTutor()">
              <span class="home-btn-icon">✏️</span> Tutor ${tutorToggleLabel}
            </button>
            <button class="home-btn" onclick="window.__resetConfirm()">⚙️</button>
          </div>
        </div>

        <div class="stats-bar">
          <div class="stat-pill">
            <span class="stat-icon">🏆</span>
            <span class="stat-value">${completedCount}</span>
            <span class="stat-label">/ ${totalChapters}</span>
          </div>
          <div class="stat-pill">
            <span class="stat-icon">✏️</span>
            <span class="stat-value">${totalPractice}</span>
            <span class="stat-label">solved</span>
          </div>
          <div class="stat-pill progress-pill">
            <div class="stat-progress-track">
              <div class="stat-progress-fill" style="width:${(completedCount / totalChapters * 100).toFixed(0)}%"></div>
            </div>
            <span class="stat-label">${(completedCount / totalChapters * 100).toFixed(0)}%</span>
          </div>
        </div>

        <div class="phase-divider first-phase">
          <div class="phase-line"></div>
          <div class="phase-label">Math Foundations</div>
          <div class="phase-line"></div>
        </div>

        <div class="path-container">
          ${nodes}
        </div>

      </div>
    </div>

    <div class="chapter-modal-overlay" id="chapter-modal-overlay" onclick="window.__closeModal(event)">
      <div class="chapter-modal" id="chapter-modal"></div>
    </div>
  `);

  // Spawn floating particles
  requestAnimationFrame(() => {
    const container = document.getElementById('home-particles');
    if (!container) return;
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 8 + 's';
      p.style.animationDuration = (6 + Math.random() * 10) + 's';
      p.style.width = p.style.height = (2 + Math.random() * 4) + 'px';
      p.style.opacity = 0.15 + Math.random() * 0.25;
      container.appendChild(p);
    }
  });

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

  // Restore lesson progress if resuming
  const savedProgress = state.chapters[chapterId]?.lessonProgress;
  let stepIdx    = savedProgress?.stepIdx || 0;
  let subProbIdx = savedProgress?.subProbIdx || 0;
  let canvas     = null;

  function renderStep() {
    const step   = ch.lessonSteps[stepIdx];
    const isLast = stepIdx === ch.lessonSteps.length - 1;

    // Progression: array of { difficulty, variation } per sub-problem
    const progression = step.progression || [{ difficulty: 1, variation: 'basic' }];
    const prog = progression[subProbIdx];
    const isLastSub = subProbIdx >= progression.length - 1;

    // Progress bar: sub-problem granularity
    const totalSubs = ch.lessonSteps.reduce((s, st) => s + (st.progression?.length || 1), 0);
    const doneSubs  = ch.lessonSteps.slice(0, stepIdx).reduce((s, st) => s + (st.progression?.length || 1), 0) + subProbIdx;
    const pct = (doneSubs / totalSubs) * 100;

    // Dynamic teaching unit: if a template exists, generate teaching + problem together
    const template = TEMPLATES[step.problemType];
    let unit = template ? template.generate(prog.difficulty, prog.variation) : null;
    let problem = unit
      ? { question: unit.tryIt.question, answer: unit.tryIt.answer, answerType: unit.tryIt.answerType,
          answerDisplay: unit.tryIt.answerDisplay, steps: unit.tryIt.steps, chapterId }
      : generateProblem(chapterId, step.problemType, prog.difficulty, prog.variation);
    let answered  = false;
    let retryCount = 0;

    const hints = {
      vector:  'Format: x, y &nbsp; (e.g. 3, 4)',
      complex: 'Format: a + bi &nbsp; (e.g. 3 + 4i)',
      matrix:  'Format: a b; c d &nbsp; (e.g. 1 2; 3 4)',
      yesno:   'Type yes or no',
      numeric: '',
    };

    // Concept card content: dynamic from template or static from step.html
    const conceptHtml = unit ? `
      <p style="font-size:15px;line-height:1.6;color:var(--text);margin-bottom:14px;">${unit.teachingText}</p>
      <div class="worked-example">
        <div class="worked-example-label">Worked Example</div>
        <div style="font-size:17px;font-weight:700;color:var(--text);margin-bottom:10px;font-family:var(--mono);">${unit.workedExample.problem}</div>
        ${unit.workedExample.steps.map(s =>
          `<div style="font-size:14px;color:var(--text);line-height:1.6;font-family:var(--mono);">${s}</div>`
        ).join('')}
        <div style="font-size:13px;color:var(--text-muted);margin-top:10px;font-style:italic;">💡 ${unit.workedExample.insight}</div>
      </div>
    ` : step.html;

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
            ${conceptHtml}
          </div>

          <div class="card" style="padding:16px 20px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
              <div style="font-size:12px;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">
                Try it
              </div>
              ${progression.length > 1 ? `
                <div class="sub-progress">
                  <span class="sub-label">Problem ${subProbIdx + 1} of ${progression.length}</span>
                  ${progression.map((_, pi) =>
                    `<span class="sub-dot ${pi < subProbIdx ? 'done' : pi === subProbIdx ? 'current' : ''}"></span>`
                  ).join('')}
                </div>
              ` : ''}
            </div>
            <div class="problem-text" style="font-size:20px;margin-bottom:14px;" id="lesson-q">
              ${problem.question}
            </div>
            <input class="answer-input" id="lesson-ans" type="text"
                   placeholder="Your answer…"
                   autocomplete="off" autocorrect="off" spellcheck="false"
                   enterkeyhint="done"
                   onkeydown="if(event.key==='Enter'){window.__lessonSubmit();this.blur();}" />
            <div style="font-size:11px;color:var(--text-muted);margin-top:6px;">${hints[problem.answerType] || ''}</div>
          </div>

          <button class="btn btn-green btn-full" id="lesson-check" onclick="window.__lessonSubmit();">
            Check Answer
          </button>

          <div class="ask-tutor-inline" id="ask-tutor-inline">
            <div id="ask-inline-response" class="ask-tutor-response"></div>
            <div class="ask-tutor-input-row">
              <input class="ask-tutor-input" id="ask-inline-input" type="text"
                     placeholder="Ask the tutor a question…"
                     autocomplete="off" autocorrect="off" spellcheck="false"
                     onkeydown="if(event.key==='Enter')window.__askTutor();" />
              <button class="btn btn-ask" onclick="window.__askTutor();">Ask</button>
            </div>
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
        <div class="result-top">
          <div id="result-icon" style="font-size:32px;"></div>
          <div>
            <div id="result-title" style="font-size:18px;font-weight:800;"></div>
            <div id="result-detail" style="font-size:15px;color:#fff;margin-top:4px;"></div>
          </div>
        </div>
        <div id="result-why" style="font-size:13px;color:rgba(255,255,255,0.85);padding:0 4px;line-height:1.4;"></div>
        <div class="ask-tutor-wrap" id="ask-tutor-wrap">
          <div id="ask-tutor-response" class="ask-tutor-response"></div>
          <div class="ask-tutor-input-row">
            <input class="ask-tutor-input" id="ask-tutor-input" type="text"
                   placeholder="Ask about what you just learned…"
                   autocomplete="off" autocorrect="off" spellcheck="false"
                   onkeydown="if(event.key==='Enter')window.__askTutor();" />
            <button class="btn btn-ask" onclick="window.__askTutor();">Ask</button>
          </div>
        </div>
        <div class="result-buttons">
          <button class="btn btn-ghost" id="lesson-retry" onclick="window.__lessonRetry();">
            Try Again
          </button>
          <button class="btn btn-green" id="lesson-next" onclick="window.__lessonNext();">
            ${isLast && isLastSub ? 'Finish →' : isLastSub ? 'Next Concept →' : 'Next Problem →'}
          </button>
        </div>
      </div>
    `);

    requestAnimationFrame(() => {
      canvas = new CanvasManager(document.getElementById('work-canvas'));
      // Don't auto-focus input — let the student tap when ready (avoids keyboard popping up on iPad)
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
      document.getElementById('result-title').textContent = correct ? 'Correct!' : 'Incorrect';
      const correctMsg = isLast && isLastSub ? 'Lesson complete!'
        : isLastSub ? 'On to the next concept!'
        : 'Nice! Next one\'s a bit harder...';
      document.getElementById('result-detail').textContent = correct
        ? correctMsg
        : `Correct answer: ${formattedAnswer}`;
      const whyEl = document.getElementById('result-why');
      const why = unit ? unit.tryIt.whyItMatters : step.whyItMatters;
      if (whyEl && why) {
        whyEl.textContent = '💡 ' + why;
      }
      setTimeout(() => banner.classList.add('visible'), 50);

      if (!correct) {
        const shakeEl = document.getElementById('lesson-ans');
        if (shakeEl) { shakeEl.classList.add('shake'); setTimeout(() => shakeEl.classList.remove('shake'), 450); }
      }

      document.getElementById('lesson-check').style.display = 'none';
    };

    window.__lessonNext = () => {
      canvas?.clear();
      if (!isLastSub) {
        // More sub-problems in this concept
        subProbIdx++;
        state.chapters[chapterId].lessonProgress = { stepIdx, subProbIdx };
        saveState();
        renderStep();
      } else if (isLast) {
        // All done — clear lesson progress and go to practice
        state.chapters[chapterId].lessonProgress = null;
        saveState();
        navigate('/practice/' + chapterId);
      } else {
        // Next concept
        stepIdx++;
        subProbIdx = 0;
        state.chapters[chapterId].lessonProgress = { stepIdx, subProbIdx };
        saveState();
        renderStep();
      }
    };

    window.__lessonRetry = () => {
      retryCount++;
      answered = false;

      const banner = document.getElementById('result-banner');
      if (banner) banner.classList.remove('visible', 'correct', 'incorrect');

      if (retryCount >= 2) {
        // Anti-frustration: show worked solution inline
        // Use template worked example steps if available, else problem.steps
        const solutionSteps = unit ? unit.workedExample.steps : problem.steps;
        const solutionHtml = solutionSteps
          ? `<div class="worked-solution-inline">
               <div style="font-size:11px;font-weight:800;color:var(--ch${chapterId});text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Worked Solution</div>
               ${solutionSteps.map(s => `<div style="font-size:14px;color:var(--text);line-height:1.6;font-family:var(--mono);">${s}</div>`).join('')}
               <button class="btn btn-green btn-full" style="margin-top:12px;" onclick="window.__lessonRetryAfterSolution();">Got it — Try Again</button>
             </div>`
          : '';
        const tryCard = document.getElementById('lesson-q')?.parentElement;
        if (tryCard && solutionHtml) {
          const existing = tryCard.querySelector('.worked-solution-inline');
          if (existing) existing.remove();
          tryCard.insertAdjacentHTML('beforeend', solutionHtml);
        }
        // Hide check button and input
        const check = document.getElementById('lesson-check');
        if (check) check.style.display = 'none';
        const inp = document.getElementById('lesson-ans');
        if (inp) inp.style.display = 'none';
        return;
      }

      if (template) {
        // Template path: full re-render with fresh random numbers for both
        // worked example AND practice problem
        renderStep();
      } else {
        // Static HTML path: just swap the question text
        problem = generateProblem(chapterId, step.problemType, prog.difficulty, prog.variation);
        const qEl = document.getElementById('lesson-q');
        if (qEl) qEl.textContent = problem.question;

        const check = document.getElementById('lesson-check');
        if (check) check.style.display = '';
        const inp = document.getElementById('lesson-ans');
        if (inp) { inp.value = ''; inp.blur(); }
        // Clear ask tutor state
        const resp = document.getElementById('ask-tutor-response');
        if (resp) resp.textContent = '';
        const askInp = document.getElementById('ask-tutor-input');
        if (askInp) askInp.value = '';
      }
    };

    // After studying the worked solution, regenerate and try again
    window.__lessonRetryAfterSolution = () => {
      retryCount = 0;
      answered = false;
      if (template) {
        // Full re-render with fresh teaching unit
        renderStep();
      } else {
        problem = generateProblem(chapterId, step.problemType, prog.difficulty, prog.variation);
        const qEl = document.getElementById('lesson-q');
        if (qEl) qEl.textContent = problem.question;
        // Remove the solution block
        const sol = document.querySelector('.worked-solution-inline');
        if (sol) sol.remove();
        const check = document.getElementById('lesson-check');
        if (check) check.style.display = '';
        const inp = document.getElementById('lesson-ans');
        if (inp) { inp.style.display = ''; inp.value = ''; inp.blur(); }
      }
    };

    window.__askTutor = async () => {
      // Use banner input if banner is visible, otherwise inline input
      const bannerVisible = document.getElementById('result-banner')?.classList.contains('visible');
      const inp = bannerVisible
        ? document.getElementById('ask-tutor-input')
        : document.getElementById('ask-inline-input');
      const resp = bannerVisible
        ? document.getElementById('ask-tutor-response')
        : document.getElementById('ask-inline-response');
      const q = inp?.value?.trim();
      if (!q) return;

      resp.textContent = 'Thinking…';
      inp.disabled = true;

      try {
        const res = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: q,
            lesson_title: step.title,
            lesson_html: unit
              ? `${unit.teachingText} Worked example: ${unit.workedExample.problem} → ${unit.workedExample.steps.join('; ')}`
              : (step.html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 600),
            problem_text: problem.question,
            student_answer: document.getElementById('lesson-ans')?.value || '',
            correct_answer: answered ? (problem.answerDisplay || String(problem.answer)) : '(not yet answered)',
            was_correct: answered ? document.getElementById('result-banner')?.classList.contains('correct') : null,
          }),
        });
        const data = await res.json();
        resp.textContent = data.answer || 'Sorry, I couldn\'t answer that.';
      } catch {
        resp.textContent = 'Couldn\'t reach the tutor right now.';
      }
      inp.disabled = false;
      inp.value = '';
      inp.focus();
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
                   enterkeyhint="done"
                   onkeydown="if(event.key==='Enter'){window.__submit();this.blur();}" />
            <div style="font-size:11px;color:var(--text-muted);margin-top:6px;" id="hint-text"></div>
          </div>
        </div>

        <button class="btn btn-green btn-full" id="btn-submit" onclick="window.__submit();">
          Check Answer
        </button>

        <div class="ask-tutor-inline" id="ask-tutor-inline">
          <div id="ask-inline-response" class="ask-tutor-response"></div>
          <div class="ask-tutor-input-row">
            <input class="ask-tutor-input" id="ask-inline-input" type="text"
                   placeholder="Ask the tutor a question…"
                   autocomplete="off" autocorrect="off" spellcheck="false"
                   onkeydown="if(event.key==='Enter')window.__askPracticeTutor();" />
            <button class="btn btn-ask" onclick="window.__askPracticeTutor();">Ask</button>
          </div>
        </div>

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
      <div class="result-top">
        <div id="result-icon" style="font-size:32px;"></div>
        <div>
          <div id="result-title" style="font-size:18px;font-weight:800;"></div>
          <div id="result-detail" style="font-size:15px;color:#fff;margin-top:4px;"></div>
        </div>
      </div>
      ${!isQuiz ? `<div class="ask-tutor-wrap" id="ask-tutor-wrap">
        <div id="ask-tutor-response" class="ask-tutor-response"></div>
        <div class="ask-tutor-input-row">
          <input class="ask-tutor-input" id="ask-tutor-input" type="text"
                 placeholder="Ask about this problem…"
                 autocomplete="off" autocorrect="off" spellcheck="false"
                 onkeydown="if(event.key==='Enter')window.__askPracticeTutor();" />
          <button class="btn btn-ask" onclick="window.__askPracticeTutor();">Ask</button>
        </div>
      </div>` : ''}
      <div class="result-buttons">
        ${!isQuiz ? '<button class="btn btn-ghost" onclick="window.__trySimilar();">Try Again</button>' : ''}
        <button class="btn btn-green" onclick="window.__next();">
          Next →
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
      if (inp) { inp.value = ''; inp.classList.remove('shake'); inp.blur(); }
    }

    const banner = document.getElementById('result-banner');
    if (banner) { banner.classList.remove('visible', 'correct', 'incorrect'); }

    const fc = document.getElementById('tutor-feedback-card');
    if (fc) fc.style.display = 'none';
    const ws = document.getElementById('worked-solution');
    if (ws) ws.style.display = 'none';

    // Clear ask tutor state
    const askResp = document.getElementById('ask-inline-response');
    if (askResp) askResp.textContent = '';
    const askInp = document.getElementById('ask-inline-input');
    if (askInp) askInp.value = '';
    const askBannerResp = document.getElementById('ask-tutor-response');
    if (askBannerResp) askBannerResp.textContent = '';
    const askBannerInp = document.getElementById('ask-tutor-input');
    if (askBannerInp) askBannerInp.value = '';

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
      if (title)  title.textContent  = correct ? 'Correct!' : 'Incorrect';
      if (detail) detail.textContent = correct ? 'Great work!' : `Correct answer: ${formattedAnswer}`;
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
      if (state.chapters[nextId]) {
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
  window.__trySimilar = () => {
    // Reset so user can try the same problem again
    answered = false;
    newProblem(problem.type);
  };

  window.__askPracticeTutor = async () => {
    const bannerVisible = document.getElementById('result-banner')?.classList.contains('visible');
    const inp = bannerVisible
      ? document.getElementById('ask-tutor-input')
      : document.getElementById('ask-inline-input');
    const resp = bannerVisible
      ? document.getElementById('ask-tutor-response')
      : document.getElementById('ask-inline-response');
    const q = inp?.value?.trim();
    if (!q) return;

    resp.textContent = 'Thinking…';
    inp.disabled = true;

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          lesson_title: chapter.title + ' Practice',
          lesson_html: problem.question,
          problem_text: problem.question,
          student_answer: document.getElementById('answer-input')?.value || '',
          correct_answer: answered ? (problem.answerDisplay || String(problem.answer)) : '(not yet answered)',
          was_correct: answered ? lastWasCorrect : null,
        }),
      });
      const data = await res.json();
      resp.textContent = data.answer || 'Sorry, I couldn\'t answer that.';
    } catch {
      resp.textContent = 'Couldn\'t reach the tutor right now.';
    }
    inp.disabled = false;
    inp.value = '';
    inp.focus();
  };

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
