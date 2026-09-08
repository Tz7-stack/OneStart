// core.js — OneStart bootstrap (place in repo root or js/ folder)
// Usage: include <script type="module" src="core.js"></script> in index.html

// Import modules (create these files next: render.js, search.js, widgets.js, quicklinks.js, settings.js, shortcuts.js, storage.js)
import { renderQuickLinksGrid, renderQuickLinksEditor } from './quicklinks.js';
import { initNotes, initTodo, initTimer } from './widgets.js';
import { initSearch } from './search.js';
import { addExportImportControls } from './storage.js';
import { initSettingsUI } from './settings.js';
import { initShortcuts } from './shortcuts.js';
import { loadTools } from './render.js'; // loadTools returns parsed tools.json

// Boot sequence: initialize UI and widgets in a predictable order
export async function boot() {
  // Render static parts that don't need tools.json
  renderQuickLinksGrid();
  renderQuickLinksEditor();

  // Widgets
  initNotes();
  initTodo();
  initTimer();

  // Settings and export/import UI
  addExportImportControls();
  initSettingsUI();

  // Keyboard shortcuts
  initShortcuts();

  // Load tools and wire search (search will render top picks)
  const tools = await loadTools();
  initSearch(tools);
}

// Auto-run on module load
boot().catch(err => {
  console.error('OneStart boot failed', err);
  // Optionally show a minimal error message in the UI
  const container = document.getElementById('toolContainer');
  if (container) container.innerHTML = '<div class="tool-card">Failed to load tools. Check console.</div>';
});

