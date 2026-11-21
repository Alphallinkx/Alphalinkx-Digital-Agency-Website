/* Alphalinkx hero — "service journey" scene. Framework-free, needs GSAP 3.
   Mounts the responsive scene and returns playback and cleanup controls.
   Loop: a signal leaves Website → SEO → your shop → Ads → AI → Booked Call, each piece reacts as it arrives. */
/**
 * @param {HTMLElement} root
 * @param {{ gsap: typeof import('gsap').default, assets: string, delay: number, id: string }} options
 */
function initHeroJourney(root, { gsap, assets, delay, id }) {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const glowId = `${id}-glow`;
  const nodeId = `${id}-node`;
  const NS = 'http://www.w3.org/2000/svg';
  const SIZE = { website: [226, 224], seo: [200, 194], ads: [198, 184], ai: [186, 200], booked: [320, 288], center: [886, 616] };
  const KEYS = Object.keys(SIZE);

  /* Layouts in logical px. obj: top-left of each cutout. Wires: cubic points tagged with what they follow. */
  const LAYOUTS = {
    wide: {
      w: 1916, h: 700, dy: -70,
      obj: { website: [108, 322], seo: [404, 162], center: [450, 112], ads: [1040, 100], ai: [1320, 210], booked: [1536, 330] },
      depth: { website: 1, seo: 0.85, center: 0.3, ads: 0.85, ai: 0.9, booked: 1 },
      shadows: { website: [222, 600, 230, 34], center: [895, 726, 840, 60], booked: [1690, 642, 310, 40] },
      window: [400, 313, 156, 122], ring: [895, 722],
      nodes: [['n1', 383, 403], ['n2', 660, 252], ['center', 987, 224], ['n4', 1287, 285], ['booked', 1545, 488]],
      wires: [
        { to: 'seo', p: [['website', 318, 428], ['website', 350, 425], ['n1', 365, 412], ['n1', 383, 403], ['n1', 405, 390], ['seo', 425, 362], ['seo', 446, 336]] },
        { to: 'center', p: [['seo', 588, 262], ['seo', 615, 254], ['n2', 640, 250], ['n2', 660, 252], ['n2', 685, 254], ['center', 703, 262], ['center', 724, 274]] },
        { to: 'ads', p: [['center', 987, 224], ['center', 1008, 212], ['ads', 1030, 200], ['ads', 1054, 198]] },
        { to: 'ai', p: [['ads', 1222, 234], ['ads', 1248, 254], ['n4', 1266, 280], ['n4', 1287, 285], ['n4', 1306, 290], ['ai', 1316, 300], ['ai', 1334, 306]] },
        { to: 'booked', p: [['ai', 1440, 396], ['ai', 1452, 450], ['booked', 1500, 486], ['booked', 1545, 488]] },
      ],
    },
    compact: {
      w: 1000, h: 1260, dy: 34,
      obj: { website: [30, 40], seo: [400, 55], ads: [760, 60], center: [57, 330], ai: [210, 960], booked: [560, 930] },
      depth: { website: 1, seo: 1, ads: 1, center: 0.3, ai: 1, booked: 1 },
      shadows: { center: [500, 950, 800, 56], ai: [303, 1180, 170, 26], booked: [720, 1210, 290, 34] },
      window: [400, 313, 156, 122], ring: [500, 946],
      nodes: [['n1', 345, 128], ['n2', 680, 188], ['center', 594, 442], ['n4', 280, 935], ['booked', 572, 1062]],
      wires: [
        { to: 'seo', p: [['website', 250, 150], ['website', 300, 122], ['n1', 320, 122], ['n1', 345, 128], ['n1', 370, 134], ['seo', 392, 150], ['seo', 412, 160]] },
        { to: 'ads', p: [['seo', 592, 150], ['seo', 640, 180], ['n2', 660, 188], ['n2', 680, 188], ['n2', 700, 188], ['ads', 735, 172], ['ads', 768, 156]] },
        { to: 'center', p: [['ads', 860, 236], ['ads', 860, 340], ['center', 650, 360], ['center', 594, 442]] },
        { to: 'ai', p: [['center', 200, 880], ['center', 190, 915], ['n4', 255, 925], ['n4', 280, 935], ['n4', 300, 942], ['ai', 300, 955], ['ai', 300, 975]] },
        { to: 'booked', p: [['ai', 388, 1060], ['ai', 450, 1062], ['booked', 520, 1062], ['booked', 572, 1062]] },
      ],
    },
  };

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
  KEYS.forEach((k) => {
    const d = mk('div', `hj-obj hj-${k}`, stage);
    const img = mk('img', '', d);
    Object.assign(img, { src: `${assets}/${k}.webp`, alt: '', draggable: false, width: SIZE[k][0], height: SIZE[k][1] });
    if (k === 'center') img.fetchPriority = 'high';
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
  const S = { intro: zero(), lift: zero(), halo: zero(), draw: [0, 0, 0, 0, 0], prog: [0, 0, 0, 0, 0], node: [0, 0, 0, 0, 0], ring: 0, win: 0, spark: 0 };
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const PH = { website: 0, seo: 1.3, center: 2.1, ads: 2.9, ai: 3.8, booked: 4.6, n1: 0.7, n2: 1.9, n4: 3.3 };
  let L = LAYOUTS.wide;
  let tl, introTl;
  let elapsed = 0;
  let reduce = motionPreference.matches;
  let inView = true;
  let playing = true;
  let ticking = false;
  S.intro.center = 1;

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
      const [cx, cy] = centerOf(k), [mx, my] = centerOf('center'), back = 1 - S.intro[k];
      const fly = k === 'center' ? [0, back * 60] : [(mx - cx) * back * 0.7, (my - cy) * back * 0.7];
      o[k] = [m.x * 22 * d + fly[0], Math.sin(t * (0.9 + d * 0.3) + PH[k]) * amp * f + m.y * 12 * d - S.lift[k] + fly[1]];
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
      const d = L.depth[k], it = S.intro[k];
      const sc = (k === 'center' ? 0.94 + it * 0.06 : 0.35 + it * 0.65) * (1 + S.lift[k] * 0.004);
      const ry = reduce ? 0 : mouse.x * 9 * d, rx = reduce ? 0 : -mouse.y * 7 * d;
      objEl[k].style.transform = `translate(${o[k][0]}px,${o[k][1]}px) perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${sc})`;
      objEl[k].style.opacity = Math.min(1, it * 1.4);
      glowEl[k].style.opacity = S.halo[k];
      glowEl[k].style.transform = `translate(${o[k][0]}px,${o[k][1]}px) scale(${0.8 + S.halo[k] * 0.3})`;
      const lift = o[k][1] - (k === 'center' ? (1 - it) * 60 : 0);
      shEl[k].style.opacity = it * Math.max(0.2, 0.9 - lift * 0.015);
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
    const i = gsap.timeline({ delay });
    ['website', 'seo', 'ads', 'ai', 'booked'].forEach((k, n) => {
      i.to(S.intro, { [k]: 1, duration: 0.9, ease: 'back.out(1.5)' }, 0.35 + n * 0.09);
    });
    L.wires.forEach((_, n) => i.to(S.draw, { [n]: 1, duration: 0.45, ease: 'power2.inOut' }, 1.0 + n * 0.16));
    i.call(() => { tl = loop(); }, null, '+=0.3');
    return i;
  }

  function syncPlayback() {
    const active = playing && inView && !reduce && !document.hidden;
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
    KEYS.forEach((key) => { S.intro[key] = reduce || key === 'center' ? 1 : 0; });
    S.draw.fill(reduce ? 1 : 0);
    if (!reduce) introTl = intro();
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
  const centerImage = objEl.center.querySelector('img');
  const revealStage = () => { root.dataset.ready = 'true'; };
  if (centerImage.complete && centerImage.naturalWidth) revealStage();
  else centerImage.addEventListener('load', revealStage, { once: true });

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

  return {
    setPlaying(value) {
      playing = value;
      syncPlayback();
    },
    dispose() {
      gsap.ticker.remove(render);
      introTl?.kill();
      tl?.kill();
      resize.disconnect();
      intersection.disconnect();
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', syncPlayback);
      motionPreference.removeEventListener('change', syncPreference);
      centerImage.removeEventListener('load', revealStage);
      delete root.dataset.ready;
      root.replaceChildren();
    },
  };
}

export { initHeroJourney };
