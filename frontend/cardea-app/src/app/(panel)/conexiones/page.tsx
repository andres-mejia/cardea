"use client";

import { useEffect, useState } from "react";

import { Cabecera, Cargando } from "@/components/Cabecera";
import { BAD, Icono, OK, TEAL_L } from "@/components/graficos";
import type { DatosDe } from "@/lib/demo/datos";
import { usePantalla } from "@/lib/demo/use-pantalla";

type Datos = DatosDe<"conexiones">;
const COLOR: Record<string, string> = { ok: OK, bad: BAD, mute: "#9FB0BF" };

function Mapa({ colectores, proveedores }: { colectores: Datos["colectores"]; proveedores: Datos["proveedores"] }) {
  const [cx, cy] = [190, 150];
  const ys = [40, 104, 168, 232];
  const lado = (items: { nombre: string; estado: string }[], x: number, ancla: number) =>
    items.map((it, i) => {
      const y = ys[i] ?? 0;
      const color = COLOR[it.estado];
      return (
        <g key={it.nombre}>
          <path d={`M ${ancla} ${y + 14} C ${(ancla + cx) / 2} ${y + 14} ${(ancla + cx) / 2} ${cy} ${cx} ${cy}`} fill="none" stroke={color} strokeWidth={1.6} strokeDasharray={it.estado === "mute" ? "4 4" : undefined} opacity={0.75} />
          <rect x={x} y={y} width={124} height={28} rx={14} fill="#F4F7F9" />
          <circle cx={x + 14} cy={y + 14} r={4} fill={color} />
          <text x={x + 24} y={y + 17.5} style={{ fontSize: 10, fill: "#12263A" }}>{it.nombre}</text>
        </g>
      );
    });
  return (
    <svg viewBox="0 0 380 300" width="100%" style={{ display: "block" }} role="img" aria-label="Mapa de conexiones">
      {lado(colectores, 2, 126)}
      {lado(proveedores, 254, 254)}
      <circle cx={cx} cy={cy} r={34} fill="#12263A" />
      <g transform={`translate(${cx - 17} ${cy - 17}) scale(.36)`}>
        <path d="M 72 72 A 34 34 0 1 1 72 24" fill="none" stroke="#fff" strokeWidth={11} />
        <circle cx={48} cy={48} r={10} fill={TEAL_L} />
      </g>
      <text x={64} y={290} textAnchor="middle" style={{ fontSize: 9.5, fill: "#6B7C8C" }}>Collectors e identidad</text>
      <text x={316} y={290} textAnchor="middle" style={{ fontSize: 9.5, fill: "#6B7C8C" }}>Proveedores de modelos</text>
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
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="chip ok" style={{ padding: "5px 11px" }}>{cuenta("ok")} conectadas</span>
        {cuenta("bad") > 0 && <span className="chip bad" style={{ padding: "5px 11px" }}>{cuenta("bad")} con error</span>}
        <span className="chip mute" style={{ padding: "5px 11px" }}>{cuenta("mute")} sin configurar</span>
        <button type="button" className="pillbtn" style={{ marginLeft: "auto" }}><Icono n="plus" size={11} sw={2.2} />Añadir conexión</button>
      </div>
      <div className="r2" style={{ flex: 1 }}>
        <div className="c2" style={{ flex: 1.05, display: "flex", flexDirection: "column" }}>
          <h4>Mapa de conexiones</h4>
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <Mapa colectores={datos.colectores} proveedores={datos.proveedores} />
          </div>
        </div>
        <div className="c2" style={{ flex: 1 }}>
          <h4>Estado<span>última comprobación hace 1 min</span></h4>
          {datos.estado.map((e) => (
            <div key={e.nombre} className="li" style={{ padding: "6.5px 0" }}>
              <div className={`ic ${e.clase}`} style={{ fontSize: 11, fontWeight: 600 }}>{e.letra}</div>
              <div className="tx"><b>{e.nombre}</b><span>{e.detalle}</span></div>
              {e.tono === "bad" ? (
                <button type="button" className="chip bad" onClick={() => reconectar(e.nombre)} disabled={reconectando}>
                  {reconectando ? "Reconectando…" : e.estado}
                </button>
              ) : (
                <span className={`chip ${e.tono}`}>{e.estado}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
