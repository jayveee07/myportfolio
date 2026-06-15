export function sanitizeText(text: string): string {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function sanitizeEmail(email: string): string {
  if (!email) return '';
  return email.toLowerCase().trim().replace(/[^a-z0-9@._+-]/g, '');
}

export function sanitizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^javascript:/i.test(trimmed)) return '';
  if (/^data:/i.test(trimmed) && !trimmed.startsWith('data:image/')) return '';
  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) return '';
    return parsed.toString();
  } catch {
    return '';
  }
}

export function sanitizeFileName(name: string): string {
  if (!name) return '';
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').slice(0, 255);
}

export function stripHtml(html: string): string {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

export const MESSAGE_MAX_LENGTH = 5000;
export const NAME_MAX_LENGTH = 100;
export const TEXTAREA_MAX_LENGTH = 10000;

export function truncate(str: string, max: number): string {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) : str;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
