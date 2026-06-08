import { findSeedFromPulls } from './engine.js';
import { getRecommendation } from './optimizer.js';
import { RARITY_COLORS, RARITY_LABELS } from './units.js';

// ── State ────────────────────────────────────────────────────────────────────
let state = {
  screen: 'entry',          // 'entry' | 'loading' | 'results'
  selectedPulls: [],        // ['normal','rare','super','uber'] sequence
  seed: null,
  candidates: [],
  budgetCF: 1500,
};

// Restore seed from localStorage
const saved = localStorage.getItem('mejora_seed');
if (saved) state.seed = parseInt(saved, 10);

// ── DOM refs ─────────────────────────────────────────────────────────────────
const screens = {
  entry:   document.getElementById('screen-entry'),
  loading: document.getElementById('screen-loading'),
  results: document.getElementById('screen-results'),
};

// ── Screen navigation ────────────────────────────────────────────────────────
function showScreen(name) {
  Object.entries(screens).forEach(([k, el]) => {
    el.classList.toggle('active', k === name);
  });
  state.screen = name;
}

// ── Entry screen ─────────────────────────────────────────────────────────────
const pullsDisplay   = document.getElementById('pulls-display');
const analyzeBtn     = document.getElementById('btn-analyze');
const seedInputWrap  = document.getElementById('seed-input-wrap');
const seedDirectInput = document.getElementById('seed-direct');
const toggleSeedLink = document.getElementById('toggle-seed');
const cfInput        = document.getElementById('cf-input');
const selectedCount  = document.getElementById('selected-count');

const RARITY_ORDER = ['normal', 'rare', 'super', 'uber'];

document.querySelectorAll('.rarity-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (state.selectedPulls.length >= 5) return;
    const r = btn.dataset.rarity;
    state.selectedPulls.push(r);
    renderPullsDisplay();
    updateAnalyzeBtn();
  });
});

document.getElementById('btn-clear-pulls').addEventListener('click', () => {
  state.selectedPulls = [];
  renderPullsDisplay();
  updateAnalyzeBtn();
});

function renderPullsDisplay() {
  const count = state.selectedPulls.length;
  selectedCount.textContent = `${count} pull${count !== 1 ? 's' : ''} ingresado${count !== 1 ? 's' : ''}`;
  pullsDisplay.innerHTML = state.selectedPulls.map((r, i) =>
    `<span class="pull-chip" style="color:${RARITY_COLORS[r]};border-color:${RARITY_COLORS[r]}">
      Pull ${i + 1}: ${RARITY_LABELS[r]}
    </span>`
  ).join('');
}

function updateAnalyzeBtn() {
  analyzeBtn.disabled = state.selectedPulls.length < 2;
}

toggleSeedLink.addEventListener('click', (e) => {
  e.preventDefault();
  seedInputWrap.classList.toggle('hidden');
});

analyzeBtn.addEventListener('click', () => {
  state.budgetCF = parseInt(cfInput.value, 10) || 1500;

  const directVal = seedDirectInput.value.trim();
  if (directVal && !isNaN(directVal)) {
    state.seed = parseInt(directVal, 10) >>> 0;
    localStorage.setItem('mejora_seed', state.seed);
    showResults();
    return;
  }

  if (state.selectedPulls.length < 2) return;
  showScreen('loading');
  runSeedFinder();
});

// Also allow using saved seed directly
const useSavedBtn = document.getElementById('btn-use-saved');
if (useSavedBtn) {
  if (state.seed !== null) {
    useSavedBtn.classList.remove('hidden');
    useSavedBtn.textContent = `Usar seed guardado (${state.seed})`;
  }
  useSavedBtn.addEventListener('click', () => {
    state.budgetCF = parseInt(cfInput.value, 10) || 1500;
    showResults();
  });
}

// ── Seed finder ──────────────────────────────────────────────────────────────
const progressBar  = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const progressPct  = document.getElementById('progress-pct');

function runSeedFinder() {
  findSeedFromPulls(
    state.selectedPulls,
    (pct) => {
      progressBar.style.width = pct + '%';
      progressPct.textContent = pct + '%';
    },
    (candidates) => {
      state.candidates = candidates;
      if (candidates.length === 0) {
        progressText.textContent = 'No se encontró ningún seed. Revisá los pulls ingresados.';
        setTimeout(() => showScreen('entry'), 2500);
        return;
      }
      state.seed = candidates[0];
      localStorage.setItem('mejora_seed', state.seed);
      showResults();
    }
  );
}

