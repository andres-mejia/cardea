"""Genera el pitch en PDF (21 paginas 16:9) con mockups de UI y diagrama de arquitectura."""
from pathlib import Path
from playwright.sync_api import sync_playwright

from pitch_ui import (APP_CSS, s_actividad, s_conexiones, s_costes, s_devs, s_evidencias, s_mobile, s_panel,
                      s_politicas)

NAME = "Cardea"
OUT = Path(__file__).resolve().parent / "cardea-pitch.pdf"
TOTAL = 21

FONT_DIR = Path(__file__).resolve().parent / "fonts"
FONT_FACES = "".join(
    f"@font-face {{ font-family: 'Archivo'; font-weight: {w}; font-style: normal; "
    f"src: url('{(FONT_DIR / f'archivo-latin-{w}-normal.woff2').as_uri()}') format('woff2'); }}\n"
    for w in (400, 500, 600, 700))

CSS = """
@page { size: 1280px 720px; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { font-family: 'Archivo', 'Liberation Sans', sans-serif; color: #12263A; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.slide { width: 1280px; height: 720px; padding: 44px 48px 40px; position: relative; page-break-after: always; overflow: hidden; background: #FFFFFF; }
.slide:last-child { page-break-after: auto; }
h1, h2, h3 { font-family: 'Archivo', sans-serif; font-weight: 600; letter-spacing: -0.02em; }
h2 { font-size: 30px; line-height: 1.18; }
p { font-size: 15px; line-height: 1.5; color: #3B4F63; }
.foot { position: absolute; left: 48px; right: 48px; bottom: 16px; display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; color: #7A8A99; }
.cover { background: #12263A; color: #FFFFFF; padding: 72px 80px; }
.cover h1 { font-size: 92px; line-height: 1; }
.cover .lock { display: flex; align-items: center; gap: 26px; margin-top: 96px; }
.cover .desc { font-size: 20px; color: #6CCBD3; margin-top: 18px; font-weight: 500; }
.cover .sub { font-size: 27px; line-height: 1.3; color: #CFE4E8; max-width: 860px; margin-top: 28px; font-weight: 400; }
.cover .meta { position: absolute; left: 80px; bottom: 64px; font-size: 14px; color: #9FB4C4; line-height: 1.6; }
.cover .rule { width: 96px; height: 6px; background: #6CCBD3; margin-top: 36px; }
.two { display: flex; gap: 32px; height: 604px; }
.two .txt { width: 268px; flex: none; padding-top: 6px; }
.two .txt h2 { font-size: 27px; }
.two .txt p { margin-top: 14px; font-size: 14px; }
.two .txt .q { margin-top: 22px; border-top: 1px solid #D9E0E6; padding-top: 14px; }
.two .txt .q div { font-size: 13px; line-height: 1.4; color: #12263A; margin-top: 9px; padding-left: 12px; border-left: 3px solid #0A6F7D; }
.two .txt .q span { font-size: 11.5px; color: #7A8A99; }
.frame { flex: 1; border: 1px solid #C9D3DC; border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; background: #F3F6F8; }
.chrome { height: 26px; background: #E6ECF1; border-bottom: 1px solid #C9D3DC; display: flex; align-items: center; padding: 0 12px; gap: 6px; flex: none; }
.chrome i { width: 8px; height: 8px; border-radius: 50%; background: #B7C3CE; display: block; }
.chrome b { margin-left: 14px; font-weight: 400; font-size: 10px; color: #6B7C8C; background: #FFFFFF; border-radius: 4px; padding: 2px 10px; }
.app { flex: 1; display: flex; min-height: 0; }
.side { width: 150px; flex: none; background: #12263A; color: #B9C8D5; padding: 14px 10px; font-size: 11.5px; }
.side .logo { font-weight: 600; letter-spacing: -0.02em; color: #FFFFFF; font-size: 15px; padding: 0 8px 14px; display: flex; align-items: center; gap: 7px; }
.side a { display: block; padding: 7px 8px; border-radius: 5px; margin-bottom: 2px; }
.side a.on { background: #0A6F7D; color: #FFFFFF; }
.side .org { margin-top: 18px; padding: 10px 8px 0; border-top: 1px solid #2A4157; font-size: 10.5px; color: #8EA3B5; line-height: 1.5; }
.main { flex: 1; padding: 16px 18px; min-width: 0; display: flex; flex-direction: column; gap: 12px; }
.top { display: flex; align-items: center; justify-content: space-between; }
.top h3 { font-size: 17px; }
.filters { display: flex; gap: 6px; }
.pill { white-space: nowrap; font-size: 10.5px; border: 1px solid #C9D3DC; background: #FFFFFF; border-radius: 5px; padding: 4px 9px; color: #3B4F63; }
.btn { white-space: nowrap; font-size: 10.5px; background: #0A6F7D; color: #FFFFFF; border-radius: 5px; padding: 5px 11px; }
.btn.ghost { background: #FFFFFF; color: #0A6F7D; border: 1px solid #0A6F7D; }
.row { display: flex; gap: 12px; }
.card { min-width: 0; background: #FFFFFF; border: 1px solid #D9E0E6; border-radius: 7px; padding: 12px 14px; }
.card h4 { font-size: 11.5px; font-weight: 700; color: #12263A; margin-bottom: 9px; }
.kpi { flex: 1; }
.kpi .l { font-size: 10.5px; color: #6B7C8C; }
.kpi .v { font-family: 'Archivo', sans-serif; font-weight: 600; font-size: 23px; margin-top: 3px; font-variant-numeric: tabular-nums; }
.kpi .d { font-size: 10px; color: #6B7C8C; margin-top: 2px; }
table.t { width: 100%; border-collapse: collapse; font-size: 10.8px; font-variant-numeric: tabular-nums; }
table.t th { text-align: left; font-weight: 400; color: #6B7C8C; font-size: 10px; padding: 0 12px 7px 0; border-bottom: 1px solid #D9E0E6; }
table.t td { padding: 7px 12px 7px 0; border-bottom: 1px solid #EDF1F4; vertical-align: middle; white-space: nowrap; }
table.t tr:last-child td { border-bottom: none; }
table.t .n { text-align: right; }
table.t td.w { white-space: normal; line-height: 1.3; min-width: 150px; }
table.t tr.sel td { background: #E3F1F3; }
.badge { white-space: nowrap; flex: none; display: inline-block; font-size: 9.8px; border-radius: 4px; padding: 2px 7px; }
.ok { background: #E3F1E8; color: #1F6B40; }
.warn { background: #FBEFD9; color: #8A5306; }
.bad { background: #F8E3E0; color: #9A2B21; }
.mute { background: #E9EEF2; color: #566878; }
.info { background: #DDEFF2; color: #085763; }
.bar { width: 110px; height: 7px; background: #E6ECF1; border-radius: 4px; overflow: hidden; display: inline-block; vertical-align: middle; }
.bar b { display: block; height: 100%; background: #0A6F7D; }
.bar b.hi { background: #C7791A; }
.mono { font-family: 'DejaVu Sans Mono', monospace; font-size: 10px; }
.alert { font-size: 11px; line-height: 1.4; padding: 7px 0; border-bottom: 1px solid #EDF1F4; display: flex; gap: 8px; align-items: baseline; }
.alert:last-child { border-bottom: none; }
.field { margin-bottom: 9px; }
.field .k { font-size: 9.8px; color: #6B7C8C; margin-bottom: 3px; }
.field .v { font-size: 11px; border: 1px solid #D9E0E6; border-radius: 5px; padding: 5px 8px; background: #FAFBFC; line-height: 1.4; }
.red { background: #12263A; color: #FFFFFF; border-radius: 3px; padding: 0 4px; font-size: 9.5px; }
.tag { display: inline-block; font-size: 10.5px; color: #8A5306; background: #FBEFD9; border-radius: 4px; padding: 2px 8px; margin-top: 18px; }
.big { padding-top: 64px; }
.big h2 { font-size: 44px; max-width: 1040px; }
.cols { display: flex; gap: 32px; margin-top: 44px; }
.col { flex: 1; border-top: 3px solid #12263A; padding-top: 14px; }
.col h3 { font-size: 22px; margin-bottom: 10px; }
.col p { font-size: 17px; }
.col ul { list-style: none; margin-top: 4px; }
.col li { font-size: 16px; line-height: 1.4; color: #3B4F63; padding: 9px 0; border-bottom: 1px solid #E6ECF1; }
.col li:last-child { border-bottom: none; }
.col.teal { border-top-color: #0A6F7D; }
.col.grey { border-top-color: #9FB0BF; }
.col.amber { border-top-color: #C7791A; }
.qs { margin-top: 48px; background: #F3F6F8; border-radius: 8px; padding: 18px 22px; display: flex; gap: 28px; }
.qs div { flex: 1; font-size: 19px; line-height: 1.4; font-family: 'Archivo', sans-serif; }
.qs span { display: block; font-family: 'Archivo', sans-serif; font-size: 13px; color: #6B7C8C; margin-bottom: 5px; }
.steps { margin-top: 40px; counter-reset: s; }
.step { display: flex; gap: 20px; padding: 20px 0; border-bottom: 1px solid #E6ECF1; align-items: baseline; }
.step:last-child { border-bottom: none; }
.step::before { counter-increment: s; content: counter(s); font-family: 'Archivo', sans-serif; font-size: 26px; color: #0A6F7D; width: 28px; flex: none; }
.step b { font-size: 20px; font-weight: 700; width: 450px; flex: none; }
.step span { font-size: 16px; color: #3B4F63; line-height: 1.45; }

.names { display: flex; gap: 40px; margin-top: 22px; }
.names .g { flex: 1; }
.names h3 { font-size: 17px; border-top: 3px solid #12263A; padding-top: 10px; margin-bottom: 4px; }
.nm { display: flex; gap: 14px; padding: 6.5px 0; border-bottom: 1px solid #E6ECF1; align-items: baseline; }
.nm:last-child { border-bottom: none; }
.nm b { width: 150px; flex: none; font-size: 14.5px; }
.nm i { width: 104px; flex: none; font-style: normal; font-size: 12px; color: #0A6F7D; }
.nm span { font-size: 12.5px; line-height: 1.35; color: #3B4F63; }
.nm.pick b { color: #0A6F7D; }
.syms { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-top: 22px; }
.sy { border: 1px solid #D9E0E6; border-radius: 8px; padding: 18px 18px 16px; position: relative; }
.sy.pick { border: 2px solid #0A6F7D; background: #F1F8F9; }
.sy b { display: block; font-size: 17px; font-weight: 600; margin-top: 12px; }
.sy span { display: block; font-size: 12.5px; line-height: 1.4; color: #3B4F63; margin-top: 4px; }
.sy em { position: absolute; top: 14px; right: 14px; font-style: normal; font-size: 11px; font-weight: 600; color: #FFFFFF; background: #0A6F7D; border-radius: 4px; padding: 3px 9px; }
.brand { display: flex; gap: 36px; margin-top: 24px; }
.brand h3 { font-size: 16px; margin-bottom: 12px; }
.lk { display: flex; align-items: center; gap: 16px; border-radius: 8px; padding: 30px 28px; font-size: 46px; font-weight: 600; letter-spacing: -0.02em; line-height: 1; }
.sw { display: flex; align-items: center; gap: 12px; padding: 7px 0; font-size: 13px; }
.sw i { width: 46px; height: 30px; border-radius: 5px; display: block; flex: none; border: 1px solid #D9E0E6; }
.sw code { font-family: 'DejaVu Sans Mono', monospace; font-size: 11.5px; color: #566878; margin-left: auto; }
.cmp { margin-top: 18px; border-radius: 14px; overflow: hidden; }
.cmp .hr, .cmp .rw { display: grid; grid-template-columns: 215px 1fr 1fr 1fr; gap: 18px; padding: 9px 16px; align-items: start; }
.cmp .hr { font-size: 11.5px; color: #6B7C8C; padding-bottom: 6px; }
.cmp .rw { background: #F3F6F8; border-radius: 12px; margin-bottom: 6px; font-size: 12.3px; line-height: 1.38; color: #3B4F63; }
.cmp .rw.top { background: #12263A; color: #CFE4E8; }
.cmp .rw b { display: block; font-size: 14px; font-weight: 600; color: #12263A; }
.cmp .rw.top b { color: #FFFFFF; }
.cmp .rw i { font-style: normal; display: block; font-size: 10.8px; color: #6B7C8C; margin-top: 1px; }
.cmp .rw.top i { color: #9FB4C4; }
.cmp .rw .gap { color: #085763; font-weight: 500; }
.cmp .rw.top .gap { color: #6CCBD3; }
.cols.c4 { gap: 24px; }
.cols.c4 .col h3 { font-size: 20px; }
.cols.c4 .col p { font-size: 15.5px; }
.mx { margin-top: 18px; }
.mx .mr { display: grid; grid-template-columns: 268px 1.25fr repeat(5, 1fr); align-items: center; }
.mx .mr > div { padding: 7.5px 12px; font-size: 12.6px; min-width: 0; }
.mx .mr.hd > div { font-size: 13px; font-weight: 600; padding-bottom: 9px; }
.mx .mr.hd i { display: block; font-style: normal; font-weight: 400; font-size: 10.5px; color: #6B7C8C; margin-top: 1px; }
.mx .mr:not(.hd) { border-top: 1px solid #E6ECF1; }
.mx .mr > div:nth-child(2) { background: #F1F8F9; }
.mx .mr.hd > div:nth-child(2) { border-radius: 12px 12px 0 0; color: #0A6F7D; }
.mx .mr:last-child > div:nth-child(2) { border-radius: 0 0 12px 12px; }
.mx .mr > div:first-child { color: #12263A; font-weight: 500; padding-left: 0; }
.mx .dash { color: #9FB0BF; }
"""

