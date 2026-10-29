"use client";

import { useEffect, useState } from "react";

import { Cabecera, Cargando } from "@/components/Cabecera";

import type { DatosDe } from "@/lib/demo/datos";
import { usePantalla } from "@/lib/demo/use-pantalla";

type Datos = DatosDe<"conexiones">;
const COLOR: Record<string, string> = { ok: "var(--color-estado-permitida)", bad: "var(--color-estado-bloqueada)", mute: "var(--color-cardea-pista)" };

function Mapa({ colectores, proveedores }: { colectores: Datos["colectores"]; proveedores: Datos["proveedores"] }) {
  const [cx, cy] = [190, 150];
  const ys = [40, 104, 168, 232];
  const lado = (items: { nombre: string; estado: string }[], x: number, ancla: number) =>
    items.map((it, i) => {
      const y = ys[i] ?? 0;
      const color = COLOR[it.estado];
      return (
        <g key={it.nombre}>
          <path d={`M ${ancla} ${y + 14} C ${(ancla + cx) / 2} ${y + 14} ${(ancla + cx) / 2} ${cy} ${cx} ${cy}`} fill="none" style={{ stroke: it.estado === "ok" ? "var(--color-cardea-linea)" : color }} strokeWidth={1.6} strokeDasharray={it.estado === "mute" ? "4 4" : undefined} />
          <rect x={x} y={y} width={124} height={28} rx={10} style={{ fill: "var(--color-cardea-fila)" }} />
          <circle cx={x + 14} cy={y + 14} r={4} style={{ fill: color }} />
          <text x={x + 24} y={y + 17.5} style={{ fontSize: 10.5, fill: "var(--color-cardea-tinta)" }}>{it.nombre}</text>
        </g>
      );
    });
  return (
    <svg viewBox="0 0 380 300" width="100%" style={{ display: "block" }} role="img" aria-label="Mapa de conexiones">
      {lado(colectores, 2, 126)}
      {lado(proveedores, 254, 254)}
      <circle cx={cx} cy={cy} r={34} style={{ fill: "var(--color-cardea-tinta)" }} />
      <g transform={`translate(${cx - 17} ${cy - 17}) scale(.36)`}>
        <path d="M 72 72 A 34 34 0 1 1 72 24" fill="none" stroke="#fff" strokeWidth={11} />
        <circle cx={48} cy={48} r={10} style={{ fill: "var(--color-cardea-petroleo-claro)" }} />
      </g>
      <text x={64} y={290} textAnchor="middle" style={{ fontSize: 10, fill: "var(--color-cardea-texto-suave)" }}>Collectors e identidad</text>
      <text x={316} y={290} textAnchor="middle" style={{ fontSize: 10, fill: "var(--color-cardea-texto-suave)" }}>Proveedores de modelos</text>
    </svg>
  );
}

export default function Conexiones() {
  const d = usePantalla("conexiones");
  const [datos, setDatos] = useState<Datos | null>(null);
  const [reconectando, setReconectando] = useState(false);
  useEffect(() => {
    if (d) setDatos(d);
  }, [d]);
  const cabecera = <Cabecera titulo="Conexiones" subtitulo="De dónde sale cada dato y si está llegando" />;
  if (!datos) return <>{cabecera}<Cargando /></>;

  const cuenta = (t: string) => datos.estado.filter((e) => e.tono === t).length;

  function reconectar(nombre: string) {
    setReconectando(true);
    setTimeout(() => {
      setReconectando(false);
      setDatos((x) =>
        x && {
          ...x,
          estado: x.estado.map((e) => (e.nombre === nombre ? { ...e, clase: "t", detalle: "Credencial renovada ahora", estado: "Conectado", tono: "ok" } : e)),
          colectores: x.colectores.map((c) => (c.nombre === "Facturación cloud" ? { ...c, estado: "ok" } : c)),
        },
      );
    }, 1200);
  }

  return (
    <>
      {cabecera}
      <ul className="flex flex-wrap items-center gap-2" aria-label="Resumen de conexiones">
        <li className="chip ok">{cuenta("ok")} conectadas</li>
        {cuenta("bad") > 0 && <li className="chip bad">{cuenta("bad")} con error</li>}
        <li className="chip mute">{cuenta("mute")} sin configurar</li>
      </ul>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <section className="tarjeta solo-escritorio" aria-labelledby="mapa">
          <div className="tarjeta-titulo"><h2 id="mapa">Mapa de conexiones</h2></div>
          <div className="mx-auto max-w-[520px]">
            <Mapa colectores={datos.colectores} proveedores={datos.proveedores} />
          </div>
        </section>
        <section className="tarjeta" aria-labelledby="estado">
          <div className="tarjeta-titulo">
            <h2 id="estado">Estado</h2>
            <span className="meta">Última comprobación hace 1 min</span>
          </div>
          <ul className="lista">
            {datos.estado.map((e) => (
              <li key={e.nombre} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                <span className="avatar size-9 rounded-control text-sm" aria-hidden="true">{e.letra}</span>
                <div className="min-w-0 flex-1 basis-40">
                  <p className="font-medium">{e.nombre}</p>
                  <p className="meta">{e.detalle}</p>
                </div>
                <span className={`chip ${e.tono}`}>{e.estado}</span>
                {e.tono === "bad" && (
                  <button type="button" className="boton sec peq" onClick={() => reconectar(e.nombre)} disabled={reconectando}>
                    {reconectando ? "Reconectando…" : "Reconectar"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
