# Landing (cardea.ai)

- Astro 7, salida estática, sin React: HTML, CSS con tokens `--cardea-*` y JavaScript mínimo (formulario, flujo del hero, carrusel, apariciones). Sin cookies ni recursos de terceros: si algo nuevo los necesita, se autoaloja o se actualiza antes la política de cookies.
- Español en `/` e inglés en `/en/`, con el i18n de Astro. Los textos viven en `src/i18n/es.ts` y `src/i18n/en.ts` (misma forma) y las rutas equivalentes en `src/i18n/routes.mjs`; los componentes no llevan copy.
- Las capturas de `public/img/` las genera `docs/pitch/render_screens.py` desde las pantallas del pitch: no se editan a mano; si cambia una pantalla, se regeneran. Llevan siempre la etiqueta «Datos ilustrativos».
- Copy directo en los dos idiomas, sin superlativos ni clichés de IA. Lo que el producto no cubre se dice en la propia landing (sección Alcance).
- Variables de build: `PUBLIC_WAITLIST_ENDPOINT` y `PUBLIC_APP_URL` (`.env.example`). Sin endpoint, el formulario simula el envío.
