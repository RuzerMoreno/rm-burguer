/* Página de administrador: editar menú, sucursales e insumos */
(() => {
  'use strict';
  const { $, money, esc, safeSrc, art, fileToDataURL } = RM;
  const loggedIn = () => sessionStorage.getItem('rm-admin') === '1';
  const notify = t => { $('#msg').textContent = t; };
  const empty = (cols, t) => `<tr><td colspan="${cols}">${t}</td></tr>`;
  const delBtn = (kind, id, name) => `<button class="del" type="button" data-kind="${kind}" data-del="${id}" aria-label="Eliminar ${esc(name)}">✕</button>`;

  function show() {
    const ok = loggedIn();
    $('#login').hidden = ok;
    $('#panel').hidden = !ok;
    $('#logout').hidden = !ok;
    if (ok) render();
  }

  function render() {
    const { menu, sucursales, insumos } = RM.data;
    $('#secSel').innerHTML = RM.SECS.map(s => `<option>${esc(s)}</option>`).join('');

    $('#menuBody').innerHTML = menu.length ? menu.map(m => `
      <tr>
        <td><img class="thumb" src="${esc(safeSrc(m.img) || art(m.sec))}" alt=""></td>
        <td>${esc(m.name)}</td><td>${esc(m.sec)}</td><td>${money(m.price)}</td>
        <td>${delBtn('menu', m.id, m.name)}</td>
      </tr>`).join('') : empty(5, 'El menú está vacío. Agrega el primer producto.');

    $('#branchBody').innerHTML = sucursales.length ? sucursales.map(s => `
      <tr><td>${esc(s.name)}</td><td>${esc(s.addr)}</td><td>${esc(s.hours)}</td><td>${delBtn('sucursales', s.id, s.name)}</td></tr>`).join('')
      : empty(4, 'No hay sucursales. Agrega la primera.');

    $('#insumosBody').innerHTML = insumos.length ? insumos.map(i => `
      <tr>
        <td>${esc(i.name)}</td><td>${i.qty} ${esc(i.unit)}</td><td>${money(i.cost)}</td><td>${money(i.qty * i.cost)}</td>
        <td>${delBtn('insumos', i.id, i.name)}</td>
      </tr>`).join('') : empty(5, 'No hay insumos. Agrega el primero.');
    $('#insumosTotal').textContent = money(insumos.reduce((s, i) => s + i.qty * i.cost, 0));
  }

  /* Acceso con PIN */
  $('#loginForm').addEventListener('submit', e => {
    e.preventDefault();
    if ($('#pin').value === RM.PIN) {
      sessionStorage.setItem('rm-admin', '1');
      $('#pinError').textContent = '';
      $('#pin').value = '';
      show();
    } else {
      $('#pinError').textContent = 'PIN incorrecto. Inténtalo de nuevo.';
    }
  });
  $('#logout').addEventListener('click', () => { sessionStorage.removeItem('rm-admin'); notify(''); show(); });

  /* Agregar un elemento a una lista, guardar y refrescar */
  function add(kind, item, okText, form) {
    RM.data[kind].push(item);
    if (!RM.save()) { RM.data[kind].pop(); return; }
    form.reset();
    render();
    notify(okText);
  }

  $('#menuForm').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.currentTarget, f = new FormData(form);
    const file = form.elements.foto.files[0];
    const img = file ? await fileToDataURL(file).catch(() => '') : safeSrc(String(f.get('url')).trim());
    const name = String(f.get('nombre')).trim();
    add('menu', { id: 'x' + Date.now(), sec: f.get('sec'), name, price: +f.get('precio'), desc: String(f.get('desc') || '').trim(), img },
        `Se agregó "${name}". Ya aparece en el menú.`, form);
  });

  $('#branchForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget, f = new FormData(form);
    const name = String(f.get('nombre')).trim();
    add('sucursales', { id: 'x' + Date.now(), name, addr: String(f.get('addr')).trim(), hours: String(f.get('hours')).trim() },
        `Se agregó la sucursal "${name}".`, form);
  });

  $('#insumoForm').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget, f = new FormData(form);
    const name = String(f.get('nombre')).trim();
    add('insumos', { id: 'x' + Date.now(), name, qty: +f.get('qty'), unit: f.get('unit'), cost: +f.get('cost') },
        `Se agregó el insumo "${name}".`, form);
  });

  /* Eliminar */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-del]');
    if (!b) return;
    RM.data[b.dataset.kind] = RM.data[b.dataset.kind].filter(x => x.id !== b.dataset.del);
    RM.save();
    render();
    notify('Elemento eliminado.');
  });

  $('#reset').addEventListener('click', () => {
    if (!confirm('¿Restablecer los datos de demostración? Se borrarán tus cambios.')) return;
    RM.reset();
    render();
    notify('Datos de demostración restablecidos.');
  });

  show();
})();
