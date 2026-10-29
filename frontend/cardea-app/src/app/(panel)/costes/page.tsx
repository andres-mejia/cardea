"use client";

import { useState } from "react";

import { Cabecera, Cargando } from "@/components/Cabecera";
import { eur, Icono, Segmentos, SERIE } from "@/components/graficos";
import type { Equipo } from "@/lib/demo/datos";
import { usePantalla } from "@/lib/demo/use-pantalla";

const VISTAS = ["Equipo", "Proyecto", "Modelo", "Herramienta"] as const;
type Vista = (typeof VISTAS)[number];

/** Barras apiladas por semana. En HTML para que las etiquetas no encojan con el ancho. */
function Semanas({ semanas, grupos }: { semanas: { etiqueta: string; total: number }[]; grupos: Equipo[] }) {
  const total = grupos.reduce((s, g) => s + g.gastado, 0);
  const max = Math.max(...semanas.map((s) => s.total));
  return (
    <div className="flex h-56 items-end gap-4 sm:gap-8" role="img" aria-label={`Gasto semanal: ${semanas.map((s) => `${s.etiqueta} ${eur(s.total)}`).join(", ")}`}>
      {semanas.map((s) => (
        <div key={s.etiqueta} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
          <span className="num mb-1.5 text-sm">{eur(s.total)}</span>
          <div className="flex w-full max-w-16 flex-col-reverse gap-0.5" style={{ height: `${(s.total / max) * 80}%` }}>
            {grupos.map((g, j) => (
              <span key={g.nombre} className="block w-full first:rounded-b-md last:rounded-t-md" style={{ flexGrow: g.gastado / total, background: SERIE[j % SERIE.length] }} />
            ))}
          </div>
          <span className="etiqueta mt-2">{s.etiqueta}</span>
        </div>
      ))}
    </div>
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
  const maxModelo = Math.max(...d.modelos.map((m) => m.valor));

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
      <div className="barra-herr">
        <Segmentos etiqueta="Agrupar por" opciones={VISTAS} valor={vista} onChange={setVista} />
        <span className="meta flex items-center gap-1.5"><Icono n="clock" size={14} />{d.periodo}</span>
        <button type="button" className="boton sec sm:ml-auto" onClick={exportar}>
          <Icono n="down" size={16} />Exportar chargeback (CSV)
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <section className="tarjeta" aria-labelledby="semanal">
          <div className="tarjeta-titulo"><h2 id="semanal">Gasto semanal</h2><span className="meta">{eur(d.total)} en el mes</span></div>
          <Semanas semanas={d.semanas} grupos={grupos} />
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
            {grupos.map((g, i) => (
              <li key={g.nombre} className="meta flex items-center gap-1.5"><span className="muestra" style={{ background: SERIE[i % SERIE.length] }} />{g.nombre}</li>
            ))}
          </ul>
        </section>

        <section className="tarjeta" aria-labelledby="modelo">
          <div className="tarjeta-titulo"><h2 id="modelo">Por familia de modelo</h2></div>
          <ul className="space-y-4">
            {d.modelos.map((m) => (
              <li key={m.nombre}>
                <div className="flex justify-between gap-3">
                  <span>{m.nombre}</span>
                  <span className="num">{eur(m.valor)} <span className="meta font-normal">· {Math.round((m.valor / d.total) * 100)} %</span></span>
                </div>
                <div className="pista mt-1.5"><i style={{ width: `${(m.valor / maxModelo) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="tarjeta" aria-labelledby="reparto">
        <div className="tarjeta-titulo"><h2 id="reparto">Presupuesto por {vista.toLowerCase()}</h2></div>
        <div role="table" aria-labelledby="reparto">
          <div role="row" className="etiqueta hidden grid-cols-[2fr_1fr_1fr_1fr_2fr] gap-4 border-b border-cardea-linea-suave pb-2 md:grid">
            <span role="columnheader">{vista}</span>
            <span role="columnheader">Centro de coste</span>
            <span role="columnheader" className="text-right">Gastado</span>
            <span role="columnheader" className="text-right">Presupuesto</span>
            <span role="columnheader">Consumo</span>
          </div>
          <div className="lista">
            {grupos.map((g) => {
              const pct = Math.round((g.gastado / g.presupuesto) * 100);
              const cerca = pct >= 90;
              return (
                <div key={g.nombre} role="row" className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 py-3 md:grid-cols-[2fr_1fr_1fr_1fr_2fr]">
                  <span role="cell" className="font-medium">{g.nombre}</span>
                  <span role="cell" className="meta text-right md:text-left">{g.centro}</span>
                  <span role="cell" className="num hidden text-right md:block">{eur(g.gastado)}</span>
                  <span role="cell" className="num hidden text-right font-normal text-cardea-texto md:block">{eur(g.presupuesto)}</span>
                  <span role="cell" className="col-span-2 flex items-center gap-3 md:col-span-1">
                    <span className="pista flex-1"><i className={cerca ? "warn" : ""} style={{ width: `${Math.min(pct, 100)}%` }} /></span>
                    <span className={`num w-12 text-right ${cerca ? "text-estado-aviso-texto" : ""}`}>{pct} %</span>
                  </span>
                  <span className="meta col-span-2 md:hidden">{eur(g.gastado)} de {eur(g.presupuesto)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
