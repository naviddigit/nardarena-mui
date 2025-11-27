// Timer Web Worker - runs in background thread (harder to manipulate)
// This prevents timer manipulation and continues running when tab is minimized

let timerId = null;
let startTime = null;
let targetTime = null;

self.addEventListener('message', (e) => {
  const { type, duration } = e.data;

  if (type === 'START') {
    // Clear any existing timer
    if (timerId) {
      clearInterval(timerId);
    }

    // Record start and target times
    startTime = Date.now();
    targetTime = startTime + duration * 1000;

    // Send initial update
    self.postMessage({
      type: 'TICK',
      remaining: duration,
    });

    // Update every 100ms for accuracy (even when main thread is busy)
    timerId = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((targetTime - now) / 1000));

      self.postMessage({
        type: 'TICK',
        remaining,
      });

      if (remaining <= 0) {
        clearInterval(timerId);
        timerId = null;
        self.postMessage({
          type: 'COMPLETE',
        });
      }
    }, 100);
  } else if (type === 'STOP') {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    startTime = null;
    targetTime = null;
  } else if (type === 'PING') {
    // Health check to ensure worker is alive
    self.postMessage({
      type: 'PONG',
    });
  }
});