def foot(n: int) -> str:
    return (f'<div class="foot"><span style="display:flex;align-items:center;gap:6px">{logo(12)}{NAME}, borrador de producto</span>'
            f'<span>{n} / {TOTAL}</span></div>')


def screen(n: int, heading: str, text: str, questions: list[tuple[str, str]], mock: str) -> str:
    qs = "".join(f"<div>{q}<br><span>{who}</span></div>" for q, who in questions)
    return f"""
<section class="slide"><div class="two">
  <div class="txt"><h2>{heading}</h2><p>{text}</p>
    <div class="q"><span>Preguntas que responde</span>{qs}</div>
    <div class="tag">Datos ilustrativos</div></div>
  {mock}
</div>{foot(n)}</section>"""


def arch_svg() -> str:
    box = "fill:#FFFFFF;stroke:#12263A;stroke-width:1.2"
    teal = "fill:#DDEFF2;stroke:#0A6F7D;stroke-width:1.2"
    navy = "fill:#12263A;stroke:#12263A;stroke-width:1.2"
    cont = "fill:#F3F6F8;stroke:#9FB0BF;stroke-width:1.2;stroke-dasharray:5 4"
    t = "font-family:'Archivo',sans-serif;font-size:14px;font-weight:700;fill:#12263A"
    s = "font-family:'Archivo',sans-serif;font-size:11.5px;fill:#3B4F63"
    tw = "font-family:'Archivo',sans-serif;font-size:14px;font-weight:700;fill:#FFFFFF"
    sw = "font-family:'Archivo',sans-serif;font-size:11.5px;fill:#C5D4E0"
    lab = "font-family:'Archivo',sans-serif;font-size:13px;font-weight:500;fill:#12263A"
    arr = "stroke:#12263A;stroke-width:1.4;fill:none"

    def b(x, y, w, h, title, sub, style=box, ts=t, ss=s):
        cx = x + w / 2
        return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" style="{style}"/>'
                f'<text x="{cx}" y="{y + h / 2 - 4}" text-anchor="middle" style="{ts}">{title}</text>'
                f'<text x="{cx}" y="{y + h / 2 + 14}" text-anchor="middle" style="{ss}">{sub}</text>')

    def a(x, y1, y2):
        return f'<line x1="{x}" y1="{y1}" x2="{x}" y2="{y2}" style="{arr}" marker-end="url(#ah)"/>'

    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 590" width="100%" height="100%">',
        '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">'
        '<path d="M1 1L9 5L1 9" style="fill:none;stroke:#12263A;stroke-width:1.6"/></marker></defs>',
        b(0, 0, 270, 54, "Aplicaciones internas", "Llamadas API"),
        b(290, 0, 270, 54, "CLIs de código y sus tools", "Con auxiliar en el puesto: SSO y clave"),
        b(610, 0, 290, 54, "Asientos y chat web", "Incluye completions inline"),
        a(135, 54, 90), a(425, 54, 90), a(755, 54, 128),
        f'<rect x="0" y="92" width="570" height="150" rx="10" style="{cont}"/>',
        f'<text x="16" y="116" style="{lab}">Data plane, en la red del cliente</text>',
        b(16, 130, 170, 58, "Gateway LLM", "LiteLLM o Bifrost, tras un puerto", teal),
        b(200, 130, 170, 58, "Gateway MCP", "Tools remotas, por equipo", teal),
        b(384, 130, 170, 58, "Motor de políticas", "Datos, modelos, tools, cuotas", teal),
        f'<text x="16" y="222" style="{s}">Los prompts no salen de la red del cliente. Emite eventos de uso y de tool calls sin contenido.</text>',
        b(610, 130, 290, 58, "Collectors fuera de banda", "APIs de administración y OpenTelemetry", teal),
        a(135, 242, 288), a(425, 242, 288), a(755, 188, 288),
        b(0, 290, 270, 58, "Proveedores y servidores MCP", "Anthropic, OpenAI, Bedrock, MCP remotos"),
        f'<rect x="290" y="290" width="610" height="200" rx="10" style="{cont}"/>',
        f'<text x="306" y="314" style="{lab}">Control plane, en la misma cuenta durante el MVP</text>',
        b(306, 328, 186, 58, "Políticas e identidad", "SSO, claves, presupuestos", navy, tw, sw),
        b(502, 328, 186, 58, "Ingesta y analítica", "Eventos de uso y coste", navy, tw, sw),
        b(698, 328, 186, 58, "Panel y evidencias", "Chargeback e informes", navy, tw, sw),
        b(306, 408, 186, 58, "Postgres", "Configuración y reglas"),
        b(502, 408, 186, 58, "ClickHouse o Postgres", "Eventos de uso"),
        b(698, 408, 186, 58, "Almacén S3", "Informes generados"),
        a(399, 490, 528),
        b(306, 530, 186, 58, "Identidad del cliente", "OIDC: Entra ID, Okta"),
        f'<text x="512" y="554" style="{s}">Un único chart de Helm: EKS o ECS Fargate en AWS,</text>',
        f'<text x="512" y="572" style="{s}">o Kubernetes en el centro de datos del cliente.</text>',
        '</svg>',
    ]
    return "".join(parts)


