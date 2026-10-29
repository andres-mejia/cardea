"use client";

import { useMemo, useState } from "react";

import { Cabecera, Cargando } from "@/components/Cabecera";
import { Avatar, filaPulsable, Icono, miles, Segmentos } from "@/components/graficos";
import type { DatosDe } from "@/lib/demo/datos";
import { usePantalla } from "@/lib/demo/use-pantalla";

const FILTROS = ["Todas", "Con incidencia"] as const;
type Peticion = DatosDe<"actividad">["feed"][number];

/** Permitida en neutro; redactada en petróleo (información); bloqueada en su color de estado. */
const COLOR_BARRA = ["var(--color-cardea-pista)", "var(--color-cardea-petroleo)", "var(--color-estado-bloqueada)"];

/** Generador determinista (mulberry32) para que el histograma no cambie entre renders. */
function aleatorio(semilla: number) {
  let a = semilla;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Histograma() {
  const barras = useMemo(() => {
    const r = aleatorio(7);
    return Array.from({ length: 60 }, (_, i) => {
      const ok = 22 + Math.floor(r() * 23) + (i > 20 && i < 40 ? 10 : 0);
      const red = [0, 0, 1, 2, 3][Math.floor(r() * 5)] ?? 0;
      const blk = [9, 31, 32, 47].includes(i) ? 1 : 0;
      return [ok, red * 3, blk * 6];
    });
  }, []);
  const [w, h] = [700, 80];
  const ancho = w / 60;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ display: "block" }} role="img" aria-label="Peticiones por minuto en la última hora">
      {barras.map((b, i) => {
        let y = h;
        return (
          <g key={i}>
            {b.map((v, j) => {
              if (!v) return null;
              y -= v;
              return <rect key={j} x={i * ancho + 1.5} y={y} width={ancho - 3} height={v - 1} rx={1.5} style={{ fill: COLOR_BARRA[j] }} />;
            })}
          </g>
        );
      })}
    </svg>
  );
}

function Detalle({ p }: { p: Peticion }) {
  const pasos: [string, string?][] = [["Recibida", p.hora]];
  pasos.push([p.regla === "Ninguna aplicable" ? "Reglas evaluadas, ninguna aplica" : `Regla evaluada: ${p.regla}`, `${p.ms} ms`]);
  if (p.decision === "Redactada") pasos.push([`${p.redactados ?? 0} datos sustituidos por marcadores`]);
  if (p.decision === "Bloqueada") pasos.push(["Petición rechazada, no sale de la red"]);
  else {
    if (p.decision === "Aviso") pasos.push(["Aviso enviado a quien la lanza"]);
    pasos.push([p.coste === "tool" ? `Tool ejecutada en ${p.proveedor}` : `Enviada a ${p.proveedor}`]);
    pasos.push(["Respuesta entregada", p.coste === "tool" ? p.latencia : `${p.latencia}, ${p.coste}`]);
  }
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">{p.quien}</h2>
          <p className="meta">{p.herramienta} · {p.destino}</p>
        </div>
        <span className={`chip ${p.tono}`}>{p.decision}</span>
      </div>
      <p className="etiqueta mono mt-1">{p.id}</p>
      <ol className="cronologia mt-4">
        {pasos.map(([t, s]) => <li key={t}>{t}{s && <span className="meta ml-2">{s}</span>}</li>)}
      </ol>
      <div className="bloque mt-4">
        {p.decision === "Redactada" ? (
          <>
            <p className="etiqueta mb-1">Texto enviado al proveedor</p>
            <p className="leading-6">Resume la reclamación de <span className="redact">NOMBRE</span> con DNI <span className="redact">DNI</span> y cuenta <span className="redact">IBAN</span> sobre el siniestro de hogar del 3 de septiembre.</p>
          </>
        ) : (
          <>
            <p className="etiqueta mb-1">Metadatos registrados</p>
            <p>{p.herramienta} · {p.destino} · decisión {p.decision.toLowerCase()}</p>
          </>
        )}
      </div>
      <p className="meta mt-3 flex items-center gap-1.5"><Icono n="shield" size={14} />El texto original no se almacena.</p>
    </>
  );
}

export default function Actividad() {
  const d = usePantalla("actividad");
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>("Todas");
  const [sel, setSel] = useState("req_7f3a91c2");
  const cabecera = <Cabecera titulo="Actividad y auditoría" subtitulo="Cada petición y cada tool call, con su decisión y su recorrido" />;
  if (!d) return <>{cabecera}<Cargando /></>;

  const feed = d.feed.filter((p) => filtro === "Todas" || p.decision !== "Permitida");
  const elegida = d.feed.find((p) => p.id === sel) ?? d.feed[0]!;

  function elegir(id: string) {
    setSel(id);
    const el = document.getElementById("detalle-peticion");
    if (el && window.matchMedia("(max-width: 1023px)").matches) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const leyenda: [string, string, string][] = [
    [COLOR_BARRA[0]!, miles(d.resumen.permitidas), "permitidas"],
    [COLOR_BARRA[1]!, miles(d.resumen.redactadas), "redactadas"],
    [COLOR_BARRA[2]!, miles(d.resumen.bloqueadas), "bloqueadas"],
  ];
  return (
    <>
      {cabecera}
      <section className="tarjeta" aria-labelledby="minuto">
        <div className="tarjeta-titulo">
          <h2 id="minuto">Peticiones por minuto, última hora</h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {leyenda.map(([color, n, texto]) => (
              <li key={texto} className="meta flex items-center gap-1.5"><span className="muestra" style={{ background: color }} /><span className="num text-cardea-tinta">{n}</span> {texto}</li>
            ))}
            <li className="meta"><span className="num text-cardea-tinta">{miles(d.resumen.tools)}</span> tool calls</li>
          </ul>
        </div>
        <Histograma />
        <div className="etiqueta mt-1.5 flex justify-between"><span>Hace 60 min</span><span>Ahora</span></div>
      </section>

      <div className="grid items-start gap-4 lg:grid-cols-[3fr_2fr]">
        <section className="tarjeta" aria-labelledby="directo">
          <div className="tarjeta-titulo">
            <h2 id="directo">En directo</h2>
          </div>
          <Segmentos etiqueta="Filtrar peticiones" opciones={FILTROS} valor={filtro} onChange={setFiltro} />
          <ul className="-mx-3 mt-2">
            {feed.map((p) => (
              <li
                key={p.id}
                {...filaPulsable(p.id === elegida.id, () => elegir(p.id))}
                className="seleccionable grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 px-3 py-2.5 sm:grid-cols-[auto_1fr_auto_auto_auto]"
              >
                {p.app ? (
                  <span className="avatar size-8 bg-cardea-tinta text-white"><Icono n="box" size={16} /></span>
                ) : (
                  <Avatar nombre={p.quien} size={32} />
                )}
                <div className="min-w-0">
                  <p className="font-medium">{p.quien}</p>
                  <p className="meta truncate">{p.herramienta} · {p.destino}</p>
                </div>
                <span className="num hidden text-right sm:block">{p.coste === "tool" ? <span className="meta font-normal">tool</span> : p.coste}</span>
                <span className={`chip justify-self-end ${p.tono}`}>{p.decision}</span>
                <span className="meta col-start-2 sm:col-start-auto">{p.hora}<span className="sm:hidden"> · {p.coste}</span></span>
              </li>
            ))}
          </ul>
        </section>
        <section id="detalle-peticion" className="tarjeta scroll-mt-20" aria-label="Detalle de la petición">
          <Detalle p={elegida} />
        </section>
      </div>
    </>
  );
}
