"use client";

import { useState } from "react";

import { Cabecera, Cargando } from "@/components/Cabecera";
import { Anillo, Donut, eur, Icono, INK, RAMP, Segmentos, TEAL, WARN } from "@/components/graficos";
import type { Equipo } from "@/lib/demo/datos";
import { usePantalla } from "@/lib/demo/use-pantalla";

const VISTAS = ["Equipo", "Proyecto", "Modelo", "Herramienta"] as const;
type Vista = (typeof VISTAS)[number];
const COLORES_MODELO = [INK, TEAL, "#3FA3AE", "#C9D8E2"];

function Semanas({ semanas, grupos }: { semanas: { etiqueta: string; total: number }[]; grupos: Equipo[] }) {
  const total = grupos.reduce((s, g) => s + g.gastado, 0);
  const [w, h, base, mx] = [420, 196, 168, 5600];
  const y = (v: number) => base - ((base - 14) * v) / mx;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: "block" }} role="img" aria-label="Gasto semanal por grupo">
      {[0, 2000, 4000].map((g) => (
        <g key={g}>
          <line x1={34} y1={y(g)} x2={w} y2={y(g)} stroke="#EEF2F5" strokeWidth={1} />
          <text x={28} y={y(g) + 3} textAnchor="end" style={{ fontSize: 8.5, fill: "#7A8A99" }}>{g / 1000}k</text>
        </g>
      ))}
      {semanas.map((s, i) => {
        const x = 62 + i * 92;
        let cima = base;
        const rects = grupos.map((g, j) => {
          const hh = ((base - 14) * ((s.total * g.gastado) / total)) / mx;
          cima -= hh;
          return <rect key={g.nombre} x={x} y={cima + 1.5} width={46} height={Math.max(hh - 3, 0)} rx={5} fill={RAMP[j % RAMP.length]} />;
        });
        return (
          <g key={s.etiqueta}>
            {rects}
            <text x={x + 23} y={cima - 5} textAnchor="middle" style={{ fontSize: 9.5, fontWeight: 600, fill: "#12263A" }}>{eur(s.total)}</text>
            <text x={x + 23} y={base + 15} textAnchor="middle" style={{ fontSize: 9.5, fill: "#6B7C8C" }}>{s.etiqueta}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Costes() {
  const d = usePantalla("costes");
  const [vista, setVista] = useState<Vista>("Equipo");
  const cabecera = <Cabecera titulo="Costes y chargeback" subtitulo="Reparto por equipo y centro de coste" />;
  if (!d) return <>{cabecera}<Cargando /></>;

  const grupos: Equipo[] =
    vista === "Proyecto" ? d.proyectos
    : vista === "Herramienta" ? d.herramientas
    : vista === "Modelo" ? d.modelos.map((m) => ({ nombre: m.nombre, centro: "Modelo", presupuesto: Math.round((m.valor * 1.18) / 100) * 100, gastado: m.valor }))
    : d.equipos;

  function exportar() {
    const filas = [["grupo", "centro_de_coste", "presupuesto_eur", "gastado_eur"], ...grupos.map((g) => [g.nombre, g.centro, String(g.presupuesto), String(g.gastado)])];
    const csv = filas.map((f) => f.join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([`# Datos ilustrativos\n${csv}\n`], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `chargeback-${vista.toLowerCase()}-ilustrativo.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {cabecera}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Segmentos opciones={VISTAS} valor={vista} onChange={setVista} />
        <span className="chip line" style={{ padding: "6px 11px" }}><Icono n="clock" size={11} />{d.periodo}</span>
        <button type="button" className="pillbtn ghost" style={{ marginLeft: "auto" }} onClick={exportar}>
          <Icono n="down" size={11} />Exportar chargeback
        </button>
      </div>
      <div className="r2">
        <div className="c2" style={{ flex: 1.7 }}>
          <h4>
            Gasto semanal
            <span style={{ display: "flex", gap: 9, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {grupos.map((g, i) => (
                <span key={g.nombre} className="lg" style={{ padding: 0 }}><i style={{ background: RAMP[i % RAMP.length] }} />{g.nombre}</span>
              ))}
            </span>
          </h4>
          <Semanas semanas={d.semanas} grupos={grupos} />
        </div>
        <div className="c2" style={{ flex: 1 }}>
          <h4>Por familia de modelo</h4>
          <div style={{ display: "flex", justifyContent: "center", margin: "2px 0 10px" }}>
            <Donut segs={d.modelos.map((m, i): [number, string] => [m.valor, COLORES_MODELO[i] ?? "#C9D8E2"])} size={112} thick={16}>
              <div className="num" style={{ fontSize: 14 }}>{eur(d.total)}</div>
              <div style={{ fontSize: 8.5, color: "#6B7C8C" }}>total</div>
            </Donut>
          </div>
          {d.modelos.map((m, i) => (
            <div key={m.nombre} className="lg"><i style={{ background: COLORES_MODELO[i] }} />{m.nombre}<b>{eur(m.valor)}</b></div>
          ))}
        </div>
      </div>
      <div className="r2" style={{ flex: 1 }}>
        {grupos.map((g) => {
          const pct = Math.round((g.gastado / g.presupuesto) * 100);
          return (
            <div key={g.nombre} className="c2" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "13px 8px 12px" }}>
              <Anillo pct={pct} size={78} thick={10} color={pct >= 90 ? WARN : TEAL}>
                <div className="num" style={{ fontSize: 15 }}>{pct} %</div>
              </Anillo>
              <div style={{ fontSize: 11, fontWeight: 600, marginTop: 8 }}>{g.nombre}</div>
              <div style={{ fontSize: 9.6, color: "#6B7C8C", marginTop: 2 }}>{eur(g.gastado)} de {eur(g.presupuesto)}</div>
              <span className="chip mute mono" style={{ marginTop: 7, fontSize: 8.8 }}>{g.centro}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
