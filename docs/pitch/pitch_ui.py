"""Interfaz v2 de Cardea para el pitch: shell con barra flotante, graficos SVG, avatares y movil."""
from __future__ import annotations

import math

INK, TEAL, TEAL_L, FOG = "#12263A", "#0A6F7D", "#6CCBD3", "#EEF2F5"
OK, WARN, BAD = "#2E7D4F", "#C7791A", "#B3362B"
RAMP = ["#12263A", "#0A6F7D", "#3FA3AE", "#8CCDD4", "#C9D8E2"]

APP_CSS = """
.two .txt { width: 226px; }
.frame2 { flex: 1; min-width: 0; border-radius: 22px; overflow: hidden; background: #EEF2F5; display: flex; box-shadow: 0 0 0 1px #D5DEE6, 0 22px 44px -22px rgba(18,38,58,.40); }
.sb { width: 166px; flex: none; margin: 10px 0 10px 10px; background: #12263A; border-radius: 18px; padding: 14px 10px 10px; display: flex; flex-direction: column; color: #AFC0CF; font-size: 11.5px; }
.sb .brand { display: flex; align-items: center; gap: 8px; color: #FFFFFF; font-weight: 600; font-size: 16px; letter-spacing: -0.02em; padding: 2px 8px 8px; }
.sb .grp { font-size: 9.5px; color: #7C93A6; padding: 12px 8px 5px; }
.sb a { display: flex; align-items: center; gap: 9px; padding: 7px 8px; border-radius: 10px; margin-bottom: 2px; }
.sb a.on { background: #223E57; color: #FFFFFF; }
.sb a .cnt { margin-left: auto; font-size: 9px; background: #6CCBD3; color: #12263A; border-radius: 999px; padding: 1px 6px; font-weight: 600; }
.sb .me { margin-top: auto; background: #1B334A; border-radius: 13px; padding: 8px; display: flex; gap: 8px; align-items: center; }
.sb .me b { display: block; color: #FFFFFF; font-size: 11px; font-weight: 600; }
.sb .me span { font-size: 9.5px; color: #8EA3B5; }
.mainw { flex: 1; min-width: 0; padding: 14px 16px 14px 16px; display: flex; flex-direction: column; gap: 12px; }
.tb { display: flex; align-items: center; gap: 9px; flex: none; }
.tb h3 { font-size: 19px; line-height: 1.1; }
.tb .sub { font-size: 10.5px; color: #6B7C8C; margin-top: 2px; }
.srch { white-space: nowrap; margin-left: auto; display: flex; align-items: center; gap: 7px; background: #FFFFFF; border-radius: 999px; padding: 7px 9px 7px 12px; font-size: 10.5px; color: #7A8A99; width: 208px; }
.kbd { white-space: nowrap; margin-left: auto; font-size: 9px; background: #EEF2F5; border-radius: 6px; padding: 2px 6px; color: #566878; }
.ib { width: 31px; height: 31px; border-radius: 50%; background: #FFFFFF; display: flex; align-items: center; justify-content: center; color: #12263A; position: relative; flex: none; }
.ib.pri { background: #0A6F7D; color: #FFFFFF; }
.ib .dot { position: absolute; top: -3px; right: -4px; min-width: 15px; height: 15px; border-radius: 8px; background: #B3362B; color: #FFFFFF; font-size: 8.5px; font-weight: 600; display: flex; align-items: center; justify-content: center; border: 2px solid #EEF2F5; }
.c2 { background: #FFFFFF; border-radius: 18px; padding: 14px 16px; min-width: 0; }
.c2.dark { background: #12263A; color: #FFFFFF; }
.c2 h4 { font-size: 12px; font-weight: 600; margin-bottom: 9px; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.c2 h4 span { font-weight: 400; font-size: 10px; color: #7A8A99; }
.r2 { display: flex; gap: 12px; min-height: 0; }
.chip { display: inline-flex; align-items: center; gap: 4px; font-size: 9.8px; border-radius: 999px; padding: 3px 9px; white-space: nowrap; flex: none; }
.chip.ok { background: #E3F1E8; color: #1F6B40; } .chip.warn { background: #FBEFD9; color: #8A5306; }
.chip.bad { background: #F8E3E0; color: #9A2B21; } .chip.mute { background: #E9EEF2; color: #566878; }
.chip.info { background: #DDEFF2; color: #085763; } .chip.line { background: #FFFFFF; color: #3B4F63; box-shadow: inset 0 0 0 1px #D5DEE6; }
.chip.solid { background: #0A6F7D; color: #FFFFFF; } .chip.glass { background: rgba(108,203,211,.18); color: #BFE6EA; }
.seg { display: inline-flex; background: #FFFFFF; border-radius: 999px; padding: 3px; font-size: 10.2px; color: #566878; }
.seg span { padding: 4px 11px; border-radius: 999px; } .seg span.on { background: #12263A; color: #FFFFFF; }
.ic { width: 30px; height: 30px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex: none; }
.ic.t { background: #DDEFF2; color: #0A6F7D; } .ic.w { background: #FBEFD9; color: #8A5306; } .ic.b { background: #F8E3E0; color: #9A2B21; }
.ic.m { background: #E9EEF2; color: #566878; } .ic.g { background: #E3F1E8; color: #1F6B40; } .ic.k { background: #12263A; color: #FFFFFF; }
.li { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid #EEF2F5; font-size: 11px; }
.li:last-child { border-bottom: none; padding-bottom: 0; }
.li .tx { min-width: 0; flex: 1; } .li .tx b { font-weight: 600; display: block; } .li .tx span { font-size: 9.8px; color: #6B7C8C; }
.num { font-weight: 600; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.lg { display: flex; align-items: center; gap: 6px; font-size: 10.3px; color: #3B4F63; padding: 3px 0; white-space: nowrap; }
.lg i { width: 9px; height: 9px; border-radius: 3px; display: block; flex: none; } .lg b { margin-left: auto; font-weight: 600; color: #12263A; font-variant-numeric: tabular-nums; }
.tog { width: 30px; height: 17px; border-radius: 999px; background: #C9D3DC; position: relative; flex: none; }
.tog::after { content: ""; position: absolute; top: 2px; left: 2px; width: 13px; height: 13px; border-radius: 50%; background: #FFFFFF; }
.tog.on { background: #0A6F7D; } .tog.on::after { left: 15px; }
.node { display: flex; align-items: flex-start; gap: 10px; background: #F4F7F9; border-radius: 14px; padding: 9px 11px; font-size: 10.8px; position: relative; }
.node small { display: block; font-size: 9.3px; color: #6B7C8C; margin-bottom: 2px; }
.link { width: 2px; height: 12px; background: #C9D3DC; margin-left: 25px; }
.redact { background: #12263A; color: #FFFFFF; border-radius: 5px; padding: 0 5px; font-size: 9.3px; }
.quote { background: #F4F7F9; border-radius: 12px; padding: 9px 11px; font-size: 10.6px; line-height: 1.5; }
.pillbtn { display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; border-radius: 999px; padding: 6px 13px; background: #0A6F7D; color: #FFFFFF; white-space: nowrap; }
.pillbtn.ghost { background: #FFFFFF; color: #0A6F7D; box-shadow: inset 0 0 0 1px #0A6F7D; }
.tl { position: relative; padding-left: 18px; font-size: 10.5px; }
.tl div { position: relative; padding-bottom: 9px; } .tl div:last-child { padding-bottom: 0; }
.tl div::before { content: ""; position: absolute; left: -18px; top: 3px; width: 8px; height: 8px; border-radius: 50%; background: #0A6F7D; }
.tl div::after { content: ""; position: absolute; left: -15px; top: 13px; bottom: -1px; width: 2px; background: #D5DEE6; }
.tl div:last-child::after { display: none; }
.tl span { color: #6B7C8C; font-size: 9.5px; margin-left: 6px; }
.dev { background: #FFFFFF; border-radius: 18px; padding: 13px 14px; display: flex; flex-direction: column; justify-content: space-between; gap: 8px; min-width: 0; }
.phones { flex: 1; display: flex; gap: 34px; justify-content: center; align-items: center; }
.ph { width: 258px; height: 540px; border-radius: 40px; background: #12263A; padding: 9px; flex: none; box-shadow: 0 26px 44px -24px rgba(18,38,58,.55); }
.ph .scr { width: 100%; height: 100%; border-radius: 32px; background: #EEF2F5; overflow: hidden; display: flex; flex-direction: column; padding: 16px 12px 10px; gap: 10px; position: relative; }
.ph .hd { display: flex; align-items: center; gap: 8px; }
.ph .hd b { font-size: 15px; font-weight: 600; letter-spacing: -0.02em; }
.ph .tabs { margin-top: auto; background: #12263A; border-radius: 999px; padding: 6px 8px; display: flex; justify-content: space-between; color: #8EA3B5; }
.ph .tabs span { width: 46px; height: 30px; border-radius: 999px; display: flex; align-items: center; justify-content: center; }
.ph .tabs span.on { background: #0A6F7D; color: #FFFFFF; }
.ph .c2 { border-radius: 18px; padding: 12px 13px; }
.cap { text-align: center; font-size: 12px; color: #3B4F63; margin-top: 12px; }
"""

