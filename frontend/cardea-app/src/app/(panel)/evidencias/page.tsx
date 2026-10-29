"use client";

import { useEffect, useState } from "react";

import { Cabecera, Cargando } from "@/components/Cabecera";
import { BAD, Donut, Icono, type NombreIcono, TEAL, WARN } from "@/components/graficos";
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
    let paso = 1;
    const t = setInterval(() => {
      paso += 1;
      setGenerando(paso);
      if (paso > 4) {
        clearInterval(t);
        setGenerando(0);
        setInformes((xs) => [{ titulo: d.pasos[0]?.valor ?? "Informe", detalle: `Generado ahora, ${cubiertos} de ${d.controles.length} controles, PDF y CSV` }, ...xs]);
      }
    }, 600);
  }

  return (
    <>
      {cabecera}
      <div className="r2">
        <div className="c2" style={{ flex: 0.85, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h4 style={{ alignSelf: "stretch" }}>Cobertura</h4>
          <Donut segs={[[cubiertos, TEAL], [parciales, WARN], [no, BAD]]} size={118} thick={16}>
            <div className="num" style={{ fontSize: 20, lineHeight: 1 }}>{cubiertos} de {d.controles.length}</div>
            <div style={{ fontSize: 8.8, color: "#6B7C8C", marginTop: 3 }}>controles cubiertos</div>
          </Donut>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <span className="lg" style={{ padding: 0 }}><i style={{ background: TEAL }} />Cubierto</span>
            <span className="lg" style={{ padding: 0 }}><i style={{ background: WARN }} />Parcial</span>
            <span className="lg" style={{ padding: 0 }}><i style={{ background: BAD }} />No</span>
          </div>
        </div>
        <div className="c2" style={{ flex: 1.75 }}>
          <h4>Qué puede acreditar el informe</h4>
          {d.controles.map((c) => (
            <div key={c.texto} className="li" style={{ padding: "4px 0" }}>
              <div className={`ic ${c.clase}`} style={{ width: 21, height: 21, borderRadius: 7 }}><Icono n={c.icono as NombreIcono} size={11} sw={2.2} /></div>
              <div className="tx">{c.texto}</div>
              <span className={`chip ${c.tono}`}>{c.estado}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="r2" style={{ flex: 1 }}>
        <div className="c2" style={{ flex: 1.45, display: "flex", flexDirection: "column" }}>
          <h4>Generar informe</h4>
          <div style={{ display: "flex", marginTop: 4 }}>
            {d.pasos.map((p, i) => {
              const n = i + 1;
              const hecho = !generando || n < generando;
              return (
                <div key={p.clave} style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: hecho ? TEAL : "#C9D3DC", color: "#fff", fontSize: 9.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flex: "none", transition: "background .2s" }}>
                      {generando && n < generando ? <Icono n="check" size={11} sw={2.4} /> : n}
                    </div>
                    <div style={{ height: 2, flex: 1, background: n < 4 ? (hecho ? TEAL : "#C9D3DC") : "transparent", borderRadius: 1 }} />
                  </div>
                  <div style={{ fontSize: 9.3, color: "#6B7C8C", marginTop: 6 }}>{p.clave}</div>
                  <div style={{ fontSize: 10.4, fontWeight: 600, lineHeight: 1.3, paddingRight: 8 }}>{p.valor}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: "auto", paddingTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <button type="button" className="pillbtn" onClick={generar} disabled={!!generando}>
              <Icono n="file" size={11} />{generando ? "Generando…" : "Generar informe"}
            </button>
            <span style={{ fontSize: 9.5, color: "#6B7C8C" }}>Incluye lo no cubierto, para que nadie lo dé por supuesto.</span>
          </div>
        </div>
        <div className="c2" style={{ flex: 1 }}>
          <h4>Informes anteriores</h4>
          {informes.map((x, i) => (
            <div key={`${x.titulo}-${i}`} className="li">
              <div className="ic t"><Icono n="file" size={14} /></div>
              <div className="tx"><b>{x.titulo}</b><span>{x.detalle}</span></div>
              <button type="button" aria-label={`Descargar ${x.titulo}`} className="ib" style={{ width: 26, height: 26, background: "#EEF2F5" }} onClick={() => descargar(x.titulo, d.controles)}>
                <Icono n="down" size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
