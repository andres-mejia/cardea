"""Renderiza las pantallas del pitch como PNG.

La landing ya no usa estas imágenes: las suyas (public/img/*.webp) son capturas del panel real
en modo de ejemplo, para que coincidan con lo que se ve al entrar.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

from build_pitch import CSS, FONT_FACES
from pitch_ui import APP_CSS, s_actividad, s_costes, s_panel, s_politicas

OUT = Path(__file__).resolve().parents[2] / "frontend" / "cardea-web" / "public" / "img"
SCREENS = {"panel": s_panel, "costes": s_costes, "politicas": s_politicas, "actividad": s_actividad}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for name, fn in SCREENS.items():
            html = (f'<!doctype html><html lang="es"><head><meta charset="utf-8"><style>{FONT_FACES}{CSS}{APP_CSS}'
                    f'body{{background:transparent}} .wrap{{width:1060px;height:604px;display:flex;padding:0}}</style></head>'
                    f'<body><div class="wrap">{fn()}</div></body></html>')
            src = Path("/tmp/screen.html")
            src.write_text(html, encoding="utf-8")
            page = browser.new_page(viewport={"width": 1060, "height": 604}, device_scale_factor=2)
            page.goto(src.as_uri())
            page.wait_for_timeout(200)
            page.locator(".frame2").screenshot(path=str(OUT / f"{name}.png"), omit_background=True)
            page.close()
            print("ok", OUT / f"{name}.png")
        browser.close()


if __name__ == "__main__":
    main()