ICONS = {
    "grid": "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
    "bars": "M5 20V11 M12 20V4 M19 20v-6",
    "shield": "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z",
    "pulse": "M3 12h4l3-7 4 14 3-7h4",
    "users": "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6 M16 4.5a3.5 3.5 0 0 1 0 6.5 M21 20c0-2.6-1.6-4.8-4-5.6",
    "file": "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M9 14l2 2 4-4",
    "plug": "M9 3v5 M15 3v5 M6 8h12v3a6 6 0 0 1-12 0z M12 17v4",
    "bell": "M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z M10 21h4",
    "search": "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M20 20l-4-4",
    "plus": "M12 5v14 M5 12h14",
    "key": "M7.5 18a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M10 12l9-9 M16 6l3 3 M13 9l2 2",
    "down": "M12 4v11 M7 11l5 5 5-5 M5 20h14",
    "check": "M5 12l5 5 9-10",
    "alert": "M12 4l9 16H3z M12 10v4 M12 17v.5",
    "block": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M6 6l12 12",
    "term": "M4 5h16v14H4z M7 9l3 3-3 3 M12 15h5",
    "box": "M4 8l8-4 8 4v8l-8 4-8-4z M4 8l8 4 8-4 M12 12v8",
    "clock": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
    "sliders": "M4 7h10 M18 7h2 M4 17h4 M12 17h8 M16 5v4 M10 15v4",
    "chev": "M6 9l6 6 6-6",
    "bolt": "M13 3L5 14h6l-1 7 8-11h-6z",
    "eye": "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    "user": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8",
    "euro": "M17 6a7 7 0 1 0 0 12 M4 10h9 M4 14h9",
    "send": "M4 12l16-8-6 16-3-7z",
}


def ico(name: str, size: int = 14, sw: float = 1.8) -> str:
    return (f'<svg viewBox="0 0 24 24" width="{size}" height="{size}" style="display:block;flex:none;fill:none;stroke:currentColor;'
            f'stroke-width:{sw};stroke-linecap:round;stroke-linejoin:round"><path d="{ICONS[name]}"/></svg>')


def gozne(size: int, dark: bool = False) -> str:
    """Simbolo de Cardea: una C (el giro de la puerta) con el punto del gozne en su centro."""
    ink, acc = ("#FFFFFF", TEAL_L) if dark else (INK, TEAL)
    return (f'<svg viewBox="0 0 96 96" width="{size}" height="{size}" style="display:block;flex:none">'
            f'<path d="M 72.0 72.0 A 34 34 0 1 1 72.0 24.0" style="fill:none;stroke:{ink};stroke-width:11;stroke-linecap:butt"/>'
            f'<circle cx="48" cy="48" r="10" style="fill:{acc}"/></svg>')


def mirada(size: int, dark: bool = False) -> str:
    return gozne(size, dark)


AV = [("#CFE4E8", "#0A6F7D"), ("#F1DDBF", "#8A5306"), ("#DAD6F0", "#4B3F9A"), ("#CFE6D6", "#1F6B40"), ("#F3D2CD", "#9A2B21"),
      ("#D5DEE6", "#12263A")]


def avatar(i: int, size: int = 30) -> str:
    bg, fg = AV[i % len(AV)]
    cid = f"av{i}_{size}"
    return (f'<svg viewBox="0 0 40 40" width="{size}" height="{size}" style="display:block;flex:none">'
            f'<defs><clipPath id="{cid}"><circle cx="20" cy="20" r="20"/></clipPath></defs>'
            f'<g clip-path="url(#{cid})"><rect width="40" height="40" style="fill:{bg}"/>'
            f'<circle cx="20" cy="16" r="7.5" style="fill:{fg}"/>'
            f'<path d="M4 44c0-9.5 7-15.5 16-15.5S36 34.500 36 44z" style="fill:{fg}"/></g></svg>')


