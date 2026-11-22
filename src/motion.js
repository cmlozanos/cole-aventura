// Scene-scoped, cancellable Web Animations: no canvas, downloads or frame loop.
export function createMotion(host = globalThis) {
  let enabled = true;
  const running = new Set();
  const reduced = () => host.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function stop() { for (const animation of running) animation.cancel(); running.clear(); }
  function animate(element, frames, options) {
    if (!enabled || reduced() || !element?.animate) return;
    const animation = element.animate(frames, options);
    running.add(animation);
    animation.finished.then(() => running.delete(animation), () => running.delete(animation));
  }
  return {
    get enabled() { return enabled; },
    toggle() { enabled = !enabled; if (!enabled) stop(); return enabled; },
    stop,
    enter(main) {
      stop();
      animate(main, [{opacity:0},{opacity:1}], {duration:260,easing:'ease-out'});
      main.querySelectorAll('.answer,.game-tile').forEach((node,index) => animate(node,
        [{opacity:0,transform:'scale(.92)'},{opacity:1,transform:'scale(1)'}],
        {duration:220,delay:index*35,easing:'cubic-bezier(.2,.8,.3,1)',fill:'backwards'}));
    },
    feedback(main,correct) {
      stop();
      const target = main.querySelector('.answer.correct,.answer.retry');
      animate(target, correct ? [{transform:'scale(1)'},{transform:'scale(.94)'},{transform:'scale(1)'}] : [{transform:'translateX(0)'},{transform:'translateX(-3px)'},{transform:'translateX(3px)'},{transform:'translateX(0)'}], {duration:320});
      if (correct) main.querySelectorAll('.celebration i').forEach((node,index) => animate(node,
        [{opacity:0,transform:'translateY(12px) scale(.4)'},{opacity:1,offset:.3},{opacity:0,transform:`translateY(-${35+index%3*12}px) scale(1.1) rotate(${index*25}deg)`}],
        {duration:850,delay:index*30,easing:'ease-out',fill:'both'}));
    }
  };
}