def s_names() -> str:
    es = [("Veedor", "vi-DOR", "Oficial que inspeccionaba y auditaba cuentas. Nombre de trabajo hasta octubre.", False),
          ("Esclusa", "es-CLU-sa", "Compuerta que regula el paso sin cortarlo.", False),
          ("Aduana", "a-DUA-na", "Todo lo que sale se declara y se revisa. Evoca burocracia.", False),
          ("Garita", "ga-RI-ta", "Puesto de control en la entrada. Suena a seguridad física.", False),
          ("Albarán", "al-ba-RAN", "Registro de lo que se entrega y a quién. Tira hacia costes.", False),
          ("Atalaya", "a-ta-LA-ya", "Torre desde la que se ve todo. Muy usado.", False),
          ("Cauce", "CAU-se", "El tráfico encauzado por un solo sitio. Neutro.", False),
          ("Fiel", "fi-EL", "El fiel de la balanza. Demasiado genérico para registrarlo.", False)]
    my = [("Cardea", "CAR-di-a", "Diosa romana de los goznes: decide qué se abre y qué se cierra. Elegido.", True),
          ("Maat", "ma-AT", "Diosa egipcia de la verdad y el orden; pesa el corazón en la balanza.", False),
          ("Jano / Janus", "YEI-nus", "Dios de las puertas, mira hacia dentro y hacia fuera. Muy usado.", False),
          ("Portuno / Portunus", "por-TIU-nus", "Dios de las llaves y las puertas.", False),
          ("Cerbero / Cerberus", "SER-be-rus", "Vigila que nada salga del Hades. Agresivo y muy visto.", False),
          ("Heimdall", "JAIM-dal", "Guardián del puente Bifröst. Bifrost es un gateway competidor.", False),
          ("Argos / Argus", "AR-gus", "El gigante de cien ojos. Muy usado.", False),
          ("Temis / Themis", "ZI-mis", "La justicia con la balanza. Evoca despachos de abogados.", False),
          ("Forseti", "for-SE-ti", "Dios nórdico de la justicia y el arbitraje.", False),
          ("Thot / Thoth", "ZOZ", "El escriba que anota el juicio. Difícil de pronunciar en inglés.", False)]

    def rows(items):
        return "".join(f'<div class="nm{" pick" if pick else ""}"><b>{n}</b><i>({pr})</i><span>{m}</span></div>'
                       for n, pr, m, pick in items)

    return f"""<section class="slide"><h2>Anexo: alternativas de nombre</h2>
<p style="margin-top:8px">Entre paréntesis, la pronunciación aproximada en inglés. Elegido Cardea. Hay colisiones conocidas (Cardea Health, Cardea Bio y varias marcas «Cardea» en EE. UU.): antes de anunciarlo hay que comprobar EUIPO y OEPM en las clases 9 y 42, y el dominio.</p>
<div class="names">
  <div class="g"><h3>En castellano</h3>{rows(es)}</div>
  <div class="g"><h3>Mitología</h3>{rows(my)}</div>
</div>{foot(19)}</section>"""


