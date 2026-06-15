const ADMIN_INACTIVITY_TIMEOUT = 30 * 60 * 1000;
let lastActivity = Date.now();
let checkInterval: ReturnType<typeof setInterval> | null = null;

export function resetAdminTimer() {
  lastActivity = Date.now();
}

export function startAdminSessionMonitor(onExpired: () => void) {
  lastActivity = Date.now();
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

  const handler = () => { lastActivity = Date.now(); };
  events.forEach(ev => window.addEventListener(ev, handler));

  if (checkInterval) clearInterval(checkInterval);
  checkInterval = setInterval(() => {
    if (Date.now() - lastActivity > ADMIN_INACTIVITY_TIMEOUT) {
      events.forEach(ev => window.removeEventListener(ev, handler));
      if (checkInterval) clearInterval(checkInterval);
      checkInterval = null;
      onExpired();
    }
  }, 60000);

  return () => {
    events.forEach(ev => window.removeEventListener(ev, handler));
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
  };
}
