/* Datos y utilidades compartidas por la página de usuario (index.html) y la de administrador (admin.html) */
window.RM = (() => {
  'use strict';
  const KEY = 'rm-burguer-v2', OLD = 'rm-burguer-v1';
  // PIN de demostración. Un PIN escrito en el navegador NO es seguridad real:
  // para proteger de verdad un panel necesitas un servidor con autenticación.
  const PIN = '1234';
  // Opcional: número de WhatsApp con lada de país (ej. '529981234567'). Vacío = WhatsApp pregunta a quién enviar.
  const WHATSAPP = '';
  const SECS = ['Burgers', 'Combos', 'Boxes', 'Aderezos'];

  const $ = (s, r = document) => r.querySelector(s);
  const money = n => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeSrc = u => (/^(https?:\/\/|data:image\/)/i.test(u || '') ? u : '');

  const COLORS = {
    Burgers: ['#f2b632', '#7a2a0a'], Combos: ['#ff8a3c', '#5a1d0a'],
    Boxes: ['#d6a23a', '#3a2a10'], Aderezos: ['#8bb43f', '#1f3a12']
  };

  /* Ilustración SVG (se usa cuando no hay foto): hamburguesa, o vasito de aderezo */
  function art(sec, bg = true) {
    const [a, b] = COLORS[sec] || COLORS.Burgers;
    const body = sec === 'Aderezos'
      ? `<path d="M-58 -62h116l-12 128h-92z" fill="#f3efe6"/><rect x="-66" y="-80" width="132" height="24" rx="10" fill="#d62828"/><rect x="-50" y="-20" width="100" height="44" fill="#f2b632"/>`
      : `<path d="M-110 -12C-110 -98 110 -98 110 -12Z" fill="#e59a2f"/>
<g fill="#fff3cf"><ellipse cx="-50" cy="-58" rx="7" ry="3.5"/><ellipse cx="-5" cy="-72" rx="7" ry="3.5"/><ellipse cx="45" cy="-58" rx="7" ry="3.5"/><ellipse cx="15" cy="-38" rx="7" ry="3.5"/><ellipse cx="-30" cy="-30" rx="7" ry="3.5"/></g>
<path d="M-122 -6q15 16 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0v10h-240z" fill="#5b9a2b"/>
<rect x="-112" y="6" width="224" height="10" rx="5" fill="#d62828"/>
<rect x="-118" y="30" width="236" height="26" rx="13" fill="#4a2616"/>
<path d="M-116 16h232l-22 22-16-12-16 12-16-12-16 12h-130z" fill="#ffc629"/>
<path d="M-112 58h224v6q0 26-30 26h-164q-30 0-30-26z" fill="#e59a2f"/>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>${bg ? '<rect width="400" height="300" fill="url(#g)"/>' : ''}<g transform="translate(200 150)">${body}</g></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  /* Reduce la foto subida para que quepa en localStorage */
  const fileToDataURL = file => new Promise((res, rej) => {
    const r = new FileReader();
    r.onerror = rej;
    r.onload = () => {
      const img = new Image();
      img.onerror = rej;
      img.onload = () => {
        const s = Math.min(1, 900 / img.width);
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * s);
        c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', 0.8));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });

  const SEED = {
    menu: [
      { id: 'm1', sec: 'Burgers', name: 'RM Clásica', price: 89, desc: 'Carne de res de 150 g, queso cheddar, lechuga, jitomate y la salsa de la casa.' },
      { id: 'm2', sec: 'Burgers', name: 'RM Doble Queso', price: 119, desc: 'Dos carnes, doble cheddar y cebolla caramelizada en pan brioche.' },
      { id: 'm3', sec: 'Burgers', name: 'RM BBQ Bacon', price: 135, desc: 'Tocino crujiente, aros de cebolla y salsa BBQ ahumada.' },
      { id: 'm4', sec: 'Burgers', name: 'RM Picosa', price: 125, desc: 'Jalapeño asado, queso pepper jack y mayonesa de chipotle.' },
      { id: 'm5', sec: 'Burgers', name: 'RM Pollo Crispy', price: 109, desc: 'Pechuga empanizada, col morada y miel con mostaza.' },
      { id: 'm6', sec: 'Burgers', name: 'RM Veggie', price: 99, desc: 'Hamburguesa de frijol negro y quinoa, con aguacate y lechuga.' },
      { id: 'm7', sec: 'Combos', name: 'RM Combo', price: 139, desc: 'RM Clásica, papas medianas y refresco.' },
      { id: 'm8', sec: 'Combos', name: 'RM Combo Doble', price: 169, desc: 'RM Doble Queso, papas medianas y refresco.' },
      { id: 'm9', sec: 'Boxes', name: 'RM Box Dúo', price: 259, desc: 'RM Clásica, RM Pollo Crispy, una hamburguesa infantil y 5 nuggets.' },
      { id: 'm10', sec: 'Boxes', name: 'RM Party Box', price: 899, desc: '12 RM Clásica sencillas para compartir.' },
      { id: 'm11', sec: 'Aderezos', name: 'Aderezo de la casa', price: 20, desc: 'La salsa de RM, en vasito.' },
      { id: 'm12', sec: 'Aderezos', name: 'Aderezo chipotle', price: 20, desc: 'Cremoso y con un picor ahumado.' },
      { id: 'm13', sec: 'Aderezos', name: 'Aderezo ranch', price: 20, desc: 'Fresco, con hierbas y ajo.' }
    ],
    insumos: [
      { id: 'i1', name: 'Carne de res molida', qty: 20, unit: 'kg', cost: 165 },
      { id: 'i2', name: 'Pan brioche', qty: 120, unit: 'pz', cost: 9 },
      { id: 'i3', name: 'Queso cheddar', qty: 8, unit: 'kg', cost: 210 },
      { id: 'i4', name: 'Tocino', qty: 5, unit: 'kg', cost: 190 },
      { id: 'i5', name: 'Lechuga romana', qty: 15, unit: 'pz', cost: 18 }
    ],
    sucursales: [
      { id: 's1', name: 'RM Centro', addr: 'Av. Ficticia 123, Centro, Cancún, Q. Roo', hours: 'Lunes a domingo, de 1:00 pm a 11:00 pm' },
      { id: 's2', name: 'RM Zona Hotelera', addr: 'Blvd. Ejemplo km 9, Zona Hotelera, Cancún, Q. Roo', hours: 'Lunes a domingo, de 12:00 pm a 12:00 am' },
      { id: 's3', name: 'RM Puerto', addr: 'Calle Demo 45, Puerto Morelos, Q. Roo', hours: 'Martes a domingo, de 2:00 pm a 10:00 pm' }
    ],
    info: {
      historia: 'RM Burguer nació de una idea sencilla: hacer hamburguesas como las de casa, pero mejor. Empezamos con una plancha, carne molida cada día y una salsa que sigue sin compartirse. Hoy atendemos en tres sucursales, con el mismo cuidado del primer día.',
      mision: 'Preparar hamburguesas frescas y sabrosas, con ingredientes de calidad y un servicio cercano, para que cada pedido sea una razón para volver.',
      vision: 'Ser la hamburguesería favorita de nuestra región, reconocida por su sabor, su calidad constante y su trato humano.',
      valores: [
        { t: 'Calidad', d: 'Ingredientes frescos y carne molida todos los días.' },
        { t: 'Sabor', d: 'Recetas propias, sin atajos.' },
        { t: 'Servicio', d: 'Atendemos como nos gustaría que nos atendieran.' },
        { t: 'Compromiso', d: 'Cumplimos los tiempos y cuidamos cada detalle.' }
      ],
      telefono: '+52 000 000 0000',
      email: 'contacto@rmburguer.example',
      whatsapp: '',
      redes: { instagram: 'https://www.instagram.com/', facebook: 'https://www.facebook.com/', tiktok: 'https://www.tiktok.com/' }
    }
  };

  const clone = o => structuredClone(o);
  const load = () => {
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      if (d && Array.isArray(d.menu) && Array.isArray(d.insumos) && Array.isArray(d.sucursales)) {
        d.info = { ...clone(SEED.info), ...d.info }; // datos guardados antes de existir esta sección
        return d;
      }
    } catch { /* sigue con la migración */ }
    try { // migra los datos de la versión anterior (solo hamburguesas e insumos)
      const o = JSON.parse(localStorage.getItem(OLD));
      if (o && Array.isArray(o.burgers)) {
        const d = clone(SEED);
        d.menu = [...o.burgers.map(({ id, name, price, desc, img }) => ({ id, name, price, desc, img, sec: 'Burgers' })),
                  ...SEED.menu.filter(m => m.sec !== 'Burgers')];
        if (Array.isArray(o.insumos)) d.insumos = o.insumos;
        return d;
      }
    } catch { /* usa la demostración */ }
    return clone(SEED);
  };

  const RM = {
    KEY, PIN, WHATSAPP, SECS, $, money, esc, safeSrc, COLORS, art, fileToDataURL,
    data: load(),
    save() {
      try { localStorage.setItem(KEY, JSON.stringify(RM.data)); return true; }
      catch { alert('No se pudo guardar: el almacenamiento del navegador está lleno. Prueba con una foto más pequeña.'); return false; }
    },
    reset() { localStorage.removeItem(KEY); RM.data = clone(SEED); }
  };
  return RM;
})();