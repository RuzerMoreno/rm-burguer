/* Página de usuario: menú, sucursales y carrito, con animaciones GSAP + ScrollTrigger */
(() => {
  'use strict';
  const { $, money, esc, safeSrc, art } = RM;

  /* Si tienes fotos reales, ponlas en img/ y escribe aquí su ruta (ej. 'img/hero.png') */
  const FOTOS = { hero: '', expand: '' };
  const CART_KEY = 'rm-burguer-cart';

  // Si tu sistema tiene "reducir movimiento", agrega ?motion=on a la URL para ver las animaciones
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches && !/[?&]motion=on/.test(location.search);
  const useGsap = !!(window.gsap && window.ScrollTrigger) && !reduce;
  if (!window.gsap || !window.ScrollTrigger) console.warn('RM Burguer: GSAP no cargó. Revisa tu conexión o el bloqueador de contenido.');
  else if (reduce) console.info('RM Burguer: animaciones desactivadas porque el sistema pide reducir movimiento. Abre index.html?motion=on para verlas.');
  if (useGsap) gsap.registerPlugin(ScrollTrigger);

  let tab = 'Todo', ctx, branch = '';
  let cart = (() => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; } })();
  const grid = $('#grid');

  const saveCart = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* sin guardado */ } };
  const lines = () => Object.entries(cart)
    .map(([id, q]) => ({ m: RM.data.menu.find(x => x.id === id), q }))
    .filter(l => l.m && l.q > 0);
  const total = () => lines().reduce((s, l) => s + l.m.price * l.q, 0);
  const count = () => lines().reduce((s, l) => s + l.q, 0);

  /* ---------- Menú ---------- */
  function renderTabs() {
    const secs = ['Todo', ...RM.SECS.filter(s => RM.data.menu.some(m => m.sec === s))];
    if (!secs.includes(tab)) tab = 'Todo';
    $('#tabs').innerHTML = secs.map(s => `<button type="button" data-tab="${esc(s)}" aria-pressed="${s === tab}">${esc(s)}</button>`).join('');
  }

  function renderMenu() {
    if (ctx) ctx.revert();
    const list = RM.data.menu.filter(m => tab === 'Todo' || m.sec === tab);
    grid.innerHTML = list.length ? list.map(m => `
      <article class="card">
        <div class="card__img"><img src="${esc(safeSrc(m.img) || art(m.sec))}" alt="${esc(m.name)}" loading="lazy"></div>
        <div class="card__body">
          <span class="tag">${esc(m.sec)}</span>
          <h3>${esc(m.name)}</h3>
          <p>${esc(m.desc || '')}</p>
          <div class="card__foot">
            <span class="price">${money(m.price)}</span>
            <button class="btn btn--sm" type="button" data-add="${m.id}">Agregar</button>
          </div>
        </div>
      </article>`).join('')
      : '<p class="empty">Por ahora no hay productos en esta sección.</p>';

    if (useGsap) {
      ctx = gsap.context(() => {
        gsap.utils.toArray('.card').forEach(card => {
          // La foto se expande al entrar en pantalla
          gsap.fromTo($('.card__img', card),
            { clipPath: 'inset(14% 14% 14% 14% round 18px)' },
            { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
              scrollTrigger: { trigger: card, start: 'top 95%', end: 'top 50%', scrub: true } });
          // Parallax interno de la foto
          gsap.fromTo($('img', card), { yPercent: -6 },
            { yPercent: 6, ease: 'none',
              scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
        });
      }, grid);
      ScrollTrigger.refresh();
    }
  }

  /* ---------- Sucursales ---------- */
  function renderBranches() {
    $('#branches').innerHTML = RM.data.sucursales.length ? RM.data.sucursales.map(s => `
      <article class="branch">
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.addr)}</p>
        <p>${esc(s.hours)}</p>
        <button class="btn btn--ghost btn--sm" type="button" data-pick="${s.id}">Pedir en esta sucursal</button>
      </article>`).join('')
      : '<p class="empty">Pronto publicaremos nuestras sucursales.</p>';
  }

  /* ---------- Nosotros, contacto y redes (se editan en el panel) ---------- */
  const safeUrl = u => (/^https?:\/\//i.test(u || '') ? u : '');
  const digits = s => String(s || '').replace(/\D/g, '');

  function renderInfo() {
    const i = RM.data.info;
    $('#aboutText').textContent = i.historia;
    $('#misionText').textContent = i.mision;
    $('#visionText').textContent = i.vision;
    $('#values').innerHTML = (i.valores || []).map(v =>
      `<article class="value"><h3>${esc(v.t)}</h3><p>${esc(v.d)}</p></article>`).join('');

    const c = [];
    if (i.telefono) c.push(['Teléfono', `<a href="tel:${esc(i.telefono.replace(/[^\d+]/g, ''))}">${esc(i.telefono)}</a>`]);
    if (i.email) c.push(['Correo', `<a href="mailto:${esc(i.email)}">${esc(i.email)}</a>`]);
    if (digits(i.whatsapp)) c.push(['WhatsApp', `<a href="https://wa.me/${digits(i.whatsapp)}" target="_blank" rel="noopener">Escríbenos</a>`]);
    $('#contactList').innerHTML = c.map(([k, v]) => `<li><span>${k}</span>${v}</li>`).join('')
      || '<li><span>Contacto</span>Próximamente</li>';

    const redes = [['Instagram', i.redes && i.redes.instagram], ['Facebook', i.redes && i.redes.facebook], ['TikTok', i.redes && i.redes.tiktok]]
      .filter(([, u]) => safeUrl(u));
    document.querySelectorAll('.socials').forEach(el => {
      el.innerHTML = redes.map(([n, u]) => `<a href="${esc(safeUrl(u))}" target="_blank" rel="noopener">${n}</a>`).join('');
    });
  }

  /* ---------- Carrito ---------- */
  function renderCart() {
    const ls = lines();
    const sel = $('#branch');
    if (!RM.data.sucursales.some(s => s.id === branch)) branch = (RM.data.sucursales[0] || {}).id || '';
    sel.innerHTML = RM.data.sucursales.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
    sel.value = branch;
    $('#cartCount').textContent = count();
    $('#cartLines').innerHTML = ls.length ? ls.map(({ m, q }) => `
      <li>
        <div><strong>${esc(m.name)}</strong><span>${money(m.price * q)}</span></div>
        <div class="qty">
          <button type="button" data-act="dec" data-id="${m.id}" aria-label="Quitar uno de ${esc(m.name)}">−</button>
          <span>${q}</span>
          <button type="button" data-act="inc" data-id="${m.id}" aria-label="Agregar uno de ${esc(m.name)}">+</button>
        </div>
      </li>`).join('')
      : '<li>Aún no agregas nada. Elige algo del menú.</li>';
    $('#cartTotal').textContent = money(total());
    $('#sendOrder').disabled = !ls.length || !branch;
  }

  const setCart = open => { $('#cart').classList.toggle('open', open); $('#scrim').classList.toggle('open', open); };

  /* ---------- Animaciones GSAP + ScrollTrigger ---------- */
  function setupScroll() {
    $('#heroImg').src = FOTOS.hero || art('Burgers', false);
    $('#expandImg').src = FOTOS.expand || art('Burgers');
    if (!useGsap) return;

    // 1) Parallax del hero: cada capa se mueve a distinta velocidad
    gsap.utils.toArray('[data-speed]').forEach(el => {
      gsap.to(el, {
        yPercent: +el.dataset.speed, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    });

    // 2) La imagen se fija y se expande hasta ocupar toda la pantalla
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '.expand', start: 'top top', end: '+=100%', pin: true, scrub: 0.6 }
    })
      .fromTo('#expandFrame', { clipPath: 'inset(18% 28% 18% 28% round 28px)' },
                              { clipPath: 'inset(0% 0% 0% 0% round 0px)' })
      .fromTo('#expandImg', { scale: 1.35 }, { scale: 1 }, 0)
      .fromTo('.expand__text', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0 }, 0.5);

    ScrollTrigger.refresh();
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* ---------- Eventos ---------- */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-tab],[data-add],[data-act],[data-pick]');
    if (!t) return;
    if (t.dataset.tab) { tab = t.dataset.tab; renderTabs(); renderMenu(); return; }
    if (t.dataset.add) {
      cart[t.dataset.add] = (cart[t.dataset.add] || 0) + 1;
      saveCart(); renderCart(); $('#cartMsg').textContent = '';
      const old = t.textContent; t.textContent = 'Agregado';
      setTimeout(() => { t.textContent = old; }, 900);
      return;
    }
    if (t.dataset.act) {
      const id = t.dataset.id, q = (cart[id] || 0) + (t.dataset.act === 'inc' ? 1 : -1);
      if (q > 0) cart[id] = q; else delete cart[id];
      saveCart(); renderCart(); return;
    }
    if (t.dataset.pick) { branch = t.dataset.pick; renderCart(); setCart(true); }
  });

  $('#openCart').addEventListener('click', () => setCart(true));
  $('#closeCart').addEventListener('click', () => setCart(false));
  $('#scrim').addEventListener('click', () => setCart(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setCart(false); });
  $('#branch').addEventListener('change', e => { branch = e.target.value; });

  $('#sendOrder').addEventListener('click', () => {
    const s = RM.data.sucursales.find(x => x.id === branch);
    if (!s || !lines().length) return;
    const name = $('#custName').value.trim();
    let text = `Pedido para ${s.name}\n`;
    if (name) text += `A nombre de ${name}\n`;
    text += '\n' + lines().map(({ m, q }) => `${q} x ${m.name} (${money(m.price * q)})`).join('\n') + `\n\nTotal: ${money(total())}`;
    window.open(`https://wa.me/${digits(RM.data.info.whatsapp || RM.WHATSAPP)}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    cart = {}; saveCart(); renderCart();
    $('#cartMsg').textContent = 'Listo: se abrió WhatsApp con tu pedido de demostración.';
  });

  // Si el administrador cambia el menú en otra pestaña, esta se actualiza sola
  window.addEventListener('storage', e => { if (e.key === RM.KEY) location.reload(); });

  renderTabs();
  renderMenu();
  renderBranches();
  renderInfo();
  renderCart();
  setupScroll();
})();