def _circle(cx, cy, r):
    return f"M {cx - r} {cy} a {r} {r} 0 1 0 {2 * r} 0 a {r} {r} 0 1 0 {-2 * r} 0 Z"


def _sq(x, y, side=11):
    return f"M {x} {y} h {side} v {side} h {-side} Z"


def _arc(cx, cy, r, a0, a1):
    import math
    def pt(a):
        tt = math.radians(a - 90)
        return cx + r * math.cos(tt), cy + r * math.sin(tt)
    x0, y0 = pt(a0); x1, y1 = pt(a1)
    large = 1 if (a1 - a0) % 360 > 180 else 0
    return f"M {x0:.1f} {y0:.1f} A {r} {r} 0 {large} 1 {x1:.1f} {y1:.1f}"


# Cada trazo: (path, grosor, usa acento, relleno)
SYMBOLS = {
    "Gozne": [(_arc(48, 48, 34, 135, 405), 11, False, False), (_circle(48, 48, 10), 0, True, True)],
    "Eje": [(_arc(48, 48, 34, 135, 405), 11, False, False), (_circle(72, 24, 10), 0, True, True)],
    "Marco": [("M 78 16 L 20 16 L 20 80 L 78 80", 11, False, False), (_circle(48, 48, 10), 0, True, True)],
    "Giro": [(_arc(48, 48, 34, 135, 405), 11, False, False), ("M 48 48 L 48 14", 11, False, False), (_circle(48, 48, 10), 0, True, True)],
    "Hoja": [("M 30 16 L 30 84", 11, False, False), ("M 30 16 L 82 40", 11, False, False), (_circle(30, 16, 10), 0, True, True)],
    "Umbral": [("M 18 84 L 18 16 L 78 16 L 78 84", 11, False, False), ("M 78 16 L 40 46", 9, False, False), (_circle(78, 16, 9), 0, True, True)],
    "Mirada": [("M 14 22 L 48 82 L 82 22", 11, False, False), (_circle(48, 33, 10), 0, True, True)],
}


def symbol(name: str, size: int, ink: str = "#12263A", accent: str = "#0A6F7D") -> str:
    out = ""
    for d, w, acc, fill in SYMBOLS[name]:
        color = accent if acc else ink
        style = (f"fill:{color};stroke:none" if fill
                 else f"fill:none;stroke:{color};stroke-width:{w};stroke-linecap:butt;stroke-linejoin:miter")
        out += f'<path d="{d}" style="{style}"/>'
    return f'<svg viewBox="0 0 96 96" width="{size}" height="{size}" style="display:block;flex:none">{out}</svg>'


def logo(size: int, dark: bool = False) -> str:
    return symbol("Gozne", size, "#FFFFFF", "#6CCBD3") if dark else symbol("Gozne", size)