def smooth(pts: list[tuple[float, float]]) -> str:
    d = f"M {pts[0][0]:.1f} {pts[0][1]:.1f}"
    n = len(pts)
    for i in range(n - 1):
        p0, p1, p2, p3 = pts[max(i - 1, 0)], pts[i], pts[i + 1], pts[min(i + 2, n - 1)]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f" C {c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}"
    return d


def area(vals: list[float], w: int, h: int, line: str, fill: str, sw: float = 2, pad: int = 4) -> str:
    mx, mn = max(vals), min(vals)
    span = (mx - mn) or 1
    pts = [(i * w / (len(vals) - 1), pad + (h - 2 * pad) * (1 - (v - mn) / span)) for i, v in enumerate(vals)]
    d = smooth(pts)
    return (f'<svg viewBox="0 0 {w} {h}" width="100%" height="{h}" preserveAspectRatio="none" style="display:block">'
            f'<path d="{d} L {w} {h} L 0 {h} Z" style="fill:{fill}"/>'
            f'<path d="{d}" style="fill:none;stroke:{line};stroke-width:{sw};stroke-linecap:round" vector-effect="non-scaling-stroke"/></svg>')


def donut(segs: list[tuple[float, str]], size: int, thick: int, center: str = "") -> str:
    r = (size - thick) / 2
    c = 2 * math.pi * r
    total = sum(v for v, _ in segs)
    out, acc = "", 0.0
    for v, color in segs:
        ln = v / total * c
        out += (f'<circle cx="{size / 2}" cy="{size / 2}" r="{r}" style="fill:none;stroke:{color};stroke-width:{thick};'
                f'stroke-dasharray:{max(ln - 3, 0.1):.2f} {c - max(ln - 3, 0.1):.2f};stroke-dashoffset:{-acc:.2f};stroke-linecap:round"/>')
        acc += ln
    return (f'<div style="position:relative;width:{size}px;height:{size}px;flex:none">'
            f'<svg viewBox="0 0 {size} {size}" width="{size}" height="{size}" style="display:block;transform:rotate(-90deg)">{out}</svg>'
            f'<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">{center}</div></div>')


def ring(pct: float, size: int, thick: int, color: str, center: str = "", track: str = "#E6ECF1") -> str:
    return donut([(pct, color), (100 - pct, track)], size, thick, center) if pct < 100 else donut([(1, color)], size, thick, center)


def eur(v: float) -> str:
    return f"{v:,.0f}".replace(",", ".") + " €"


NAV = [("Visión", [("Panel general", "grid", ""), ("Costes", "bars", ""), ("Actividad", "pulse", "342")]),
       ("Control", [("Políticas", "shield", ""), ("Desarrolladores", "users", "")]),
       ("Cumplimiento", [("Evidencias", "file", ""), ("Conexiones", "plug", "1")])]


def shell(active: str, title: str, sub: str, body: str) -> str:
    nav = ""
    for grp, items in NAV:
        nav += f'<div class="grp">{grp}</div>'
        for name, icon, cnt in items:
            badge = f'<span class="cnt">{cnt}</span>' if cnt else ""
            nav += f'<a class="{"on" if name == active else ""}">{ico(icon, 14)}{name}{badge}</a>'
    return f"""
<div class="frame2">
  <div class="sb">
    <div class="brand">{mirada(20, True)}Cardea</div>{nav}
    <div class="me">{avatar(0, 30)}<div><b>Marta Soler</b><span>Plataforma</span></div><div style="margin-left:auto;color:#8EA3B5">{ico("chev", 12)}</div></div>
  </div>
  <div class="mainw">
    <div class="tb"><div><h3>{title}</h3><div class="sub">{sub}</div></div>
      <div class="srch">{ico("search", 12)}Buscar o ejecutar<span class="kbd">Ctrl K</span></div>
      <div class="ib pri">{ico("plus", 15, 2.2)}</div><div class="ib">{ico("key", 14)}</div><div class="ib">{ico("down", 14)}</div>
      <div class="ib">{ico("bell", 14)}<span class="dot">3</span></div>{avatar(0, 31)}
    </div>
    {body}
  </div>
</div>"""


DAILY = [410, 455, 470, 520, 498, 260, 240, 530, 575, 590, 610, 640, 300, 280, 650, 690, 700, 735, 720, 330, 310, 760, 790, 805,
         840, 820, 360, 340, 870, 905]
TEAMS = [("Plataforma", "CC-1040", 6000, 5310), ("Datos", "CC-1300", 5000, 4120), ("Siniestros", "CC-2210", 4000, 3680),
         ("Canales digitales", "CC-3105", 3500, 2890), ("Backoffice", "CC-4020", 3000, 2420)]


