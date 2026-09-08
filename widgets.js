// widgets.js — Notes, Todo, Timer widgets (ES module)
// Place this file in repo root or js/ folder and import from core.js

// Notes widget
export function initNotes() {
  const notesArea = document.getElementById('notesArea');
  if (!notesArea) return;
  const KEY = 'onestart_notes';
  notesArea.value = localStorage.getItem(KEY) || '';

  const saveBtn = document.getElementById('saveNotes');
  const clearBtn = document.getElementById('clearNotes');

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      localStorage.setItem(KEY, notesArea.value);
      // small non-blocking feedback
      saveBtn.textContent = 'Saved';
      setTimeout(() => saveBtn.textContent = 'Save', 900);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!confirm('Clear all notes?')) return;
      notesArea.value = '';
      localStorage.removeItem(KEY);
    });
  }
}

// Todo widget
export function initTodo() {
  const listEl = document.getElementById('todoList');
  const input = document.getElementById('todoText');
  const addBtn = document.getElementById('addTodo');
  if (!listEl || !input || !addBtn) return;

  const KEY = 'onestart_todos';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  }
  function save(items) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }
  function render() {
    const items = load();
    listEl.innerHTML = items.map((it, idx) => {
      const doneClass = it.done ? 'done' : '';
      const safeText = String(it.text || '').replace(/</g,'&lt;');
      return `
        <li class="${doneClass}">
          <label><input type="checkbox" data-idx="${idx}" ${it.done ? 'checked' : ''}/> ${safeText}</label>
          <div>
            <button data-edit="${idx}" title="Edit">✎</button>
            <button data-del="${idx}" title="Delete">✕</button>
          </div>
        </li>
      `;
    }).join('');
  }

  addBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    const items = load();
    items.unshift({ text, done: false });
    save(items);
    input.value = '';
    render();
  });

  listEl.addEventListener('click', (e) => {
    const del = e.target.getAttribute('data-del');
    const edit = e.target.getAttribute('data-edit');
    const chk = e.target.closest('input[type="checkbox"]');

    if (del != null) {
      const idx = Number(del);
      const items = load();
      items.splice(idx, 1);
      save(items);
      render();
      return;
    }

    if (edit != null) {
      const idx = Number(edit);
      const items = load();
      const newText = prompt('Edit task', items[idx].text);
      if (newText != null) {
        items[idx].text = newText.trim();
        save(items);
        render();
      }
      return;
    }

    if (chk) {
      const idx = Number(chk.getAttribute('data-idx'));
      const items = load();
      items[idx].done = chk.checked;
      save(items);
      render();
    }
  });

  // initial render
  render();
}

// Timer widget
export function initTimer() {
  const display = document.getElementById('timerDisplay');
  const startBtn = document.getElementById('startTimer');
  const stopBtn = document.getElementById('stopTimer');
  const resetBtn = document.getElementById('resetTimer');
  if (!display || !startBtn || !stopBtn || !resetBtn) return;

  let interval = null;
  let seconds = 0;

  function updateDisplay() {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    display.textContent = `${mm}:${ss}`;
  }

  startBtn.addEventListener('click', () => {
    if (interval) return;
    interval = setInterval(() => { seconds++; updateDisplay(); }, 1000);
    startBtn.disabled = true;
    stopBtn.disabled = false;
  });

  stopBtn.addEventListener('click', () => {
    if (!interval) return;
    clearInterval(interval);
    interval = null;
    startBtn.disabled = false;
    stopBtn.disabled = true;
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(interval);
    interval = null;
    seconds = 0;
    updateDisplay();
    startBtn.disabled = false;
    stopBtn.disabled = true;
  });

  // initialize state
  updateDisplay();
  stopBtn.disabled = true;
}

