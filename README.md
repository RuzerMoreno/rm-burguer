# RM Burguer · Menú y pedidos

Sitio de una marca ficticia de hamburguesas (RM Burguer), hecho como proyecto de portafolio.

## Qué incluye

**Página de usuario (`index.html`)**
- Tema oscuro, con parallax por capas en la portada y una imagen que se fija y se expande al hacer scroll (GSAP + ScrollTrigger).
- Menú por secciones: Burgers, Combos, Boxes y Aderezos.
- Carrito de pedido con total en pesos, elección de sucursal y envío del resumen por WhatsApp (pedido de demostración).
- Sucursales ficticias con dirección y horario.
- Secciones de Quiénes somos, Misión, Visión, Valores, Contacto y redes sociales (Instagram, Facebook y TikTok).

**Página de administrador (`admin.html`)**
- Acceso con PIN (demostración: `1234`, se cambia en `js/shared.js`).
- Editar la información del negocio (historia, misión, visión, valores, teléfono, correo, WhatsApp y redes sociales).
- Agregar y eliminar productos del menú (con foto subida o enlace), sucursales e insumos, con el valor total del inventario.
- Los cambios se ven al instante en el sitio de usuario.

## Estructura

```
rm-burguer/
├── index.html      (página de usuario)
├── admin.html      (página de administrador)
├── css/styles.css
├── js/shared.js    (datos y utilidades compartidas)
├── js/app.js       (menú, carrito y animaciones)
├── js/admin.js     (panel de administrador)
└── README.md
```

## Probarlo

Abre `index.html` con Live Server (VS Code) o con `python -m http.server 8000`.
Si no ves las animaciones y tu sistema tiene "reducir movimiento" activado, abre `index.html?motion=on`.

## Publicarlo en GitHub Pages

1. Sube estos archivos a un repositorio nuevo.
2. En **Settings → Pages** elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`.
3. En unos minutos estará en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

## Personalizar

- **Fotos reales:** crea `img/`, copia tus fotos y escribe sus rutas en `FOTOS` al inicio de `js/app.js`. Para cada producto puedes subir su foto desde el panel.
- **Datos iniciales:** edita `SEED` en `js/shared.js`.
- **Textos, contacto y redes:** edítalos en el panel de administrador (bloque "Información del negocio") o cambia `info` dentro de `SEED` en `js/shared.js`. El número de WhatsApp que pongas ahí también recibe los pedidos.
- **Colores:** variables al inicio de `css/styles.css`.

## Notas

- El PIN está escrito en el código del navegador: sirve para la demostración, pero no es seguridad real. Para proteger un panel de verdad se necesita un servidor con autenticación.
- Los datos viven en el navegador (`localStorage`): cada visitante ve y guarda su propia copia. Para datos compartidos haría falta un backend con base de datos.
- Si ya habías usado la versión anterior, tus hamburguesas se conservan y pasan a la sección Burgers.
- GSAP y las tipografías se cargan desde internet.