def s_panel() -> str:
    hero = f"""<div class="c2 dark" style="flex:1.65;display:flex;flex-direction:column;padding-bottom:0;overflow:hidden">
  <div style="display:flex;justify-content:space-between;align-items:flex-start">
    <div><div style="font-size:10.5px;color:#9FB4C4">Gasto de septiembre</div>
      <div class="num" style="font-size:36px;line-height:1.1;margin-top:3px">18.420 €</div></div>
    <div style="text-align:right"><span class="chip glass">+12 % frente a agosto</span>
      <div style="font-size:9.8px;color:#9FB4C4;margin-top:8px">86 % del presupuesto de 21.500 €</div>
      <div style="width:150px;height:5px;border-radius:3px;background:#2A4259;margin:5px 0 0 auto"><div style="width:86%;height:100%;border-radius:3px;background:#6CCBD3"></div></div></div>
  </div>
  <div style="margin:10px -16px 0">{area(DAILY, 480, 84, TEAL_L, "rgba(108,203,211,.16)")}</div></div>"""
    ch = [("Aplicaciones", 9870, INK), ("CLIs de código", 6130, TEAL), ("Asientos", 2420, "#8CCDD4")]
    legend = "".join(f'<div class="lg"><i style="background:{c}"></i>{n}<b>{eur(v)}</b></div>' for n, v, c in ch)
    canal = f"""<div class="c2" style="flex:1"><h4>Gasto por canal</h4>
  <div style="display:flex;align-items:center;gap:14px">{donut([(v, c) for _, v, c in ch], 104, 15, '<div class="num" style="font-size:15px">3</div><div style="font-size:8.5px;color:#6B7C8C">canales</div>')}
  <div style="flex:1">{legend}</div></div></div>"""

    def kpi(icon, cls, label, val, delta, dcls, vals, color):
        return (f'<div class="c2" style="flex:1;display:flex;align-items:center;gap:10px;padding:11px 14px"><div class="ic {cls}">{ico(icon, 15)}</div>'
                f'<div><div style="font-size:9.8px;color:#6B7C8C">{label}</div><div class="num" style="font-size:19px;line-height:1.15">{val}</div></div>'
                f'<div style="margin-left:auto;width:74px;text-align:right"><span class="chip {dcls}" style="padding:1.5px 7px">{delta}</span>'
                f'<div style="margin-top:5px">{area(vals, 74, 22, color, "transparent", 1.6, 2)}</div></div></div>')

    k = (kpi("users", "t", "Usuarios activos", "214", "+18", "ok", [170, 176, 181, 190, 188, 197, 203, 208, 214], TEAL)
         + kpi("send", "k", "Peticiones", "1,28 M", "+9 %", "ok", [0.9, 1.0, 0.97, 1.05, 1.1, 1.12, 1.2, 1.24, 1.28], INK)
         + kpi("block", "b", "Bloqueadas", "342", "0,03 %", "mute", [48, 41, 44, 39, 36, 40, 33, 31, 30], BAD))
    att = [("alert", "w", "Siniestros va al 92 % de su presupuesto", "Presupuesto mensual, quedan 320 €", "Ampliar"),
           ("eye", "t", "14 peticiones con datos personales redactados", "Hoy, en 2 aplicaciones", "Ver"),
           ("plug", "b", "El collector de facturación cloud falla", "La credencial caducó ayer", "Reconectar"),
           ("key", "m", "3 claves sin uso en 30 días", "Candidatas a revocar", "Revisar")]
    al = "".join(f'<div class="li"><div class="ic {c}">{ico(i, 14)}</div><div class="tx"><b>{t}</b><span>{s}</span></div>'
                 f'<span class="chip line">{a}</span></div>' for i, c, t, s, a in att)
    bars = ""
    for (name, _, budget, spent), color in zip(TEAMS, RAMP):
        pct = round(spent / budget * 100)
        col = WARN if pct >= 90 else TEAL
        bars += (f'<div style="margin-bottom:9px"><div style="display:flex;justify-content:space-between;font-size:10.3px"><span>{name}</span>'
                 f'<span class="num">{pct} %</span></div><div style="height:7px;border-radius:4px;background:#E6ECF1;margin-top:4px">'
                 f'<div style="height:100%;width:{pct}%;border-radius:4px;background:{col}"></div></div></div>')
    body = f"""<div class="r2">{hero}{canal}</div><div class="r2">{k}</div>
<div class="r2" style="flex:1"><div class="c2" style="flex:1.45"><h4>Requiere atención<span>4 pendientes</span></h4>{al}</div>
<div class="c2" style="flex:1"><h4>Presupuesto por equipo</h4>{bars}</div></div>"""
    return shell("Panel general", "Buenos días, Marta", "Miércoles, 30 de septiembre de 2026", body)


def stacked_weeks() -> str:
    weeks = [("S36", 4020), ("S37", 4480), ("S38", 4790), ("S39", 5130)]
    total = sum(s for *_, s in TEAMS)
    w, h, base, mx = 420, 196, 168, 5600
    out = "".join(f'<line x1="34" y1="{base - (base - 14) * g / mx:.1f}" x2="{w}" y2="{base - (base - 14) * g / mx:.1f}" style="stroke:#EEF2F5;stroke-width:1"/>'
                  f'<text x="28" y="{base - (base - 14) * g / mx + 3:.1f}" text-anchor="end" style="font-size:8.5px;fill:#7A8A99">{g // 1000}k</text>'
                  for g in (0, 2000, 4000))
    for i, (lab, tot) in enumerate(weeks):
        x = 62 + i * 92
        y = base
        for (name, _, _, spent), color in zip(TEAMS, RAMP):
            seg = tot * spent / total
            hh = (base - 14) * seg / mx
            y -= hh
            out += f'<rect x="{x}" y="{y + 1.5:.1f}" width="46" height="{hh - 3:.1f}" rx="5" style="fill:{color}"/>'
        out += (f'<text x="{x + 23}" y="{y - 5:.1f}" text-anchor="middle" style="font-size:9.5px;font-weight:600;fill:#12263A">{eur(tot)}</text>'
                f'<text x="{x + 23}" y="{base + 15}" text-anchor="middle" style="font-size:9.5px;fill:#6B7C8C">{lab}</text>')
    return f'<svg viewBox="0 0 {w} {h}" width="100%" height="{h}" style="display:block">{out}</svg>'


def s_costes() -> str:
    lg = "".join(f'<span class="lg" style="padding:0"><i style="background:{c}"></i>{t[0]}</span>' for t, c in zip(TEAMS, RAMP))
    models = [("Claude Sonnet", 7940, INK), ("GPT", 5260, TEAL), ("Gemini", 3150, "#3FA3AE"), ("Otros", 2070, "#C9D8E2")]
    ml = "".join(f'<div class="lg"><i style="background:{c}"></i>{n}<b>{eur(v)}</b></div>' for n, v, c in models)
    cards = ""
    for name, cc, budget, spent in TEAMS:
        pct = round(spent / budget * 100)
        col = WARN if pct >= 90 else TEAL
        cards += (f'<div class="c2" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:13px 8px 12px">'
                  f'{ring(pct, 78, 10, col, f"<div class=num style=font-size:15px>{pct} %</div>")}'
                  f'<div style="font-size:11px;font-weight:600;margin-top:8px">{name}</div>'
                  f'<div style="font-size:9.6px;color:#6B7C8C;margin-top:2px">{eur(spent)} de {eur(budget)}</div>'
                  f'<span class="chip mute" style="margin-top:7px;font-family:\'DejaVu Sans Mono\',monospace;font-size:8.8px">{cc}</span></div>')
    body = f"""<div style="display:flex;align-items:center;gap:8px"><div class="seg"><span class="on">Equipo</span><span>Proyecto</span><span>Modelo</span><span>Herramienta</span></div>
  <span class="chip line" style="padding:6px 11px">{ico("clock", 11)}Septiembre de 2026</span>
  <span class="pillbtn ghost" style="margin-left:auto">{ico("down", 11)}Exportar chargeback</span></div>
<div class="r2"><div class="c2" style="flex:1.7"><h4>Gasto semanal<span style="display:flex;gap:9px">{lg}</span></h4>{stacked_weeks()}</div>
  <div class="c2" style="flex:1"><h4>Por familia de modelo</h4><div style="display:flex;justify-content:center;margin:2px 0 10px">{donut([(v, c) for _, v, c in models], 112, 16, '<div class="num" style="font-size:14px">18.420 €</div><div style="font-size:8.5px;color:#6B7C8C">total</div>')}</div>{ml}</div></div>
<div class="r2" style="flex:1">{cards}</div>"""
    return shell("Costes", "Costes y chargeback", "Reparto por equipo y centro de coste", body)


