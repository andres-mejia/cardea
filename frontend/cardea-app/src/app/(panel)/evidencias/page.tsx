"use client";

import { useEffect, useState } from "react";

import { Cabecera, Cargando } from "@/components/Cabecera";
import { Icono } from "@/components/graficos";
import { usePantalla } from "@/lib/demo/use-pantalla";

type Informe = { titulo: string; detalle: string };

function descargar(titulo: string, controles: { texto: string; estado: string }[]) {
  const csv = ["control;estado", ...controles.map((c) => `${c.texto};${c.estado}`)].join("\n");
  const url = URL.createObjectURL(new Blob([`# ${titulo}. Datos ilustrativos\n${csv}\n`], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `evidencias-${titulo.toLowerCase().replaceAll(" ", "-")}-ilustrativo.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Evidencias() {
  const d = usePantalla("evidencias");
  const [informes, setInformes] = useState<Informe[]>([]);
  const [generando, setGenerando] = useState(0);
  const [listo, setListo] = useState(false);
  useEffect(() => {
    if (d) setInformes(d.anteriores);
  }, [d]);
  const cabecera = <Cabecera titulo="Evidencias" subtitulo="Lo que se puede demostrar ante una auditoría, y lo que no" />;
  if (!d) return <>{cabecera}<Cargando /></>;

  const cuenta = (t: string) => d.controles.filter((c) => c.tono === t).length;
  const [cubiertos, parciales, no] = [cuenta("ok"), cuenta("warn"), cuenta("bad")];

  function generar() {
    if (!d || generando) return;
    setGenerando(1);
    setListo(false);
    let paso = 1;
    const t = setInterval(() => {
      paso += 1;
      setGenerando(paso);
      if (paso > 4) {
        clearInterval(t);
        setGenerando(0);
        setListo(true);
        setInformes((xs) => [{ titulo: d.pasos[0]?.valor ?? "Informe", detalle: `Generado ahora, ${cubiertos} de ${d.controles.length} controles, PDF y CSV` }, ...xs]);
      }
    }, 600);
  }

  const segmentos: [number, string, string][] = [
    [cubiertos, "bg-estado-permitida", "cubiertos"],
    [parciales, "bg-estado-aviso", "parcial"],
    [no, "bg-estado-bloqueada", "no cubiertos"],
  ];

  return (
    <>
      {cabecera}
      <div className="grid items-start gap-4 lg:grid-cols-[2fr_3fr]">
        <section className="tarjeta" aria-labelledby="cobertura">
          <h2 id="cobertura" className="meta">Cobertura del informe</h2>
          <p className="mt-1"><span className="num text-3xl">{cubiertos} de {d.controles.length}</span> <span className="meta">controles cubiertos</span></p>
          <div className="mt-4 flex h-3 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
            {segmentos.map(([n, color, texto]) => n > 0 && <span key={texto} className={color} style={{ flexGrow: n }} />)}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {segmentos.map(([n, color, texto]) => (
              <li key={texto} className="meta flex items-center gap-1.5"><span className={`muestra ${color}`} /><span className="num text-cardea-tinta">{n}</span> {texto}</li>
            ))}
          </ul>
          <p className="meta mt-4 border-t border-cardea-linea-suave pt-3">El informe incluye también lo que no cubre, para que nadie lo dé por supuesto.</p>
        </section>

        <section className="tarjeta" aria-labelledby="acredita">
          <div className="tarjeta-titulo"><h2 id="acredita">Qué puede acreditar el informe</h2></div>
          <ul className="lista">
            {d.controles.map((c) => (
              <li key={c.texto} className="flex items-center justify-between gap-3 py-2.5">
                <span>{c.texto}</span>
                <span className={`chip ${c.tono}`}>{c.estado}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[3fr_2fr]">
        <section className="tarjeta" aria-labelledby="generar">
          <div className="tarjeta-titulo"><h2 id="generar">Generar informe</h2></div>
          <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {d.pasos.map((p, i) => {
              const n = i + 1;
              const hecho = !!generando && n < generando;
              const actual = !!generando && n === generando;
              return (
                <li key={p.clave} className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`flex size-6 flex-none items-center justify-center rounded-full text-xs font-semibold transition-colors ${hecho || actual ? "bg-cardea-petroleo text-white" : "bg-cardea-niebla-2 text-cardea-texto"}`}>
                      {hecho ? <Icono n="check" size={12} sw={2.6} /> : n}
                    </span>
                    <span className="etiqueta">{p.clave}</span>
                  </div>
                  <p className="mt-1.5 font-medium">{p.valor}</p>
                </li>
              );
            })}
          </ol>
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-cardea-linea-suave pt-4">
            <button type="button" className="boton" onClick={generar} disabled={!!generando}>
              <Icono n="file" size={16} />{generando ? "Generando…" : "Generar informe"}
            </button>
            <span className="meta" role="status">{generando ? `Paso ${Math.min(generando, 4)} de 4: ${d.pasos[Math.min(generando, 4) - 1]?.clave.toLowerCase() ?? ""}` : listo ? "Informe generado: es el primero de Informes anteriores." : "PDF firmado y CSV, en unos segundos."}</span>
          </div>
        </section>

        <section className="tarjeta" aria-labelledby="anteriores">
          <div className="tarjeta-titulo"><h2 id="anteriores">Informes anteriores</h2></div>
          <ul className="lista">
            {informes.map((x, i) => (
              <li key={`${x.titulo}-${i}`} className="flex items-center gap-3 py-3">
                <span className="text-cardea-texto-suave"><Icono n="file" size={18} /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{x.titulo}</p>
                  <p className="meta">{x.detalle}</p>
                </div>
                <button type="button" aria-label={`Descargar ${x.titulo} (CSV)`} title="Descargar CSV" className="boton sec icono" onClick={() => descargar(x.titulo, d.controles)}>
                  <Icono n="down" size={16} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