def s_symbols() -> str:
    items = [("Gozne", "La C del nombre es el giro de la puerta; el punto, el gozne sobre el que gira. Aguanta a 14 px y hereda el punto de Mirada.", True),
             ("Eje", "La misma C con el gozne en el extremo de la hoja. El punto se funde con el trazo en pequeño.", False),
             ("Marco", "La C en ángulo recto: el marco de la puerta. Más técnico; se confunde con un corchete.", False),
             ("Giro", "La C con la hoja cerrada. Lee como G o como reloj.", False),
             ("Hoja", "Una hoja abierta vista desde arriba, con el gozne arriba. Abstracto; no lleva la C.", False),
             ("Umbral", "El marco y la hoja entreabierta. Demasiado literal: parece inmobiliaria.", False),
             ("Mirada", "El símbolo de Veedor, para comparar. La V ya no corresponde al nombre.", False)]
    cells = "".join(
        f'<div class="sy{" pick" if pick else ""}">{"<em>Elegido</em>" if pick else ""}{symbol(n, 78)}<b>{n}</b><span>{t}</span></div>'
        for n, t, pick in items)
    return f"""<section class="slide"><h2>Anexo: alternativas de símbolo</h2>
<p style="margin-top:8px">Seis bocetos geométricos para Cardea más el de Veedor. Todos parten de la misma idea, el gozne: lo que decide qué se abre y qué se cierra. El elegido hay que redibujarlo con cuidado y comprobar que no se parece a una marca registrada.</p>
<div class="syms">{cells}</div>{foot(20)}</section>"""


def s_brand() -> str:
    def sw(color, name, use, hexa):
        return f'<div class="sw"><i style="background:{color}"></i><div><b style="font-weight:600">{name}</b><br><span style="color:#566878;font-size:11.5px">{use}</span></div><code>{hexa}</code></div>'

    marca = (sw("#12263A", "Tinta", "Texto, navegación, fondos oscuros", "#12263A")
             + sw("#0A6F7D", "Petróleo", "Acciones, enlaces y el punto del símbolo", "#0A6F7D")
             + sw("#6CCBD3", "Petróleo claro", "Acento sobre fondo oscuro", "#6CCBD3")
             + sw("#F3F6F8", "Niebla", "Fondo de la aplicación", "#F3F6F8"))
    estado = (sw("#2E7D4F", "Permitida", "Solo para estados, nunca para marca", "#2E7D4F")
              + sw("#C7791A", "Aviso", "Solo para estados", "#C7791A")
              + sw("#B3362B", "Bloqueada", "Solo para estados", "#B3362B"))
    return f"""<section class="slide"><h2>Anexo: marca</h2>
<p style="margin-top:8px">Descriptor bajo el logotipo: «Gobierno del uso de IA». La IA se dice con texto, no con el símbolo. El punto del gozne va siempre en petróleo.</p>
<div class="brand">
  <div style="flex:1.15">
    <h3>Logotipo</h3>
    <div class="lk" style="background:#F3F6F8">{logo(64)}Cardea</div>
    <div class="lk" style="background:#12263A;color:#FFFFFF;margin-top:14px">{logo(64, True)}Cardea</div>
    <h3 style="margin-top:22px">Tipografía</h3>
    <div style="font-size:34px;font-weight:600;letter-spacing:-0.02em">Archivo Semibold</div>
    <div style="font-size:15px;color:#3B4F63;margin-top:6px;line-height:1.5">Archivo Regular para texto e interfaz. Una sola familia en todo el producto.<br>ABCDEFGHIJKLMNÑOPQRSTUVWXYZ 0123456789 € %</div>
  </div>
  <div style="flex:1"><h3>Color de marca</h3>{marca}
    <h3 style="margin-top:20px">Color de estado</h3>{estado}</div>
</div>{foot(21)}</section>"""


def _cmp(title: str, intro: str, rows: list, n: int, note: str = "") -> str:
    body = "".join(
        f'<div class="rw{" top" if top else ""}"><div><b>{n_}</b><i>{sub}</i></div><div>{what}</div><div>{strong}</div><div class="gap">{gap}</div></div>'
        for n_, sub, top, what, strong, gap in rows)
    extra = f'<p style="margin-top:14px;font-size:15px;color:#12263A;max-width:1100px">{note}</p>' if note else ""
    return f"""<section class="slide"><h2>{title}</h2>
<p style="margin-top:8px">{intro}</p>
<div class="cmp"><div class="hr"><div>Competidor</div><div>Qué es</div><div>Dónde es fuerte</div><div>Frente a Cardea</div></div>{body}</div>{extra}
{foot(n)}</section>"""


FECHA = ("Estado a 1 de octubre de 2026, según webs de los fabricantes y comparativas públicas, muchas escritas por competidores; "
         "hay que verificar antes de citar.")


def s_competidores_eu(n: int) -> str:
    rows = [
        ("NeuralTrust (TrustGate)", "Barcelona. 20 M$ de capital semilla en junio de 2026", True,
         "Gateway de código abierto en Go para LLM, MCP y agentes, con guardrails y redacción de datos personales. SaaS, híbrido u on-premise.",
         "Seguridad de agentes: inyección de prompts y tools envenenadas. Núcleo con licencia Apache 2.0.",
         "Vende al responsable de seguridad. No hemos visto chargeback, asientos ni informe para Finanzas."),
        ("Kosmoy", "Milán. Se instala con Helm en el Kubernetes del cliente", True,
         "Gateway LLM, MCP y A2A, inventario de sistemas de IA, sandbox de agentes y evidencias para el AI Act.",
         "El más parecido en arquitectura, y más amplio: registro de riesgos y contención de agentes.",
         "No hemos visto asientos ni chargeback a centro de coste. Cardea es más estrecho: coste, datos y evidencias."),
        ("nexos.ai", "Vilna. Más de 43 M$ levantados", False,
         "Gateway para desarrolladores y workspace de chat para empleados, con presupuestos y guardrails. Solo SaaS, alojado en la UE.",
         "Adopción inmediata, sin nada que operar. Certificaciones SOC 2 e ISO 27001.",
         "No se instala en la red del cliente y registra prompts y respuestas."),
        ("Gravitee y Tyk", "Gestores de APIs europeos con capa de IA", False,
         "Proxies para LLM y MCP con filtrado de datos personales y coste por token. Tyk AI Studio es de código abierto desde marzo de 2026.",
         "Empresas que ya gestionan sus APIs con ellos.",
         "Herramienta del equipo de plataforma, sin vista para Finanzas ni Cumplimiento."),
        ("SofIA, de OpenSistemas", "España. Plataforma corporativa de una consultora", False,
         "Acceso a modelos con permisos contra el proveedor de identidad, auditoría, lista de modelos aprobados y alertas de consumo.",
         "Llega con el equipo que la implanta y la integra.",
         "Proyecto de servicios más que producto. Compite por el mismo presupuesto."),
    ]
    return _cmp("Competidores en España y Europa",
                "En oscuro, los dos que hay que estudiar a fondo. " + FECHA, rows, n,
                "Ser un proveedor europeo e independiente ya no diferencia por sí solo: hay producto con financiación en Barcelona, Milán y Vilna.")


