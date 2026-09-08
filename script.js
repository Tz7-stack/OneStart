// script.js (module) — OneStart core: load tools, search, render, widgets

// Load tools.json (fallback to empty array)
async function loadTools() {
  try {
    const res = await fetch('tools.json');
    if (!res.ok) throw new Error('tools.json not found');
    return await res.json();
  } catch (e) {
    console.error('Failed to load tools.json', e);
    return [];
  }
}

// Scoring function (safe, returns numeric score)
function scoreTool(tool = {}, query = "") {
  const name = (tool.name || "").toLowerCase();
  const description = (tool.description || "").toLowerCase();
  const tags = (tool.tags || []).map(t => String(t).toLowerCase());
  const words = String(query || "").toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  let totalScore = 0;
  words.forEach(word => {
    if (!word) return;
    if (name.includes(word)) totalScore += 7;
    if (description.includes(word)) totalScore += 2;
    (tags || []).forEach(tag => {
      if (!tag) return;
      if (tag === word) totalScore += 10;
      else if (tag.includes(word) || word.includes(tag)) totalScore += 4;
    });
  });
  return totalScore;
}

// Build a tool card as HTML string (safe-escaped)
function createToolCard(tool = {}) {
  const name = (tool.name || "Unknown").replace(/</g,'&lt;');
  const rating = tool.rating != null ? tool.rating : "—";
  const tags = (tool.tags || []).slice(0,3).map(t => `<span class="tag">#${String(t).replace(/</g,'&lt;')}</span>`).join(' ');
  const link = tool.link ? String(tool.link) : "#";
  return `
    <div class="tool-card" data-id="${tool.id || ''}">
      <h3>${name} <small>⭐ ${rating}</small></h3>
      <p>${(tool.description||'').replace(/</g,'&lt;')}</p>
      <div class="tags">${tags}</div>
      <a class="visit" href="${link}" target="_blank" rel="noopener noreferrer">Visit Tool →</a>
    </div>
  `;
}

// Render list of tools into container
function renderTools(list = []) {
  const container = document.getElementById('toolContainer');
  if (!container) return;
  container.innerHTML = list.map(createToolCard).join('');
}

// Quick links (example set)
function renderQuickLinks() {
  const links = [
    {name:'Gmail', url:'https://mail.google.com'},
    {name:'Drive', url:'https://drive.google.com'},
    {name:'Calendar', url:'https://calendar.google.com'}
  ];
  const grid = document.getElementById('linksGrid');
  grid.innerHTML = links.map(l => `<a class="quick" href="${l.url}" target="_blank" rel="noopener noreferrer">${l.name}</a>`).join(' ');
}

// Notes widget (localStorage)
function initNotes() {
  const notesArea = document.getElementById('notesArea');
  notesArea.value = localStorage.getItem('onestart_notes') || '';
  document.getElementById('saveNotes').addEventListener('click', () => {
    localStorage.setItem('onestart_notes', notesArea.value);
    alert('Notes saved locally');
  });
  document.getElementById('clearNotes').addEventListener('click', () => {
    notesArea.value = '';
    localStorage.removeItem('onestart_notes');
  });
}

// Todo widget (localStorage)
function initTodo() {
  const listEl = document.getElementById('todoList');
  const input = document.getElementById('todoText');
  const storageKey = 'onestart_todos';

  function load() {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  }
  function save(items) {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }
  function render() {
    const items = load();
    listEl.innerHTML = items.map((it, idx) => `
      <li>
        <label><input type="checkbox" data-idx="${idx}" ${it.done ? 'checked' : ''}/> ${it.text}</label>
        <button data-del="${idx}">✕</button>
      </li>
    `).join('');
  }

  document.getElementById('addTodo').addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    const items = load();
    items.unshift({text, done:false});
    save(items);
    input.value = '';
    render();
  });

  listEl.addEventListener('click', e => {
    const del = e.target.getAttribute('data-del');
    if (del != null) {
      const items = load();
      items.splice(Number(del),1);
      save(items);
      render();
      return;
    }
    const chk = e.target.closest('input[type="checkbox"]');
    if (chk) {
      const idx = Number(chk.getAttribute('data-idx'));
      const items = load();
      items[idx].done = chk.checked;
      save(items);
      render();
    }
  });

  render();
}

// Timer widget
function initTimer() {
  const display = document.getElementById('timerDisplay');
  let interval = null, seconds = 0;
  function update() {
    const mm = String(Math.floor(seconds/60)).padStart(2,'0');
    const ss = String(seconds % 60).padStart(2,'0');
    display.textContent = `${mm}:${ss}`;
  }
  document.getElementById('startTimer').addEventListener('click', () => {
    if (interval) return;
    interval = setInterval(()=>{ seconds++; update(); }, 1000);
  });
  document.getElementById('stopTimer').addEventListener('click', () => {
    clearInterval(interval); interval = null;
  });
  document.getElementById('resetTimer').addEventListener('click', () => {
    clearInterval(interval); interval = null; seconds = 0; update();
  });
  update();
}

// Search wiring and initial render
function initSearch(allTools) {
  const input = document.getElementById('search');
  input.addEventListener('input', e => {
    const q = e.target.value.trim();
    if (!q) return renderTools(allTools.slice(0,6));
    const scored = allTools.map(t => ({t, s: scoreTool(t, q)}))
                           .filter(x => x.s > 0)
                           .sort((a,b) => b.s - a.s)
                           .map(x => x.t);
    renderTools(scored);
  });
  renderTools(allTools.slice(0,6));
}

// Boot sequence
(async function boot() {
  renderQuickLinks();
  initNotes();
  initTodo();
  initTimer();
  const tools = await loadTools();
  initSearch(tools);
})();

