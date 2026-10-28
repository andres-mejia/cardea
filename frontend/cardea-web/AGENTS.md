# Landing (cardea.ai)

- Astro 5, salida estática, sin React: HTML, CSS con tokens `--cardea-*` y el JavaScript mínimo del formulario.
- Las capturas de `public/img/` las genera `docs/pitch/render_screens.py` desde las pantallas del pitch: no se editan a mano; si cambia una pantalla, se regeneran. Llevan siempre la etiqueta «Datos ilustrativos».
- Copy en castellano, directo, sin superlativos ni clichés de IA. Lo que el producto no cubre se dice en la propia landing (sección Alcance).
- Variables de build: `PUBLIC_WAITLIST_ENDPOINT` y `PUBLIC_APP_URL` (`.env.example`). Sin endpoint, el formulario simula el envío.
