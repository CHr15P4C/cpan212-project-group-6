// Escape every character that has a special meaning in a regular expression,
// so user input is always matched as plain text (no regex injection).
export function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
