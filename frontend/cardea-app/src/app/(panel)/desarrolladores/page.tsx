"use client";

import { useState } from "react";

import { Cabecera, Cargando } from "@/components/Cabecera";
import { Avatar, eur, Icono, Segmentos } from "@/components/graficos";
import { usePantalla } from "@/lib/demo/use-pantalla";

const EQUIPOS = ["Todos", "Plataforma", "Datos", "Siniestros"] as const;

function claveDeEjemplo(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return `crd_dev_${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export default function Desarrolladores() {
  const d = usePantalla("desarrolladores");
  const [equipo, setEquipo] = useState<(typeof EQUIPOS)[number]>("Todos");
  const [clave, setClave] = useState<string | null>(null);
  const [copiada, setCopiada] = useState(false);
  const cabecera = <Cabecera titulo="Desarrolladores y claves" subtitulo="Una clave por persona, válida para todos sus CLIs" />;
  if (!d) return <>{cabecera}<Cargando /></>;

  const max = Math.max(...d.herramientas.map((h) => h.valor));
  const devs = d.devs.filter((x) => equipo === "Todos" || x.equipo === equipo);
  const pctClave = Math.round((d.conClave / d.activos) * 100);

  function emitir() {
    setClave(claveDeEjemplo());
    setCopiada(false);
  }

  return (
    <>
      {cabecera}
      <section className="tarjeta grid gap-6 md:grid-cols-[3fr_2fr_2fr] md:gap-0 md:divide-x md:divide-cardea-linea-suave" aria-label="Resumen de claves">
        <div className="md:pr-6">
          <h2 className="meta mb-3">Desarrolladores por herramienta</h2>
          <ul className="space-y-2.5">
            {d.herramientas.map((h) => (
              <li key={h.nombre} className="grid grid-cols-[96px_1fr_32px] items-center gap-3">
                <span>{h.nombre}</span>
                <span className="pista"><i style={{ width: `${(h.valor / max) * 100}%` }} /></span>
                <span className="num text-right">{h.valor}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:px-6">
          <h2 className="meta">Con clave propia</h2>
          <p className="mt-1"><span className="num text-2xl">{d.conClave}</span> <span className="meta">de {d.activos} usuarios activos</span></p>
          <div className="pista mt-3"><i style={{ width: `${pctClave}%` }} /></div>
          <p className="etiqueta mt-1.5">{pctClave} % con clave</p>
        </div>
        <div className="md:pl-6">
          <h2 className="meta">Caducan esta semana</h2>
          <p className="num mt-1 text-2xl">{d.caducanSemana} claves</p>
          <p className="meta mt-1">Se renuevan solas con el SSO.</p>
        </div>
      </section>

      <div className="barra-herr">
        <Segmentos etiqueta="Filtrar por equipo" opciones={EQUIPOS} valor={equipo} onChange={setEquipo} />
        <button type="button" className="boton sm:ml-auto" onClick={emitir}>
          <Icono n="key" size={16} />Emitir clave
        </button>
      </div>

      {clave && (
        <section className="tarjeta flex flex-wrap items-center gap-4 ring-1 ring-cardea-petroleo" aria-live="polite" aria-label="Clave emitida">
          <div className="min-w-0 flex-1 basis-72">
            <p className="font-medium">Clave emitida para ti, válida 90 días en Claude Code, Codex y Copilot CLI</p>
            <p className="mono mt-1.5 break-all rounded-control bg-cardea-fila px-3 py-2 text-sm">{clave}</p>
            <p className="meta mt-1.5">Solo se muestra una vez. Es de demostración: no da acceso a nada.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="boton"
              onClick={() => {
                void navigator.clipboard?.writeText(clave);
                setCopiada(true);
              }}
            >
              <Icono n={copiada ? "check" : "copy"} size={16} />{copiada ? "Copiada" : "Copiar"}
            </button>
            <button type="button" className="boton sec" onClick={() => setClave(null)}>Cerrar</button>
          </div>
        </section>
      )}

      <section className="tarjeta" aria-labelledby="personas">
        <div className="tarjeta-titulo"><h2 id="personas">Personas</h2><span className="meta">{devs.length} con actividad este mes</span></div>
        <div role="table" aria-labelledby="personas">
          <div role="row" className="etiqueta hidden grid-cols-[2fr_2fr_1fr_1.2fr] gap-4 border-b border-cardea-linea-suave pb-2 md:grid">
            <span role="columnheader">Persona</span>
            <span role="columnheader">Herramientas</span>
            <span role="columnheader" className="text-right">Gasto del mes</span>
            <span role="columnheader" className="text-right">Clave</span>
          </div>
          <div className="lista">
            {devs.map((x) => (
              <div key={x.nombre} role="row" className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 py-3 md:grid-cols-[2fr_2fr_1fr_1.2fr]">
                <div role="cell" className="flex min-w-0 items-center gap-3">
                  <Avatar nombre={x.nombre} size={36} />
                  <div className="min-w-0">
                    <p className="font-medium">{x.nombre}</p>
                    <p className="meta">{x.equipo}</p>
                  </div>
                </div>
                <span role="cell" className="meta order-last col-span-2 md:order-none md:col-span-1">{x.herramientas.join(", ")}</span>
                <span role="cell" className="num text-right">{eur(x.gasto)}</span>
                <span role="cell" className="col-span-2 md:col-span-1 md:text-right"><span className={`chip ${x.tono}`}>{x.estado}</span></span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
