// search.js — scoring and search wiring (ES module)
// Place this file in repo root or js/ folder and import from core.js

import { renderTools } from './render.js';

// Simple fuzzy score helper
export function fuzzyScore(a = '', b = '') {
  a = String(a).toLowerCase();
  b = String(b).toLowerCase();
  if (!a || !b) return 0;
  // exact substring boost
  if (a.includes(b) || b.includes(a)) return 10;
  // longest common subsequence-like simple match
  let i = 0, j = 0, matches = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { matches++; j++; }
    i++;
  }
  return matches;
}

// scoreTool: combines exact matches, tag boosts, and fuzzy contributions
export function scoreTool(tool = {}, query = "") {
  const name = (tool.name || "").toLowerCase();
  const description = (tool.description || "").toLowerCase();
  const tags = (tool.tags || []).map(t => String(t).toLowerCase());
  const words = String(query || "").toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;

  let totalScore = 0;
  words.forEach(word => {
    if (!word) return;

    // strong signals
    if (name.includes(word)) totalScore += 8;
    if (description.includes(word)) totalScore += 2;

    // tag exact match is very strong
    tags.forEach(tag => {
      if (!tag) return;
      if (tag === word) totalScore += 12;
      else if (tag.includes(word) || word.includes(tag)) totalScore += 5;
    });

    // fuzzy contributions (capped to avoid overpowering exact matches)
    totalScore += Math.min(fuzzyScore(name, word), 6);
    totalScore += Math.min(fuzzyScore(description, word), 3);
    tags.forEach(tag => { totalScore += Math.min(fuzzyScore(tag, word), 2); });
  });

  return totalScore;
}

// initSearch: wires the search input and renders results using renderTools
export function initSearch(allTools = []) {
  const input = document.getElementById('search');
  if (!input) {
    console.warn('initSearch: #search input not found');
    return;
  }

  input.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    if (!q) {
      // show top picks (first 6) when query is empty
      renderTools(allTools.slice(0, 6));
      return;
    }

    // score each tool and sort by score desc, then by rating as tiebreaker
    const scored = allTools
      .map(t => ({ t, s: scoreTool(t, q) }))
      .filter(x => x.s > 0)
      .sort((a, b) => {
        if (b.s !== a.s) return b.s - a.s;
        const ra = (a.t.rating || 0);
        const rb = (b.t.rating || 0);
        return rb - ra;
      })
      .map(x => x.t);

    // if nothing matched, show a helpful message card
    if (scored.length === 0) {
      renderTools([]);
      const container = document.getElementById('toolContainer');
      if (container) container.innerHTML = `<div class="tool-card"><p>No results for "${String(q).replace(/</g,'&lt;')}". Try different keywords.</p></div>`;
      return;
    }

    renderTools(scored);
  });

  // initial render: top picks
  renderTools(allTools.slice(0, 6));
}