def s_politicas() -> str:
    rules = [("eye", "t", "Datos de clientes no salen sin redactar", ["Todos los equipos", "API y CLIs"], "Redactar", 1204, "on", "Activa", "ok", True),
             ("sliders", "k", "Modelos permitidos en Siniestros", ["Siniestros"], "Lista permitida", 86, "on", "Activa", "ok", False),
             ("plug", "t", "Tools MCP permitidas por equipo", ["Todos los equipos", "MCP remoto"], "Lista permitida", 58, "on", "Activa", "ok", False),
             ("euro", "w", "Límite mensual por equipo", ["Todos los equipos"], "Bloquear al 100 %", 0, "on", "Activa", "ok", False),
             ("term", "m", "Código marcado como confidencial", ["CLIs"], "Avisar", 37, "on", "En pruebas", "warn", False),
             ("shield", "m", "Proveedores fuera de la UE", ["Backoffice"], "Bloquear", 0, "", "Borrador", "mute", False)]
    rows = ""
    for icon, cls, name, scopes, action, hits, tog, st, stc, sel in rules:
        sc = "".join(f'<span class="chip mute" style="padding:1.5px 7px;font-size:9px">{s}</span>' for s in scopes)
        style = "background:#F1F8F9;box-shadow:inset 0 0 0 1.5px #0A6F7D;" if sel else "background:#F4F7F9;"
        rows += (f'<div style="{style}border-radius:14px;padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:7px">'
                 f'<div class="ic {cls}">{ico(icon, 14)}</div><div style="min-width:0;flex:1"><div style="font-size:11.2px;font-weight:600">{name}</div>'
                 f'<div style="display:flex;gap:4px;margin-top:4px;align-items:center">{sc}<span class="chip line" style="padding:1.5px 7px;font-size:9px">{action}</span></div></div>'
                 f'<div style="text-align:right;flex:none"><div class="num" style="font-size:12.5px">{f"{hits:,}".replace(",", ".")}</div><div style="font-size:8.6px;color:#7A8A99">este mes</div></div>'
                 f'<span class="chip {stc}">{st}</span><div class="tog {tog}"></div></div>')
    det = "".join(f'<span class="chip line" style="padding:2px 8px;font-size:9.3px">{d}</span>' for d in ["DNI/NIE", "IBAN", "Correo", "Teléfono", "Nombre y apellidos"])
    flow = f"""<div class="node"><div class="ic t">{ico("send", 13)}</div><div><small>Cuando llega</small>Una petición de cualquier aplicación o CLI</div></div>
<div class="link"></div>
<div class="node"><div class="ic t">{ico("search", 13)}</div><div><small>Si contiene</small><div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:3px">{det}</div></div></div>
<div class="link"></div>
<div class="node"><div class="ic k">{ico("eye", 13)}</div><div><small>Entonces</small>Sustituir cada dato por un marcador y continuar</div></div>
<div class="link"></div>
<div class="node"><div class="ic m">{ico("file", 13)}</div><div><small>Y registrar</small>Un evento de auditoría, sin guardar el original</div></div>"""
    body = f"""<div style="display:flex;align-items:center;gap:8px"><div class="seg"><span class="on">Todas</span><span>Datos</span><span>Modelos</span><span>Tools</span><span>Gasto</span></div>
  <span class="pillbtn" style="margin-left:auto">{ico("plus", 11, 2.2)}Crear regla</span></div>
<div class="r2" style="flex:1"><div class="c2" style="flex:1.25"><h4>Reglas<span>6 reglas, 4 activas</span></h4>{rows}</div>
  <div class="c2" style="flex:1;display:flex;flex-direction:column"><h4>Cómo actúa la regla</h4>{flow}
    <div class="quote" style="margin-top:10px"><div style="font-size:9.3px;color:#6B7C8C;margin-bottom:3px">Prueba con un ejemplo</div>Resume la reclamación de <span class="redact">NOMBRE</span> con DNI <span class="redact">DNI</span></div>
    <div style="display:flex;gap:7px;margin-top:auto;padding-top:10px"><span class="pillbtn">Guardar cambios</span><span class="pillbtn ghost">Probar otro texto</span></div></div></div>"""
    return shell("Políticas", "Políticas", "Lo que se comprueba antes de que una petición salga", body)


def histogram() -> str:
    import random
    rnd = random.Random(7)
    w, h = 700, 74
    out = ""
    for i in range(60):
        okv = 22 + rnd.randint(0, 22) + (10 if 20 < i < 40 else 0)
        red = rnd.choice([0, 0, 1, 2, 3])
        blk = 1 if i in (9, 31, 32, 47) else 0
        x = i * (w / 60)
        y = h
        for v, color in ((okv, "#BFD3DD"), (red * 3, TEAL), (blk * 6, BAD)):
            if v:
                y -= v
                out += f'<rect x="{x + 1.5:.1f}" y="{y:.1f}" width="{w / 60 - 3:.1f}" height="{v - 1:.1f}" rx="2.2" style="fill:{color}"/>'
    return f'<svg viewBox="0 0 {w} {h}" width="100%" height="{h}" preserveAspectRatio="none" style="display:block">{out}</svg>'