def s_competidores_resto(n: int) -> str:
    rows = [
        ("Prisma AIRS AI Gateway", "Palo Alto Networks, antes Portkey", True,
         "Gateway con guardrails, redacción de datos y auditoría, integrado en una plataforma de seguridad. Compra cerrada en mayo de 2026.",
         "El más completo en gobierno, con el canal comercial de un gran fabricante de seguridad.",
         "Quien no quiera atar su tráfico de IA a un fabricante de seguridad estadounidense ni a su paquete."),
        ("TrueFoundry", "Plataforma nativa de Kubernetes", True,
         "Gateways de modelos, MCP y agentes sobre una plataforma de ML. SaaS, híbrido, autoalojado o aislado de red.",
         "Soberanía del dato y despliegue en la infraestructura del cliente.",
         "Vende una plataforma de ML entera. Cardea es solo gobierno, con chargeback y evidencias."),
        ("systemprompt.io", "Un fundador. Núcleo con licencia BSL, versión 0.x", False,
         "Un binario en Rust con Postgres que comprueba cada tool call MCP antes de ejecutarla. Incluye gateway y un auxiliar en el puesto.",
         "Gobierno de agentes y tools, con código público y demo en vivo.",
         "Guarda prompt y respuesta. No hemos visto presupuestos por equipo, datos personales ni asientos."),
        ("LiteLLM Enterprise", "Núcleo abierto con nivel de pago", False,
         "El proxy autoalojado más extendido, con claves, equipos, presupuestos y gateway MCP. Candidato a base de nuestro data plane, junto a Bifrost.",
         "Cobertura de proveedores y control total en infraestructura propia.",
         "Asientos y CLIs en la misma vista, informe de evidencias y panel para perfiles no técnicos."),
        ("Kong AI Gateway", "Extensión de su gateway de APIs", False,
         "Enrutado, límites y políticas de IA como plugins. Las funciones avanzadas son de pago.",
         "Empresas que ya gestionan sus APIs con Kong.",
         "Clientes sin Kong: adoptarlo solo para IA es desproporcionado."),
        ("Cloudflare AI Gateway", "Servicio alojado en su red", False,
         "Caché, registro y enrutado sin infraestructura propia. El núcleo es gratuito.",
         "Coste cero de entrada para quien ya usa Cloudflare.",
         "No se instala en la red del cliente: los prompts pasan por un tercero."),
        ("Nubes y seguridad de red", "Azure APIM, Bedrock, Databricks, Zscaler, Cisco", False,
         "Funciones de gateway o de inspección del tráfico de IA dentro de plataformas que el cliente ya tiene contratadas.",
         "Sin proveedor nuevo ni compra adicional.",
         "Con más de una nube o proveedor no dan una vista común, ni reparten el coste por equipo."),
    ]
    return _cmp("Competidores en el resto del mercado", "En oscuro, los dos que hay que estudiar a fondo. " + FECHA, rows, n)


def s_matriz(n: int) -> str:
    cols = [("Cardea", "alcance del MVP"), ("systemprompt.io", "Rust, BSL"), ("NeuralTrust", "Barcelona"), ("Kosmoy", "Milán"),
            ("nexos.ai", "Vilna"), ("TrueFoundry", "EE. UU.")]
    # Prefijo: + sí, ~ parcial, - no, ? no visto
    rows = [
        ("Se instala en la red del cliente", ["+Sí", "+Sí", "+Sí", "+Sí", "-No", "+Sí"]),
        ("Gateway LLM", ["+Sí", "+Sí", "+Sí", "+Sí", "+Sí", "+Sí"]),
        ("Gobierno de tools MCP", ["+Sí, remotas", "+Sí, es su núcleo", "+Sí", "+Sí", "?", "+Sí"]),
        ("Clave por desarrollador con SSO", ["+Sí", "+Sí", "~Parcial", "?", "+Sí", "+Sí"]),
        ("Redacción de datos personales", ["+Sí", "~Solo secretos", "+Sí", "+Sí", "+Sí", "+Sí"]),
        ("Presupuesto por equipo con bloqueo", ["+Sí", "?", "?", "+Sí", "+Sí", "+Sí"]),
        ("Chargeback a centro de coste", ["+Sí", "?", "?", "?", "?", "?"]),
        ("Asientos y Copilot inline en la vista", ["+Sí, solo registra", "-No", "?", "?", "?", "?"]),
        ("No guarda el texto del prompt", ["+Sí", "-No", "?", "?", "-No", "?"]),
        ("Informe de evidencias", ["+Sí, con cobertura", "~Exportación", "~Auditoría", "+Sí, AI Act", "?", "?"]),
        ("Seguridad de agentes y sandbox", ["-No", "~Parcial", "+Sí, es su núcleo", "+Sí", "~Guardrails", "~Guardrails"]),
        ("Producto en producción", ["-No, es un borrador", "+Sí, versión 0.x", "+Sí", "+Sí", "+Sí", "+Sí"]),
    ]
    kinds = {"+": "info", "~": "warn", "-": "mute"}

    def cell(v: str) -> str:
        if v == "?":
            return '<div><span class="dash">—</span></div>'
        return f'<div><span class="chip {kinds[v[0]]}">{v[1:]}</span></div>'

    head = '<div class="mr hd"><div></div>' + "".join(f"<div>{a}<i>{b}</i></div>" for a, b in cols) + "</div>"
    body = "".join(f'<div class="mr"><div>{lab}</div>{"".join(cell(v) for v in vals)}</div>' for lab, vals in rows)
    return f"""<section class="slide"><h2>Cardea frente a los más cercanos</h2>
<p style="margin-top:8px">La raya significa que no lo hemos visto en su documentación pública, no que no exista. La columna de Cardea describe el alcance previsto, no un producto. Estado a 1 de octubre de 2026; verificar antes de citar.</p>
<div class="mx">{head}{body}</div>
{foot(n)}</section>"""