// ── Results screen ───────────────────────────────────────────────────────────
function showResults() {
  if (state.seed === null) { showScreen('entry'); return; }

  const rec = getRecommendation(state.seed, state.budgetCF);
  renderResults(rec);
  showScreen('results');
}

function renderResults(rec) {
  // Headline card
  const card = document.getElementById('result-card');
  const statusColors = { green: '#22c55e', amber: '#f59e0b', red: '#ef4444' };
  card.style.borderColor = statusColors[rec.status];
  document.getElementById('result-msg').textContent = rec.message;
  document.getElementById('result-seed').textContent = `Seed: ${state.seed}`;

  if (rec.highlight) {
    document.getElementById('result-detail').innerHTML =
      `Pull #<strong>${rec.highlight.pull}</strong> &nbsp;•&nbsp; ` +
      `<strong style="color:${RARITY_COLORS['uber']}">${rec.highlight.unit?.name || 'Uber Rare'}</strong> &nbsp;•&nbsp; ` +
      `${rec.highlight.catFood} cat food`;
    document.getElementById('result-detail').style.display = '';
  } else {
    document.getElementById('result-detail').style.display = 'none';
  }

  // Timeline (first 30 pulls)
  const timeline = document.getElementById('pull-timeline');
  timeline.innerHTML = rec.pulls.slice(0, 30).map(p => {
    const isTarget = rec.highlight && p.pull === rec.highlight.pull;
    const bg = isTarget ? RARITY_COLORS[p.rarity] : 'transparent';
    const color = isTarget ? '#000' : RARITY_COLORS[p.rarity];
    const border = RARITY_COLORS[p.rarity];
    return `<div class="pull-cell ${isTarget ? 'target-pull' : ''}"
                 style="color:${color};border-color:${border};background:${bg}"
                 title="${p.unit?.name || p.rarity} (Track ${p.track})">
      <span class="pull-num">${p.pull}</span>
      <span class="pull-rarity">${rarityIcon(p.rarity)}</span>
    </div>`;
  }).join('');

  // Uber list
  const uberList = document.getElementById('uber-list');
  const ubers = rec.pulls.filter(p => p.rarity === 'uber').slice(0, 8);
  uberList.innerHTML = ubers.length
    ? ubers.map(p =>
        `<div class="uber-row">
          <span class="uber-pull">Pull #${p.pull}</span>
          <span class="uber-name" style="color:${RARITY_COLORS.uber}">${p.unit?.name || 'Uber Rare'}</span>
          <span class="uber-cost">${p.catFood} CF</span>
        </div>`
      ).join('')
    : `<p class="muted">No hay Uber Rare en los próximos 60 pulls.</p>`;

  // Candidates info
  if (state.candidates.length > 1) {
    document.getElementById('candidates-note').textContent =
      `Se encontraron ${state.candidates.length} seeds posibles. Mostrando el primero.`;
    document.getElementById('candidates-note').style.display = '';
  } else {
    document.getElementById('candidates-note').style.display = 'none';
  }
}

function rarityIcon(r) {
  return { uber: '★', super: '◆', rare: '●', normal: '○' }[r] || '?';
}

// ── Navigation buttons ───────────────────────────────────────────────────────
document.getElementById('btn-back').addEventListener('click', () => {
  showScreen('entry');
  state.selectedPulls = [];
  renderPullsDisplay();
  updateAnalyzeBtn();
});

document.getElementById('btn-recalculate').addEventListener('click', () => {
  state.budgetCF = parseInt(document.getElementById('cf-results').value, 10) || 1500;
  const rec = getRecommendation(state.seed, state.budgetCF);
  renderResults(rec);
});

document.getElementById('btn-forget-seed').addEventListener('click', () => {
  localStorage.removeItem('mejora_seed');
  state.seed = null;
  state.candidates = [];
  showScreen('entry');
  state.selectedPulls = [];
  renderPullsDisplay();
  updateAnalyzeBtn();
  if (useSavedBtn) useSavedBtn.classList.add('hidden');
});

// ── Init ─────────────────────────────────────────────────────────────────────
renderPullsDisplay();
updateAnalyzeBtn();

// Show saved seed button if we have one
if (state.seed !== null && useSavedBtn) {
  useSavedBtn.classList.remove('hidden');
  useSavedBtn.textContent = `Usar seed guardado (${state.seed})`;
}

showScreen('entry');
