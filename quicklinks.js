// quicklinks.js — Quick Links grid and editor (ES module)
// Place this file in repo root or js/ folder and import from core.js

const QUICK_KEY = 'onestart_quicklinks';

// Load quick links from localStorage, return array
export function loadQuickLinks() {
  try {
    const raw = localStorage.getItem(QUICK_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('loadQuickLinks parse error', e);
    return [];
  }
}

// Save quick links array to localStorage
export function saveQuickLinks(list = []) {
  try {
    localStorage.setItem(QUICK_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('saveQuickLinks error', e);
  }
}

// Render the compact quick links grid used in the main UI
export function renderQuickLinksGrid() {
  const grid = document.getElementById('linksGrid');
  if (!grid) return;
  const list = loadQuickLinks();
  if (!list || list.length === 0) {
    grid.innerHTML = `<a class="quick" href="https://mail.google.com" target="_blank" rel="noopener noreferrer">Gmail</a>
                      <a class="quick" href="https://drive.google.com" target="_blank" rel="noopener noreferrer">Drive</a>
                      <a class="quick" href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">Calendar</a>`;
    return;
  }
  grid.innerHTML = list.map(l => {
    const safeName = String(l.name || '').replace(/</g,'&lt;');
    const safeUrl = String(l.url || '#').replace(/"/g,'&quot;');
    return `<a class="quick" href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeName}</a>`;
  }).join(' ');
}

// Render the full editor UI inside #linksList
export function renderQuickLinksEditor() {
  const container = document.getElementById('linksList');
  if (!container) return;
  const list = loadQuickLinks();
  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML = `<div class="muted">No quick links yet. Add one below.</div>`;
    return;
  }
  container.innerHTML = list.map((l, i) => {
    const safeName = String(l.name || '').replace(/</g,'&lt;');
    const safeUrl = String(l.url || '').replace(/</g,'&lt;');
    return `
      <div class="link-item" data-idx="${i}">
        <div><a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeName}</a></div>
        <div class="link-controls">
          <button data-edit="${i}" title="Edit">✎</button>
          <button data-up="${i}" title="Move up">↑</button>
          <button data-down="${i}" title="Move down">↓</button>
          <button data-del="${i}" title="Delete">✕</button>
        </div>
      </div>
    `;
  }).join('');
}

// Initialize editor wiring and ensure defaults exist
export function initQuickLinksEditor() {
  // ensure defaults if none exist
  if (!localStorage.getItem(QUICK_KEY)) {
    const defaults = [
      { name: 'Gmail', url: 'https://mail.google.com' },
      { name: 'Drive', url: 'https://drive.google.com' },
      { name: 'Calendar', url: 'https://calendar.google.com' }
    ];
    saveQuickLinks(defaults);
  }

  // initial render
  renderQuickLinksGrid();
  renderQuickLinksEditor();

  // Add link handler
  const addBtn = document.getElementById('addLink');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const nameEl = document.getElementById('linkName');
      const urlEl = document.getElementById('linkUrl');
      if (!nameEl || !urlEl) return;
      const name = nameEl.value.trim();
      let url = urlEl.value.trim();
      if (!name || !url) { alert('Provide name and URL'); return; }
      // normalize URL: add protocol if missing
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      const list = loadQuickLinks();
      list.unshift({ name, url });
      saveQuickLinks(list);
      nameEl.value = '';
      urlEl.value = '';
      renderQuickLinksGrid();
      renderQuickLinksEditor();
    });
  }

  // Editor click delegation for edit, move, delete
  const listContainer = document.getElementById('linksList');
  if (!listContainer) return;
  listContainer.addEventListener('click', (e) => {
    const del = e.target.getAttribute('data-del');
    const edit = e.target.getAttribute('data-edit');
    const up = e.target.getAttribute('data-up');
    const down = e.target.getAttribute('data-down');

    if (del != null) {
      const idx = Number(del);
      const list = loadQuickLinks();
      if (idx >= 0 && idx < list.length) {
        if (!confirm(`Delete "${list[idx].name}"?`)) return;
        list.splice(idx, 1);
        saveQuickLinks(list);
        renderQuickLinksGrid();
        renderQuickLinksEditor();
      }
      return;
    }

    if (up != null || down != null) {
      const idx = Number(up ?? down);
      const list = loadQuickLinks();
      const swapWith = up != null ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= list.length) return;
      [list[idx], list[swapWith]] = [list[swapWith], list[idx]];
      saveQuickLinks(list);
      renderQuickLinksGrid();
      renderQuickLinksEditor();
      return;
    }

    if (edit != null) {
      const idx = Number(edit);
      const list = loadQuickLinks();
      if (idx < 0 || idx >= list.length) return;
      const item = list[idx];
      const newName = prompt('Edit name', item.name);
      if (newName == null) return;
      const newUrl = prompt('Edit URL', item.url);
      if (newUrl == null) return;
      let normalizedUrl = newUrl.trim();
      if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = 'https://' + normalizedUrl;
      list[idx] = { name: newName.trim(), url: normalizedUrl };
      saveQuickLinks(list);
      renderQuickLinksGrid();
      renderQuickLinksEditor();
    }
  });
}

