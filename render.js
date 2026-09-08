// render.js — OneStart rendering helpers (ES module)
// Place this file in repo root or js/ folder and import from core.js

// Load tools.json and return parsed array
export async function loadTools() {
  try {
    const res = await fetch('tools.json');
    if (!res.ok) throw new Error('tools.json not found');
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data;
  } catch (err) {
    console.error('loadTools error:', err);
    return [];
  }
}

// Create a safe HTML string for a tool card
export function createToolCard(tool = {}) {
  const id = tool.id != null ? String(tool.id) : '';
  const name = String(tool.name || 'Unknown').replace(/</g, '&lt;');
  const desc = String(tool.description || '').replace(/</g, '&lt;');
  const rating = tool.rating != null ? String(tool.rating) : '—';
  const tags = (tool.tags || []).slice(0, 3)
    .map(t => `<span class="tag">#${String(t).replace(/</g,'&lt;')}</span>`)
    .join(' ');
  const link = tool.link ? String(tool.link) : '#';

  return `
    <div class="tool-card" data-id="${id}">
      <h3>${name} <small>⭐ ${rating}</small></h3>
      <p>${desc}</p>
      <div class="tags">${tags}</div>
      <a class="visit" href="${link}" target="_blank" rel="noopener noreferrer">Visit Tool →</a>
    </div>
  `;
}

// Render an array of tool objects into #toolContainer
export function renderTools(list = []) {
  const container = document.getElementById('toolContainer');
  if (!container) return;
  // Defensive: ensure list is an array
  const safeList = Array.isArray(list) ? list : [];
  container.innerHTML = safeList.map(createToolCard).join('');
}

// Small helper to render a single message card (error / empty state)
export function renderMessage(message = '') {
  const container = document.getElementById('toolContainer');
  if (!container) return;
  container.innerHTML = `<div class="tool-card"><p>${String(message).replace(/</g,'&lt;')}</p></div>`;
}

