/** Gráficos e iconos del pitch (docs/pitch/pitch_ui.py), en SVG sin dependencias. */

/** Colores de los gráficos: solo tokens. Los de estado, solo para estado. */
export const TINTA = "var(--color-cardea-tinta)";
export const PETROLEO = "var(--color-cardea-petroleo)";
/** Serie de marca para categorías (equipos, modelos, canales): de tinta a niebla. */
export const SERIE = [TINTA, PETROLEO, "var(--color-cardea-serie-3)", "var(--color-cardea-serie-4)", "var(--color-cardea-serie-5)"];

const ICONOS = {
  grid: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
  bars: "M5 20V11 M12 20V4 M19 20v-6",
  shield: "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z",
  pulse: "M3 12h4l3-7 4 14 3-7h4",
  users: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6 M16 4.5a3.5 3.5 0 0 1 0 6.5 M21 20c0-2.6-1.6-4.8-4-5.6",
  file: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M9 14l2 2 4-4",
  plug: "M9 3v5 M15 3v5 M6 8h12v3a6 6 0 0 1-12 0z M12 17v4",
  bell: "M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z M10 21h4",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M20 20l-4-4",
  plus: "M12 5v14 M5 12h14",
  key: "M7.5 18a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M10 12l9-9 M16 6l3 3 M13 9l2 2",
  down: "M12 4v11 M7 11l5 5 5-5 M5 20h14",
  check: "M5 12l5 5 9-10",
  alert: "M12 4l9 16H3z M12 10v4 M12 17v.5",
  block: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M6 6l12 12",
  term: "M4 5h16v14H4z M7 9l3 3-3 3 M12 15h5",
  box: "M4 8l8-4 8 4v8l-8 4-8-4z M4 8l8 4 8-4 M12 12v8",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
  sliders: "M4 7h10 M18 7h2 M4 17h4 M12 17h8 M16 5v4 M10 15v4",
  chev: "M6 9l6 6 6-6",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8",
  euro: "M17 6a7 7 0 1 0 0 12 M4 10h9 M4 14h9",
  send: "M4 12l16-8-6 16-3-7z",
  logout: "M15 4h4v16h-4 M10 8l-4 4 4 4 M6 12h10",
  menu: "M4 7h16 M4 12h16 M4 17h16",
  close: "M6 6l12 12 M18 6L6 18",
  copy: "M9 9h11v11H9z M5 15H4V4h11v1",
} as const;

export type NombreIcono = keyof typeof ICONOS;

export function Icono({ n, size = 14, sw = 1.8 }: { n: NombreIcono; size?: number; sw?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={{ display: "block", flex: "none", fill: "none", stroke: "currentColor", strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" }}>
      <path d={ICONOS[n]} />
    </svg>
  );
}

function iniciales(nombre: string): string {
  const partes = nombre.replace(/^app-/, "").split(/[\s-]+/).filter(Boolean);
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase();
}

/** Iniciales sobre niebla: sin colores inventados por persona. */
export function Avatar({ nombre, size = 32 }: { nombre: string; size?: number }) {
  return (
    <span className="avatar" aria-hidden="true" style={{ width: size, height: size, fontSize: size >= 36 ? 13 : 12 }}>
      {iniciales(nombre)}
    </span>
  );
}

function suave(pts: [number, number][]): string {
  const p = (i: number) => pts[i]!;
  let d = `M ${p(0)[0].toFixed(1)} ${p(0)[1].toFixed(1)}`;
  const n = pts.length;
  for (let i = 0; i < n - 1; i++) {
    const [p0, p1, p2, p3] = [p(Math.max(i - 1, 0)), p(i), p(i + 1), p(Math.min(i + 2, n - 1))];
    const c1: [number, number] = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: [number, number] = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/** Área suavizada. El eje parte de cero para no exagerar la variación. */
export function Area({ vals, w, h, line, fill, sw = 2, pad = 4 }: { vals: number[]; w: number; h: number; line: string; fill: string; sw?: number; pad?: number }) {
  const mx = Math.max(...vals);
  const mn = 0;
  const span = mx - mn || 1;
  const pts = vals.map((v, i): [number, number] => [(i * w) / (vals.length - 1), pad + (h - 2 * pad) * (1 - (v - mn) / span)]);
  const d = suave(pts);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ display: "block" }} aria-hidden="true">
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} style={{ fill }} />
      <path d={d} fill="none" style={{ stroke: line }} strokeWidth={sw} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function eur(v: number, decimales = 0): string {
  return `${v.toLocaleString("es-ES", { minimumFractionDigits: decimales, maximumFractionDigits: decimales, useGrouping: "always" })} €`;
}

export function miles(v: number): string {
  return v.toLocaleString("es-ES", { useGrouping: "always" });
}

/** Filtros como pestañas subrayadas. Son botones que se pulsan, no pestañas con panel. */
export function Segmentos<T extends string>({ opciones, valor, onChange, etiqueta }: { opciones: readonly T[]; valor: T; onChange: (v: T) => void; etiqueta: string }) {
  return (
    <div className="pestanas" role="group" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button key={o} type="button" aria-pressed={o === valor} onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

/** Props para que una fila seleccionable funcione también con teclado (Enter o espacio). */
export function filaPulsable(activa: boolean, elegir: () => void) {
  return {
    role: "button" as const,
    tabIndex: 0,
    "aria-pressed": activa,
    onClick: elegir,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        elegir();
      }
    },
  };
}