def s_actividad() -> str:
    feed = [(avatar(1, 26), "Laura Ortega", "Claude Code", "Claude Sonnet", "0,09 €", "ok", "Permitida", "10:42:18", False),
            (f'<div class="ic k" style="width:26px;height:26px;border-radius:9px">{ico("box", 13)}</div>', "app-siniestros", "API", "GPT", "0,04 €", "info", "Redactada", "10:42:03", True),
            (avatar(2, 26), "Marc Vidal", "Copilot CLI", "tool MCP github.create_pull_request", "tool", "ok", "Permitida", "10:41:57", False),
            (f'<div class="ic k" style="width:26px;height:26px;border-radius:9px">{ico("box", 13)}</div>', "app-backoffice", "API", "Gemini", "0,01 €", "bad", "Bloqueada", "10:41:40", False),
            (avatar(3, 26), "Rosa Castro", "Codex", "GPT", "0,11 €", "ok", "Permitida", "10:41:22", False),
            (avatar(1, 26), "Laura Ortega", "Claude Code", "Claude Sonnet", "0,11 €", "warn", "Aviso", "10:40:31", False),
            (avatar(3, 26), "Rosa Castro", "Codex", "tool MCP postgres-prod.query", "tool", "bad", "Bloqueada", "10:40:12", False),
            (avatar(4, 26), "Sergio Navarro", "Claude Code", "Claude Sonnet", "0,06 €", "ok", "Permitida", "10:39:58", False)]
    rows = ""
    for who, name, tool, model, cost, cls, dec, hour, sel in feed:
        bg = "background:#F1F8F9;border-radius:12px;margin:0 -8px;padding:7px 8px;" if sel else "padding:7px 0;"
        rows += (f'<div style="display:flex;align-items:center;gap:9px;font-size:10.6px;{bg}">{who}'
                 f'<div style="min-width:0;flex:1"><b style="font-weight:600">{name}</b><div style="font-size:9.3px;color:#6B7C8C">{tool}, {model}</div></div>'
                 f'<span class="num" style="font-size:10.3px">{cost}</span><span class="chip {cls}">{dec}</span>'
                 f'<span style="font-size:9.3px;color:#7A8A99;font-variant-numeric:tabular-nums">{hour}</span></div>')
    body = f"""<div class="c2"><h4>Peticiones por minuto, última hora
    <span style="display:flex;gap:6px"><span class="chip mute">1.842 permitidas</span><span class="chip info">61 redactadas</span><span class="chip bad">7 bloqueadas</span><span class="chip line">212 tool calls</span></span></h4>{histogram()}</div>
<div class="r2" style="flex:1"><div class="c2" style="flex:1.45"><h4>En directo<span><span class="seg" style="background:#EEF2F5;padding:2px"><span class="on" style="padding:3px 9px">Todas</span><span style="padding:3px 9px">Con incidencia</span></span></span></h4>{rows}</div>
  <div class="c2" style="flex:1"><h4>app-siniestros<span style="font-family:'DejaVu Sans Mono',monospace;font-size:9px">req_7f3a91c2</span></h4>
    <div class="tl"><div>Recibida<span>10:42:03</span></div><div>Regla evaluada: datos de clientes<span>2 ms</span></div>
      <div>3 datos sustituidos por marcadores</div><div>Enviada a OpenAI</div><div>Respuesta entregada<span>1,8 s, 0,04 €</span></div></div>
    <div class="quote" style="margin-top:11px"><div style="font-size:9.3px;color:#6B7C8C;margin-bottom:3px">Texto enviado al proveedor</div>Resume la reclamación de <span class="redact">NOMBRE</span> con DNI <span class="redact">DNI</span> y cuenta <span class="redact">IBAN</span> sobre el siniestro de hogar del 3 de septiembre.</div>
    <div style="font-size:9.6px;color:#6B7C8C;margin-top:8px">El texto original no se almacena.</div></div></div>"""
    return shell("Actividad", "Actividad y auditoría", "Cada petición y cada tool call, con su decisión y su recorrido", body)


def s_devs() -> str:
    tools = [("Claude Code", 48, INK), ("Copilot", 61, TEAL), ("Codex", 22, "#8CCDD4")]
    tb = "".join(f'<div style="display:flex;align-items:center;gap:9px;margin-bottom:8px;font-size:10.5px"><span style="width:70px">{n}</span>'
                 f'<div style="flex:1;height:10px;border-radius:5px;background:#EEF2F5"><div style="width:{v / 61 * 100:.0f}%;height:100%;border-radius:5px;background:{c}"></div></div>'
                 f'<b class="num" style="width:20px;text-align:right">{v}</b></div>' for n, v, c in tools)
    devs = [(1, "Laura Ortega", "Plataforma", ["Claude Code", "Copilot"], "412 €", "ok", "Activa", [30, 42, 38, 55, 61, 58, 72]),
            (2, "Marc Vidal", "Plataforma", ["Copilot CLI"], "188 €", "ok", "Activa", [20, 22, 25, 21, 28, 30, 27]),
            (3, "Rosa Castro", "Datos", ["Codex", "Claude Code"], "356 €", "warn", "Caduca en 3 días", [40, 44, 52, 49, 58, 55, 60]),
            (4, "Sergio Navarro", "Canales digitales", ["Claude Code"], "97 €", "ok", "Activa", [10, 14, 12, 18, 15, 16, 14]),
            (5, "Pablo Gil", "Datos", ["Copilot"], "0 €", "mute", "Sin uso, 34 días", [6, 4, 2, 1, 0, 0, 0]),
            (0, "Ana Ferrer", "Siniestros", ["Claude Code"], "241 €", "ok", "Activa", [22, 30, 28, 36, 40, 38, 44])]
    cards = ""
    for i, name, team, tl, spent, cls, st, vals in devs:
        chips = "".join(f'<span class="chip mute" style="padding:1.5px 7px;font-size:9px">{t}</span>' for t in tl)
        cards += (f'<div class="dev"><div style="display:flex;align-items:center;gap:9px">{avatar(i + 6 if i == 0 else i, 34)}'
                  f'<div style="min-width:0"><div style="font-size:11.5px;font-weight:600">{name}</div><div style="font-size:9.5px;color:#6B7C8C">{team}</div></div>'
                  f'<div style="margin-left:auto;text-align:right"><div class="num" style="font-size:14px">{spent}</div><div style="font-size:8.8px;color:#7A8A99">este mes</div></div></div>'
                  f'<div>{area(vals, 200, 48, TEAL, "rgba(10,111,125,.10)", 1.6, 4)}</div>'
                  f'<div style="display:flex;gap:4px;align-items:center">{chips}<span class="chip {cls}" style="margin-left:auto">{st}</span></div></div>')
    body = f"""<div class="r2"><div class="c2" style="flex:1.5"><h4>Desarrolladores por herramienta</h4>{tb}</div>
  <div class="c2" style="flex:1;display:flex;align-items:center;gap:12px">{ring(40, 64, 9, TEAL, '<div class="num" style="font-size:14px">86</div>')}<div><div style="font-size:11.5px;font-weight:600">Con clave propia</div><div style="font-size:9.8px;color:#6B7C8C;margin-top:2px">de 214 usuarios activos</div></div></div>
  <div class="c2" style="flex:1;display:flex;align-items:center;gap:12px"><div class="ic w" style="width:40px;height:40px;border-radius:14px">{ico("key", 18)}</div><div><div class="num" style="font-size:20px;line-height:1">5</div><div style="font-size:9.8px;color:#6B7C8C;margin-top:3px">claves caducan esta semana.<br>Se renuevan con el SSO.</div></div></div></div>
<div style="display:flex;align-items:center;gap:8px"><div class="seg"><span class="on">Todos</span><span>Plataforma</span><span>Datos</span><span>Siniestros</span></div>
  <span class="pillbtn" style="margin-left:auto">{ico("key", 11)}Emitir clave</span></div>
<div style="flex:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:12px">{cards}</div>"""
    return shell("Desarrolladores", "Desarrolladores y claves", "Una clave por persona, válida para todos sus CLIs", body)