def s_ventajas(n: int) -> str:
    return f"""<section class="slide big"><h2>Dónde gana Cardea y qué deja fuera</h2>
<div class="cols" style="margin-top:34px">
  <div class="col teal"><h3>Ventajas</h3><ul>
    <li>API, CLIs, tools y asientos en una sola vista, con el coste real de la factura</li>
    <li>Chargeback por centro de coste y presupuestos, en el lenguaje de Finanzas</li>
    <li>No guarda el texto de los prompts; otros registran prompt y respuesta</li>
    <li>El informe de evidencias declara lo que no puede acreditar</li>
    <li>Solo gobierno: sin plataforma de ML, workspace ni gestor de APIs alrededor</li>
    <li>Reconocedores locales (DNI/NIE, IBAN) y trato cercano en España</li></ul></div>
  <div class="col amber"><h3>No lo cubre</h3><ul>
    <li>Chat web fuera del SSO y control de las completions inline de Copilot</li>
    <li>Servidores MCP locales y tools internas del CLI</li>
    <li>Seguridad ofensiva de agentes: inyección de prompts, tools envenenadas, sandbox</li>
    <li>Tráfico entre agentes (A2A), workspace de chat, alojamiento de modelos</li>
    <li>Inventario y clasificación de riesgo del AI Act</li>
    <li>SaaS y certificaciones propias (SOC 2, ISO 27001): hoy no hay ninguna</li></ul></div>
  <div class="col grey"><h3>Ya no diferencia</h3><ul>
    <li>Ser europeo e independiente: NeuralTrust, Kosmoy y nexos.ai también lo son</li>
    <li>Instalarse en la red del cliente: lo hacen Kosmoy, TrueFoundry, NeuralTrust y systemprompt.io</li>
    <li>Redacción de datos y presupuestos con bloqueo: los tiene casi todo el mercado</li>
    <li>Gobierno de MCP: hace falta para no quedar fuera, no es una ventaja</li></ul></div>
</div>{foot(n)}</section>"""


