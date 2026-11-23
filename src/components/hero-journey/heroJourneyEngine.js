import { LAYOUTS, SIZE } from './heroJourneyLayout';

/* Alphalinkx hero — "service journey" scene. Framework-free, needs GSAP 3.
   Mounts the responsive scene and returns a cleanup function.
   Loop: a signal leaves Website → SEO → your shop → Ads → AI → Booked Call, each piece reacts as it arrives. */
/**
 * @param {HTMLElement} root
 * @param {{ gsap: typeof import('gsap').default, assets: string, id: string, entrance: Promise<unknown> }} options
 */
function initHeroJourney(root, { gsap, assets, id, entrance }) {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const glowId = `${id}-glow`;
  const nodeId = `${id}-node`;
  const NS = 'http://www.w3.org/2000/svg';
  const KEYS = Object.keys(SIZE);

  /* ---------- build DOM ---------- */
  root.replaceChildren();
  const stage = mk('div', 'hj-stage', root);
  const shEl = {}, glowEl = {}, objEl = {};
  KEYS.forEach((k) => { shEl[k] = mk('div', 'hj-shadow', stage); });
  const ring = mk('div', 'hj-ring', stage);
  KEYS.forEach((k) => { glowEl[k] = mk('div', 'hj-halo', stage); });
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'hj-wires'); svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<defs><filter id="${glowId}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <radialGradient id="${nodeId}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffa169"/><stop offset=".55" stop-color="#f2640f"/><stop offset="1" stop-color="#d44f05"/></radialGradient></defs>`;
  stage.appendChild(svg);
  svg.style.setProperty('--hj-filter', `url(#${glowId})`);
  const layers = { shadow: g('hj-w-shadow'), base: g('hj-w-base'), hi: g('hj-w-hi'), comet: g('hj-w-comet') };
  const wireEls = [0, 1, 2, 3, 4].map(() => ({
    shadow: p(layers.shadow), base: p(layers.base), hi: p(layers.hi), comet: p(layers.comet),
  }));
  const imageDecodes = [];
  let disposed = false;
  KEYS.forEach((k) => {
    const d = mk('div', `hj-obj hj-${k}`, stage);
    const img = mk('img', '', d);
    if (['center', 'website', 'seo'].includes(k)) img.fetchPriority = 'high';
    Object.assign(img, { src: `${assets}/${k}.webp`, alt: '', draggable: false, width: SIZE[k][0], height: SIZE[k][1] });
    imageDecodes.push(img.decode());
    d.style.width = SIZE[k][0] + 'px'; d.style.height = SIZE[k][1] + 'px';
    objEl[k] = d;
  });
  const win = mk('div', 'hj-window', objEl.center);
  const nodeG = g('hj-nodes');
  const nodeEls = [0, 1, 2, 3, 4].map(() => {
    const n = document.createElementNS(NS, 'g');
    n.innerHTML = `<ellipse cy="10" rx="11" ry="3.5" fill="rgba(170,90,90,.25)"/><circle r="12.5" fill="url(#${nodeId})"/><ellipse cx="-4" cy="-5" rx="4.5" ry="2.8" fill="rgba(255,255,255,.55)"/>`;
    nodeG.appendChild(n); return n;
  });
  const dot = g('hj-dot'); dot.innerHTML = `<circle r="15" fill="rgba(255,120,40,.35)" filter="url(#${glowId})"/><circle r="6.5" fill="#fff6ee"/>`;
  const sparkBox = mk('div', 'hj-sparks', stage);
  const sparks = Array.from({ length: 9 }, () => mk('i', '', sparkBox));

  function mk(tag, cls, parent) { const e = document.createElement(tag); if (cls) e.className = cls; parent.appendChild(e); return e; }
  function g(cls) { const e = document.createElementNS(NS, 'g'); e.setAttribute('class', cls); svg.appendChild(e); return e; }
  function p(parent) { const e = document.createElementNS(NS, 'path'); parent.appendChild(e); return e; }

  /* ---------- state ---------- */
  const zero = () => Object.fromEntries(KEYS.map((k) => [k, 0]));
  const S = { lift: zero(), halo: zero(), draw: [0, 0, 0, 0, 0], prog: [0, 0, 0, 0, 0], node: [0, 0, 0, 0, 0], ring: 0, win: 0, spark: 0 };
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const PH = { website: 0, seo: 1.3, center: 2.1, ads: 2.9, ai: 3.8, booked: 4.6, n1: 0.7, n2: 1.9, n4: 3.3 };
  let L = LAYOUTS.wide;
  let tl, introTl;
  let elapsed = 0;
  let reduce = motionPreference.matches;
  let inView = false;
  let ticking = false;
  let imagesReady = false;

  const centerOf = (k) => [L.obj[k][0] + SIZE[k][0] / 2, L.obj[k][1] + SIZE[k][1] / 2 + L.dy];

  function layout() {
    const W = root.clientWidth;
    const previous = L;
    L = W < 720 ? LAYOUTS.compact : LAYOUTS.wide;
    const s = Math.min(W / L.w, L === LAYOUTS.wide ? 1 : 1.2);
    Object.assign(stage.style, { width: L.w + 'px', height: L.h + 'px', transform: `translateX(${(W - L.w * s) / 2}px) scale(${s})` });
    root.style.height = L.h * s + 'px';
    svg.setAttribute('viewBox', `0 0 ${L.w} ${L.h}`);
    KEYS.forEach((k) => {
      const [x, y] = L.obj[k];
      Object.assign(objEl[k].style, { left: x + 'px', top: y + L.dy + 'px' });
      const [cx, cy] = centerOf(k), hw = SIZE[k][0] * 0.62, hh = SIZE[k][1] * 0.62;
      Object.assign(glowEl[k].style, { left: cx - hw + 'px', top: cy - hh + 'px', width: hw * 2 + 'px', height: hh * 2 + 'px' });
      const sd = L.shadows[k];
      shEl[k].style.display = sd ? '' : 'none';
      if (sd) Object.assign(shEl[k].style, { left: sd[0] - sd[2] / 2 + 'px', top: sd[1] + L.dy - sd[3] / 2 + 'px', width: sd[2] + 'px', height: sd[3] + 'px' });
    });
    const [wx, wy, ww, wh] = L.window;
    Object.assign(win.style, { left: wx + 'px', top: wy + 'px', width: ww + 'px', height: wh + 'px' });
    Object.assign(ring.style, { left: L.ring[0] + 'px', top: L.ring[1] + L.dy + 'px' });
    const [bx, by] = centerOf('booked');
    Object.assign(sparkBox.style, { left: bx + 'px', top: by + 'px' });

    if (previous !== L && tl) {
      tl.kill();
      resetSignal();
      tl = loop();
      tl.paused(!ticking);
    }
    render();
  }

  function offsets(t) {
    const f = reduce ? 0 : 1, m = reduce ? { x: 0, y: 0 } : mouse, o = {};
    for (const k of KEYS) {
      const d = L.depth[k], amp = k === 'center' ? 3 : 8;
      o[k] = [m.x * 22 * d, Math.sin(t * (0.9 + d * 0.3) + PH[k]) * amp * f + m.y * 12 * d - S.lift[k]];
    }
    for (const n of ['n1', 'n2', 'n4']) o[n] = [m.x * 16, Math.sin(t * 1.6 + PH[n]) * 4 * f + m.y * 9];
    return o;
  }

  const pathD = (pts) => {
    let d = `M${pts[0]}`;
    for (let i = 1; i + 2 < pts.length; i += 3) d += `C${pts[i]} ${pts[i + 1]} ${pts[i + 2]}`;
    return d;
  };

  function render(_time, delta = 0) {
    elapsed += Math.min(delta / 1000, 0.06);
    mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06;
    const o = offsets(elapsed);
    for (const k of KEYS) {
      const d = L.depth[k];
      const sc = 1 + S.lift[k] * 0.004;
      const ry = reduce ? 0 : mouse.x * 9 * d, rx = reduce ? 0 : -mouse.y * 7 * d;
      objEl[k].style.transform = `translate(${o[k][0]}px,${o[k][1]}px) perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${sc})`;
      glowEl[k].style.opacity = S.halo[k];
      glowEl[k].style.transform = `translate(${o[k][0]}px,${o[k][1]}px) scale(${0.8 + S.halo[k] * 0.3})`;
      const lift = o[k][1];
      shEl[k].style.opacity = Math.max(0.2, 0.9 - lift * 0.015);
      shEl[k].style.transform = `translateX(${o[k][0] * 0.5}px) scale(${1 + lift * 0.01})`;
    }
    const wireLengths = L.wires.map((w, i) => {
      const pts = w.p.map(([k, x, y]) => `${x + o[k][0]},${y + L.dy + o[k][1]}`);
      const d = pathD(pts), e = wireEls[i];
      [e.shadow, e.base, e.hi, e.comet].forEach((q) => q.setAttribute('d', d));
      return e.base.getTotalLength();
    });
    wireEls.forEach((e, i) => {
      const len = wireLengths[i];
      [e.shadow, e.base, e.hi].forEach((q) => {
        if (S.draw[i] >= 1) q.style.strokeDasharray = 'none';
        else { q.style.strokeDasharray = `${len} ${len}`; q.style.strokeDashoffset = len * (1 - S.draw[i]); }
      });
      const seg = 80, pr = S.prog[i];
      e.comet.style.strokeDasharray = `${seg} ${len + seg * 2}`;
      e.comet.style.strokeDashoffset = seg - pr * (len + seg);
      e.comet.style.opacity = pr > 0 && pr < 1 ? 1 : 0;
      if (pr > 0 && pr < 1) {
        const pt = e.base.getPointAtLength(Math.min(pr * (len + seg), len));
        dot.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
      }
    });
    dot.style.opacity = S.prog.some((v) => v > 0 && v < 1) ? 1 : 0;
    L.nodes.forEach(([k, x, y], i) => {
      const shown = Math.max(0, Math.min(1, (S.draw[i] - 0.25) * 3));
      nodeEls[i].setAttribute('transform', `translate(${x + o[k][0]} ${y + L.dy + o[k][1]}) scale(${shown * (1 + S.node[i] * 0.5)})`);
    });
    win.style.opacity = S.win;
    ring.style.opacity = S.ring > 0 && S.ring < 1 ? 1 - S.ring : 0;
    ring.style.transform = `translate(-50%,-50%) scale(${0.3 + S.ring * 1.2})`;
    sparkBox.style.transform = `translate(${o.booked[0]}px,${o.booked[1]}px)`;
    sparks.forEach((sp, i) => {
      const a = -100 + i * 25;
      sp.style.opacity = S.spark > 0 && S.spark < 1 ? 1 - S.spark : 0;
      sp.style.transform = `rotate(${a}deg) translateY(${-(Math.abs(a) > 60 ? 175 : 150) - S.spark * 70}px) scaleY(${1 - S.spark * 0.7})`;
    });
  }

  /* ---------- timelines ---------- */
  function react(k, tlx, at) {
    tlx.to(S.lift, { [k]: 16, duration: 0.16, ease: 'power2.out' }, at)
      .to(S.lift, { [k]: 0, duration: 0.8, ease: 'elastic.out(1,0.35)' }, '>')
      .fromTo(S.halo, { [k]: 0 }, { [k]: k === 'center' ? 0.45 : 0.9, duration: 0.2 }, '<-0.1')
      .to(S.halo, { [k]: 0, duration: 1.0 }, '>0.2');
  }

  function resetSignal() {
    S.lift = zero();
    S.halo = zero();
    S.prog.fill(0);
    S.node.fill(0);
    S.ring = S.win = S.spark = 0;
  }

  function loop() {
    const k = gsap.timeline({ onComplete: () => { tl = loop(); } });
    react(L.wires[0].p[0][0], k, 0);
    L.wires.forEach((w, i) => {
      const T = 0.3 + i * 0.95, A = T + 0.75;
      k.fromTo(S.prog, { [i]: 0 }, { [i]: 1, duration: 0.75, ease: 'power1.inOut', immediateRender: false }, T)
        .to(S.node, { [i]: 1, duration: 0.12, yoyo: true, repeat: 1 }, T + 0.32)
        .set(S.prog, { [i]: 0 }, A + 0.01);
      react(w.to, k, A - 0.05);
      if (w.to === 'center') {
        k.fromTo(S, { ring: 0 }, { ring: 1, duration: 1.1, ease: 'power2.out', immediateRender: false }, A)
          .to(S, { win: 1, duration: 0.25 }, A).to(S, { win: 0.3, duration: 1.4 }, A + 0.3);
      }
      if (w.to === 'booked') k.fromTo(S, { spark: 0 }, { spark: 1, duration: 0.8, ease: 'power2.out', immediateRender: false }, A);
    });
    k.to(S, { win: 0, duration: 0.6 }, '>').to({}, { duration: 1.4 });
    return k;
  }

  function intro() {
    const i = gsap.timeline();
    L.wires.forEach((_, n) => i.to(S.draw, { [n]: 1, duration: 0.45, ease: 'power2.inOut' }, 0.28 + n * 0.12));
    i.call(() => { tl = loop(); }, null, '+=0.3');
    return i;
  }

  function syncPlayback() {
    const active = imagesReady && inView && !reduce && !document.hidden;
    if (ticking !== active) {
      ticking = active;
      if (active) gsap.ticker.add(render);
      else gsap.ticker.remove(render);
    }
    introTl?.paused(!active);
    tl?.paused(!active);
  }

  function syncPreference() {
    reduce = motionPreference.matches;
    introTl?.kill();
    tl?.kill();
    introTl = tl = undefined;
    resetSignal();
    mouse.x = mouse.y = mouse.tx = mouse.ty = 0;
    S.draw.fill(reduce ? 1 : 0);
    if (!reduce && imagesReady) introTl = intro();
    syncPlayback();
    render();
  }

  const onMove = (event) => {
    if (!ticking || event.pointerType === 'touch') return;
    const rect = root.getBoundingClientRect();
    mouse.tx = (event.clientX - rect.left) / rect.width * 2 - 1;
    mouse.ty = (event.clientY - rect.top) / rect.height * 2 - 1;
  };
  const onLeave = () => { mouse.tx = 0; mouse.ty = 0; };

  layout();
  syncPreference();
  Promise.allSettled([...imageDecodes, entrance]).then(() => {
    if (disposed) return;
    imagesReady = true;
    root.dataset.ready = 'true';
    if (!reduce) introTl = intro();
    syncPlayback();
  });

  const resize = new ResizeObserver(layout);
  resize.observe(root);
  const intersection = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncPlayback();
  });
  intersection.observe(root);

  root.addEventListener('pointermove', onMove, { passive: true });
  root.addEventListener('pointerleave', onLeave);
  document.addEventListener('visibilitychange', syncPlayback);
  motionPreference.addEventListener('change', syncPreference);

  return () => {
    disposed = true;
    gsap.ticker.remove(render);
    introTl?.kill();
    tl?.kill();
    resize.disconnect();
    intersection.disconnect();
    root.removeEventListener('pointermove', onMove);
    root.removeEventListener('pointerleave', onLeave);
    document.removeEventListener('visibilitychange', syncPlayback);
    motionPreference.removeEventListener('change', syncPreference);
    delete root.dataset.ready;
    root.replaceChildren();
  };
}

export { initHeroJourney };