def s_evidencias() -> str:
    cov = donut([(5, TEAL), (1, WARN), (2, BAD)], 118, 16, '<div class="num" style="font-size:20px;line-height:1">5 de 8</div><div style="font-size:8.8px;color:#6B7C8C;margin-top:3px">controles cubiertos</div>')
    ctrls = [("check", "g", "Inventario de herramientas y modelos en uso", "Cubierto", "ok"),
             ("check", "g", "Registro de accesos por usuario y equipo", "Cubierto", "ok"),
             ("check", "g", "Tratamiento de datos personales en peticiones", "Cubierto", "ok"),
             ("check", "g", "Límites de gasto aprobados y aplicados", "Cubierto", "ok"),
             ("check", "g", "Llamadas a tools MCP remotas, por usuario y tool", "Cubierto", "ok"),
             ("alert", "w", "Completions inline de Copilot, solo métricas agregadas", "Parcial", "warn"),
             ("block", "b", "Servidores MCP locales y tools internas del CLI", "No cubierto", "bad"),
             ("block", "b", "Chat web fuera del SSO corporativo", "No cubierto", "bad")]
    cl = "".join(f'<div class="li" style="padding:4px 0"><div class="ic {c}" style="width:21px;height:21px;border-radius:7px">{ico(i, 11, 2.2)}</div>'
                 f'<div class="tx">{t}</div><span class="chip {sc}">{s}</span></div>' for i, c, t, s, sc in ctrls)
    steps = [("Periodo", "Tercer trimestre de 2026"), ("Alcance", "Todos los equipos"), ("Contenido", "Inventario, accesos, políticas, datos, gasto"), ("Formato", "PDF firmado y CSV")]
    st = ""
    for n, (k, v) in enumerate(steps, 1):
        st += (f'<div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:6px"><div style="width:20px;height:20px;border-radius:50%;background:#0A6F7D;color:#fff;font-size:9.5px;font-weight:600;display:flex;align-items:center;justify-content:center;flex:none">{n}</div>'
               f'<div style="height:2px;flex:1;background:{"#0A6F7D" if n < 4 else "transparent"};border-radius:1px"></div></div>'
               f'<div style="font-size:9.3px;color:#6B7C8C;margin-top:6px">{k}</div><div style="font-size:10.4px;font-weight:600;line-height:1.3;padding-right:8px">{v}</div></div>')
    docs = [("Tercer trimestre de 2026", "1 oct 2026, 42 páginas"), ("Segundo trimestre de 2026", "1 jul 2026, 38 páginas"), ("Auditoría interna, mayo", "20 may 2026, PDF y CSV")]
    dl = "".join(f'<div class="li"><div class="ic t">{ico("file", 14)}</div><div class="tx"><b>{a}</b><span>{b}</span></div><div class="ib" style="width:26px;height:26px;background:#EEF2F5">{ico("down", 12)}</div></div>' for a, b in docs)
    body = f"""<div class="r2"><div class="c2" style="flex:0.85;display:flex;flex-direction:column;align-items:center"><h4 style="align-self:stretch">Cobertura</h4>{cov}
    <div style="display:flex;gap:10px;margin-top:10px"><span class="lg" style="padding:0"><i style="background:{TEAL}"></i>Cubierto</span><span class="lg" style="padding:0"><i style="background:{WARN}"></i>Parcial</span><span class="lg" style="padding:0"><i style="background:{BAD}"></i>No</span></div></div>
  <div class="c2" style="flex:1.75"><h4>Qué puede acreditar el informe</h4>{cl}</div></div>
<div class="r2" style="flex:1"><div class="c2" style="flex:1.45;display:flex;flex-direction:column"><h4>Generar informe</h4><div style="display:flex;margin-top:4px">{st}</div>
    <div style="margin-top:auto;padding-top:10px"><span class="pillbtn">{ico("file", 11)}Generar informe</span></div></div>
  <div class="c2" style="flex:1"><h4>Informes anteriores</h4>{dl}</div></div>"""
    return shell("Evidencias", "Evidencias", "Lo que se puede demostrar ante una auditoría, y lo que no", body)


def hub() -> str:
    cx, cy = 190, 150
    left = [("Copilot, métricas", OK, 40), ("Claude Code, OTel", OK, 104), ("Facturación cloud", BAD, 168), ("Entra ID", OK, 232)]
    right = [("Anthropic", OK, 40), ("OpenAI", OK, 104), ("AWS Bedrock", OK, 168), ("Azure OpenAI", "#9FB0BF", 232)]
    out = ""
    for items, x, anchor in ((left, 2, 126), (right, 254, 254)):
        for name, color, y in items:
            dash = "stroke-dasharray:4 4;" if color == "#9FB0BF" else ""
            out += (f'<path d="M {anchor} {y + 14} C {(anchor + cx) / 2} {y + 14} {(anchor + cx) / 2} {cy} {cx} {cy}" style="fill:none;stroke:{color};stroke-width:1.6;{dash}opacity:.75"/>'
                    f'<rect x="{x}" y="{y}" width="124" height="28" rx="14" style="fill:#F4F7F9"/>'
                    f'<circle cx="{x + 14}" cy="{y + 14}" r="4" style="fill:{color}"/>'
                    f'<text x="{x + 24}" y="{y + 17.5}" style="font-size:10px;fill:#12263A">{name}</text>')
    out += (f'<circle cx="{cx}" cy="{cy}" r="34" style="fill:#12263A"/>'
            f'<g transform="translate({cx - 17} {cy - 17}) scale(.36)"><path d="M 72 72 A 34 34 0 1 1 72 24" style="fill:none;stroke:#fff;stroke-width:11"/><circle cx="48" cy="48" r="10" style="fill:{TEAL_L}"/></g>'
            f'<text x="64" y="290" text-anchor="middle" style="font-size:9.5px;fill:#6B7C8C">Collectors e identidad</text>'
            f'<text x="316" y="290" text-anchor="middle" style="font-size:9.5px;fill:#6B7C8C">Proveedores de modelos</text>')
    return f'<svg viewBox="0 0 380 300" width="100%" style="display:block">{out}</svg>'