def build_html() -> str:
    slides = []
    slides.append(f"""<section class="slide cover">
<div class="lock">{logo(104, True)}<h1>{NAME}</h1></div><div class="desc">Gobierno del uso de IA</div><div class="rule"></div>
<div class="sub">Quién usa qué modelo, cuánto cuesta y qué datos salen de la empresa, en una sola vista.</div>
<div class="meta">Borrador de producto para revisión con Paco<br>Octubre de 2026. Las cifras de las pantallas son ilustrativas.<br>Cardea, diosa romana de los goznes: la que decide qué se abre y qué se cierra. Dominio y marca sin comprobar; nombre y símbolo en los anexos.</div>
</section>""")

    slides.append(f"""<section class="slide big"><h2>Tres canales de uso y ninguna vista común</h2>
<div class="cols">
  <div class="col"><h3>Aplicaciones por API</h3><p>Cada equipo integra un proveedor con su propia clave. El gasto aparece en facturas separadas y nadie lo reparte por centro de coste.</p></div>
  <div class="col"><h3>CLIs de código</h3><p>Claude Code, Codex y Copilot envían código y contexto a los proveedores desde el portátil de cada desarrollador, sin registro central.</p></div>
  <div class="col"><h3>Asientos</h3><p>Las licencias por usuario se administran en la consola de cada proveedor. Hay una consola distinta por herramienta.</p></div>
</div>
<div class="qs">
  <div><span>Finanzas no puede responder</span>¿Cuánto gasta cada equipo y en qué?</div>
  <div><span>Seguridad no puede responder</span>¿Qué datos de clientes han salido?</div>
  <div><span>Dirección técnica no puede responder</span>¿Quién usa qué herramienta y qué modelo?</div>
</div>{foot(2)}</section>""")

    slides.append(f"""<section class="slide big"><h2>Un punto de control para API, CLIs y tools MCP, y visibilidad sobre los asientos</h2>
<div class="cols c4">
  <div class="col teal"><h3>Aplicaciones por API</h3><p>Pasan por el gateway. Se aplican reglas, límites de gasto y redacción de datos antes de llegar al proveedor.</p><p style="margin-top:10px;color:#0A6F7D">Controla y registra</p></div>
  <div class="col teal"><h3>CLIs de código</h3><p>Cada desarrollador recibe una clave propia tras identificarse con el SSO. El tráfico pasa por el mismo gateway.</p><p style="margin-top:10px;color:#0A6F7D">Controla y registra</p></div>
  <div class="col teal"><h3>Tools MCP remotas</h3><p>Lo que ejecutan los agentes: servidores aprobados, permiso por equipo y por tool, y credenciales guardadas en el gateway, no en el portátil.</p><p style="margin-top:10px;color:#0A6F7D">Controla y registra</p></div>
  <div class="col grey"><h3>Asientos y chat web</h3><p>No se pueden enrutar. Se leen las métricas de las consolas de cada proveedor para sumar uso y coste a la misma vista.</p><p style="margin-top:10px;color:#566878">Solo registra</p></div>
</div>
<p style="margin-top:40px;max-width:1060px;font-size:19px;color:#12263A">Todo se instala en la infraestructura del cliente. Los prompts no pasan por servidores nuestros.</p>
<p style="margin-top:10px;max-width:1060px;font-size:15px">Fuera del gateway quedan los servidores MCP locales y las tools internas de cada CLI: solo se limitan con configuración gestionada en el puesto.</p>
{foot(3)}</section>""")

    slides.append(screen(4, "Panel general", "La primera pantalla al entrar. Resume el mes y señala lo que necesita una decisión.",
                         [("¿Cuánto llevamos gastado este mes?", "Finanzas"), ("¿Hay algo que atender hoy?", "Responsable de plataforma")], s_panel()))
    slides.append(screen(5, "Costes y chargeback", "Reparte el gasto por equipo y centro de coste, con presupuesto, aviso y bloqueo.",
                         [("¿A qué centro de coste imputo cada euro?", "Finanzas"), ("¿Qué equipo está a punto de pasarse?", "Responsable de equipo")], s_costes()))
    slides.append(screen(6, "Políticas", "Las reglas que se aplican antes de que algo salga o se ejecute: datos, modelos, tools MCP y límites.",
                         [("¿Qué puede enviarse y a qué proveedor?", "Seguridad y protección de datos"), ("¿Puedo probar una regla antes de activarla?", "Responsable de plataforma")], s_politicas()))
    slides.append(screen(7, "Actividad y auditoría", "Cada petición y cada llamada a una tool MCP, con su origen, su coste y la decisión del motor de políticas.",
                         [("¿Qué pasó con esta petición y por qué?", "Seguridad"), ("¿Salió algún dato personal sin redactar?", "Protección de datos")], s_actividad()))
    slides.append(screen(8, "Desarrolladores y claves", "Una clave por desarrollador, emitida con el SSO, válida para todos sus CLIs.",
                         [("¿Quién usa qué herramienta y cuánto gasta?", "Dirección técnica"), ("¿Puedo revocar el acceso de una persona?", "Seguridad")], s_devs()))
    slides.append(screen(9, "Evidencias", "Un informe por periodo para auditoría, que dice qué se puede acreditar y qué no.",
                         [("¿Qué le entrego al auditor?", "Cumplimiento"), ("¿Dónde no tenemos cobertura todavía?", "Seguridad")], s_evidencias()))
    slides.append(screen(10, "Conexiones", "Proveedores, collectors e identidad. Es la pantalla de instalación y de diagnóstico.",
                         [("¿Está todo conectado y funcionando?", "Responsable de plataforma"), ("¿De dónde sale cada dato?", "Auditoría")], s_conexiones()))

    slides.append(s_mobile(foot(11)))

    slides.append(f"""<section class="slide"><div class="two">
  <div class="txt"><h2>Arquitectura</h2>
    <p>El data plane es la ruta crítica: no guarda estado y se escala en horizontal. Si el control plane cae, el gateway sigue aplicando la última configuración.</p>
    <p>El gateway es una pieza reemplazable. Las políticas, la identidad y las evidencias son código propio. Los MCP locales no pasan por aquí.</p>
    <div class="q"><span>Decisiones abiertas</span>
      <div>LiteLLM o Bifrost como base, con MCP como criterio</div>
      <div>ClickHouse o solo Postgres para eventos en el MVP</div>
      <div>EKS o ECS Fargate según lo que ya tenga cada cliente</div></div></div>
  <div style="flex:1;padding-top:4px">{arch_svg()}</div>
</div>{foot(12)}</section>""")

    slides.append(s_competidores_eu(13))
    slides.append(s_competidores_resto(14))
    slides.append(s_matriz(15))
    slides.append(s_ventajas(16))

    slides.append(f"""<section class="slide big"><h2>Qué entra en el MVP y qué no</h2>
<div class="cols" style="margin-top:34px">
  <div class="col teal"><h3>MVP, 8 a 10 semanas estimadas</h3><ul>
    <li>Gateway para API y CLIs con clave por desarrollador y SSO</li>
    <li>Gateway MCP para tools remotas: servidores aprobados y permiso por equipo y tool</li>
    <li>Presupuestos por equipo con aviso y bloqueo</li>
    <li>Redacción de datos personales y lista de modelos permitidos</li>
    <li>Registro de auditoría y panel de costes con chargeback</li>
    <li>Collectors de Copilot y de facturación, e informe de evidencias exportable</li></ul></div>
  <div class="col grey"><h3>Después</h3><ul>
    <li>Métricas de valor y retorno por caso de uso</li>
    <li>Registro de prompts y comparación entre modelos</li>
    <li>Versión SaaS compartida entre clientes</li>
    <li>Extensión de navegador para el chat web</li>
    <li>Seguridad de agentes: inyección de prompts y sandbox</li></ul></div>
  <div class="col amber"><h3>Riesgos conocidos</h3><ul>
    <li>Las completions inline de Copilot solo se pueden observar, no controlar</li>
    <li>Los MCP locales y las tools internas del CLI no pasan por el gateway</li>
    <li>Base del gateway por decidir (LiteLLM o Bifrost), acotada con un puerto propio</li>
    <li>Competencia con producto y financiación: NeuralTrust, Kosmoy, TrueFoundry y Palo Alto</li>
    <li>El cliente exigirá garantías de seguridad para un componente en su ruta crítica</li></ul></div>
</div>{foot(17)}</section>""")

    slides.append(f"""<section class="slide big"><h2>Siguientes pasos</h2>
<div class="steps">
  <div class="step"><b>Revisar este borrador y confirmar el nombre</b><span>Ajustar pantallas y alcance con Paco antes de enseñarlo a nadie.</span></div>
  <div class="step"><b>Hablar con los tres clientes interesados</b><span>Una pregunta por encima de las demás: quién firma y de qué partida sale el dinero.</span></div>
  <div class="step"><b>Cerrar un piloto de pago por escrito</b><span>Antes de construir. Interés sin presupuesto no valida el producto.</span></div>
  <div class="step"><b>Desplegar el MVP en la cuenta de un cliente</b><span>Con su tráfico real de API y CLIs, y su proveedor de identidad.</span></div>
  <div class="step"><b>Decidir la siguiente fase con datos reales</b><span>Qué canal pesa más, qué pantalla se usa y por qué pagarían más.</span></div>
</div>{foot(18)}</section>""")

    slides.append(s_names())
    slides.append(s_symbols())
    slides.append(s_brand())

    return f'<!doctype html><html lang="es"><head><meta charset="utf-8"><title>{NAME}: borrador de producto</title><style>{FONT_FACES}{CSS}{APP_CSS}</style></head><body>{"".join(slides)}</body></html>'


def main() -> None:
    html = build_html()
    src = Path(__file__).resolve().parent / "pitch.html"
    src.write_text(html, encoding="utf-8")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        page.goto(src.as_uri())
        page.wait_for_timeout(300)
        page.pdf(path=str(OUT), width="1280px", height="720px", print_background=True, prefer_css_page_size=True)
        browser.close()
    print("ok", OUT, OUT.stat().st_size)


if __name__ == "__main__":
    main()
