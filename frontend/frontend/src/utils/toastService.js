export function showToast(message, duration = 3500) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, duration } }));
}
