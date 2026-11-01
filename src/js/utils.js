export const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
export function linkify(text = '') {
  const escaped = escapeHTML(text);
  return escaped.replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)])/gi, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}
export function toast(message) {
  let el = document.querySelector('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.append(el); }
  el.textContent = message; el.classList.add('show'); clearTimeout(window.__toastTimer); window.__toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
export function sharePage(title = document.title, text = '') {
  const data = { title, text, url: location.href };
  if (navigator.share) return navigator.share(data).catch(() => {});
  return navigator.clipboard?.writeText(location.href).then(() => toast('Page link copied')).catch(() => toast('Copy the page URL from your browser'));
}
export function safeExternal(url = '') {
  const value=String(url||'').trim(); if(value.startsWith('/')&&!value.startsWith('//')) return value;
  try { const parsed = new URL(value); return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : '#'; } catch { return '#'; }
}
export async function getJSON(path) {
  const response = await fetch(path, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.json();
}
export function renderBlocks(blocks = []) {
  return blocks.map(block => {
    if (block.type === 'heading') return `<h${Math.max(2, Math.min(4, Number(block.level) || 2))}>${escapeHTML(block.text || '')}</h${Math.max(2, Math.min(4, Number(block.level) || 2))}>`;
    if (block.type === 'list') return `<ul>${(block.items || []).map(item => `<li>${linkify(item)}</li>`).join('')}</ul>`;
    if (block.type === 'quote') return `<blockquote>${linkify(block.text || '')}</blockquote>`;
    if (block.type === 'image') return `<figure><img loading="lazy" src="${safeExternal(block.src || '')}" alt="${escapeHTML(block.alt || '')}"><figcaption>${escapeHTML(block.caption || '')}</figcaption></figure>`;
    return `<p>${linkify(block.text || '')}</p>`;
  }).join('');
}
export function formatDate(value) {
  if (!value) return 'Article';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Article' : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
export function getCurrentSlug() { return location.pathname.replace(/\/$/, '').split('/').pop() || ''; }
