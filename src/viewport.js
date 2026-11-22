// Chrome <=107 uses the largest mobile viewport for vh, not the visible one.
export function trackViewport(host = globalThis) {
  const root = host.document.documentElement;
  const visual = host.visualViewport;
  function update() {
    const inner = host.innerHeight;
    const visible = visual && (!visual.scale || visual.scale === 1) ? visual.height : inner;
    const height = Math.floor(Math.min(inner, visible || inner));
    if (height > 0) root.style.setProperty('--app-height', `${height}px`);
  }
  function schedule() {
    update();
  }
  update();
  host.addEventListener('resize', schedule);
  host.addEventListener('orientationchange', schedule);
  host.addEventListener('pageshow', schedule);
  visual?.addEventListener('resize', schedule);
  return () => {
    host.removeEventListener('resize', schedule);
    host.removeEventListener('orientationchange', schedule);
    host.removeEventListener('pageshow', schedule);
    visual?.removeEventListener('resize', schedule);
  };
}