def s_conexiones() -> str:
    def row(letter, cls, name, detail, st, stc):
        return (f'<div class="li" style="padding:6.5px 0"><div class="ic {cls}" style="font-size:11px;font-weight:600">{letter}</div>'
                f'<div class="tx"><b>{name}</b><span>{detail}</span></div><span class="chip {stc}">{st}</span></div>')

    rows = (row("A", "k", "Anthropic", "Clave de organización, hace 1 min", "Conectado", "ok")
            + row("O", "k", "OpenAI", "Clave de proyecto, hace 1 min", "Conectado", "ok")
            + row("B", "k", "AWS Bedrock", "Rol de IAM, eu-west-1", "Conectado", "ok")
            + row("Az", "m", "Azure OpenAI", "Sin credenciales", "Sin configurar", "mute")
            + row("G", "t", "Métricas de GitHub Copilot", "Sincroniza cada hora", "Conectado", "ok")
            + row("C", "t", "Telemetría de Claude Code", "OpenTelemetry", "Conectado", "ok")
            + row("F", "b", "Facturación cloud", "La credencial caducó ayer", "Reconectar", "bad")
            + row("E", "t", "Microsoft Entra ID", "OIDC, 214 usuarios y 5 grupos", "Conectado", "ok"))
    body = f"""<div style="display:flex;align-items:center;gap:8px"><span class="chip ok" style="padding:5px 11px">6 conectadas</span><span class="chip bad" style="padding:5px 11px">1 con error</span><span class="chip mute" style="padding:5px 11px">1 sin configurar</span>
  <span class="pillbtn" style="margin-left:auto">{ico("plus", 11, 2.2)}Añadir conexión</span></div>
<div class="r2" style="flex:1"><div class="c2" style="flex:1.05;display:flex;flex-direction:column"><h4>Mapa de conexiones</h4><div style="flex:1;display:flex;align-items:center">{hub()}</div></div>
  <div class="c2" style="flex:1"><h4>Estado<span>última comprobación hace 1 min</span></h4>{rows}</div></div>"""
    return shell("Conexiones", "Conexiones", "De dónde sale cada dato y si está llegando", body)


def phone(body: str, tab: int, title: str) -> str:
    tabs = "".join(f'<span class="{"on" if i == tab else ""}">{ico(n, 15)}</span>' for i, n in enumerate(["grid", "bars", "bell", "user"]))
    bell_dot = '<span class="dot" style="border-color:#EEF2F5">3</span>'
    return f"""<div><div class="ph"><div class="scr">
  <div class="hd">{mirada(20)}<b>{title}</b><div class="ib" style="margin-left:auto;width:28px;height:28px">{ico("bell", 13)}{bell_dot}</div>{avatar(0, 28)}</div>
  {body}<div class="tabs">{tabs}</div></div></div></div>"""


def s_mobile(foot: str) -> str:
    p1 = f"""<div class="c2 dark" style="padding-bottom:0;overflow:hidden"><div style="font-size:9.8px;color:#9FB4C4">Gasto de septiembre</div>
  <div style="display:flex;align-items:flex-end;gap:8px"><div class="num" style="font-size:27px;line-height:1.15">18.420 €</div><span class="chip glass" style="margin-bottom:5px;padding:2px 7px;font-size:9px">+12 %</span></div>
  <div style="margin:6px -13px 0">{area(DAILY, 240, 56, TEAL_L, "rgba(108,203,211,.16)")}</div></div>
<div style="display:flex;gap:10px"><div class="c2" style="flex:1"><div style="font-size:9.3px;color:#6B7C8C">Usuarios activos</div><div class="num" style="font-size:18px">214</div></div>
  <div class="c2" style="flex:1"><div style="font-size:9.3px;color:#6B7C8C">Bloqueadas</div><div class="num" style="font-size:18px">342</div></div></div>
<div class="c2"><h4>Requiere atención</h4>
  <div class="li"><div class="ic w">{ico("alert", 14)}</div><div class="tx"><b>Siniestros al 92 %</b><span>Quedan 320 €</span></div></div>
  <div class="li"><div class="ic b">{ico("plug", 14)}</div><div class="tx"><b>Facturación cloud</b><span>Credencial caducada</span></div></div></div>"""

    def note(icon, cls, title, sub, a1, a2=""):
        b2 = f'<span class="pillbtn ghost" style="padding:5px 11px;font-size:9.8px">{a2}</span>' if a2 else ""
        return (f'<div class="c2"><div style="display:flex;gap:9px;align-items:center"><div class="ic {cls}">{ico(icon, 14)}</div>'
                f'<div style="min-width:0"><div style="font-size:11px;font-weight:600">{title}</div><div style="font-size:9.5px;color:#6B7C8C">{sub}</div></div></div>'
                f'<div style="display:flex;gap:6px;margin-top:9px"><span class="pillbtn" style="padding:5px 11px;font-size:9.8px">{a1}</span>{b2}</div></div>')

    p2 = (f'<div class="seg" style="align-self:flex-start"><span class="on">Pendientes</span><span>Todas</span></div>'
          + note("alert", "w", "Siniestros pide más presupuesto", "92 % consumido, quedan 320 €", "Ampliar 500 €", "Rechazar")
          + note("key", "m", "La clave de Rosa Castro caduca", "En 3 días, equipo Datos", "Renovar", "Revocar")
          + note("plug", "b", "Facturación cloud no sincroniza", "La credencial caducó ayer", "Reconectar")
          + note("eye", "t", "14 peticiones redactadas hoy", "En 2 aplicaciones de Siniestros", "Ver detalle"))
    rows = ""
    for name, _, budget, spent in TEAMS:
        pct = round(spent / budget * 100)
        col = WARN if pct >= 90 else TEAL
        rows += (f'<div class="li" style="padding:7px 0">{ring(pct, 34, 5, col, f"<div class=num style=font-size:8.5px>{pct}</div>")}'
                 f'<div class="tx"><b>{name}</b><span>{eur(spent)} de {eur(budget)}</span></div></div>')
    p3 = f"""<div class="seg" style="align-self:flex-start"><span class="on">Equipo</span><span>Modelo</span><span>Canal</span></div>
<div class="c2"><h4>Septiembre<span>86 % del presupuesto</span></h4>{rows}</div>"""
    return f"""<section class="slide"><div class="two">
  <div class="txt"><h2>En el móvil</h2><p>El móvil sirve para consultar y reaccionar: ver el gasto, aprobar o rechazar, renovar una clave. La configuración de reglas y conexiones se queda en el escritorio.</p>
    <div class="q"><span>Preguntas que responde</span><div>¿Hay algo que no puede esperar a mañana?<br><span>Responsable de plataforma</span></div><div>¿Cómo va el mes?<br><span>Finanzas</span></div></div>
    <div class="tag">Datos ilustrativos</div></div>
  <div class="phones">{phone(p1, 0, "Panel")}{phone(p2, 2, "Avisos")}{phone(p3, 1, "Costes")}</div>
</div>{foot}</section>"""
