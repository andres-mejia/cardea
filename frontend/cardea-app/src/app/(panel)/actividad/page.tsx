"use client";

import { useMemo, useState } from "react";

import { Cabecera, Cargando } from "@/components/Cabecera";
import { Avatar, BAD, Icono, miles, Segmentos, TEAL } from "@/components/graficos";
import type { DatosDe } from "@/lib/demo/datos";
import { usePantalla } from "@/lib/demo/use-pantalla";

const FILTROS = ["Todas", "Con incidencia"] as const;
type Peticion = DatosDe<"actividad">["feed"][number];

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
  const [w, h] = [700, 74];
  const ancho = w / 60;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ display: "block" }} role="img" aria-label="Peticiones por minuto">
      {barras.map((b, i) => {
        let y = h;
        return (
          <g key={i}>
            {b.map((v, j) => {
              if (!v) return null;
              y -= v;
              return <rect key={j} x={i * ancho + 1.5} y={y} width={ancho - 3} height={v - 1} rx={2.2} fill={["#BFD3DD", TEAL, BAD][j]} />;
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
    <div className="c2" style={{ flex: 1 }}>
      <h4>{p.quien}<span className="mono" style={{ fontSize: 9 }}>{p.id}</span></h4>
      <div className="tl">
        {pasos.map(([t, s]) => <div key={t}>{t}{s && <span>{s}</span>}</div>)}
      </div>
      {p.decision === "Redactada" ? (
        <div className="quote" style={{ marginTop: 11 }}>
          <div style={{ fontSize: 9.3, color: "#5F7183", marginBottom: 3 }}>Texto enviado al proveedor</div>
          Resume la reclamación de <span className="redact">NOMBRE</span> con DNI <span className="redact">DNI</span> y cuenta <span className="redact">IBAN</span> sobre el siniestro de hogar del 3 de septiembre.
        </div>
      ) : (
        <div className="quote" style={{ marginTop: 11 }}>
          <div style={{ fontSize: 9.3, color: "#5F7183", marginBottom: 3 }}>Metadatos registrados</div>
          {p.herramienta} · {p.destino} · decisión {p.decision.toLowerCase()}
        </div>
      )}
      <div style={{ fontSize: 9.6, color: "#5F7183", marginTop: 8 }}>El texto original no se almacena.</div>
    </div>
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
  return (
    <>
      {cabecera}
      <div className="c2">
        <h4>
          Peticiones por minuto, última hora
          <span style={{ display: "flex", gap: 6 }}>
            <span className="chip mute">{miles(d.resumen.permitidas)} permitidas</span>
            <span className="chip info">{d.resumen.redactadas} redactadas</span>
            <span className="chip bad">{d.resumen.bloqueadas} bloqueadas</span>
            <span className="chip line">{d.resumen.tools} tool calls</span>
          </span>
        </h4>
        <Histograma />
      </div>
      <div className="r2" style={{ flex: 1 }}>
        <div className="c2" style={{ flex: 1.45 }}>
          <h4>
            En directo
            <span><Segmentos opciones={FILTROS} valor={filtro} onChange={setFiltro} /></span>
          </h4>
          {feed.map((p) => {
            const activa = p.id === elegida.id;
            return (
              <div
                key={p.id}
                onClick={() => setSel(p.id)}
                className="fila"
                style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 10.6, padding: "7px 8px", margin: "0 -8px", borderRadius: 12, background: activa ? "#F1F8F9" : undefined }}
              >
                {p.app ? (
                  <div className="ic k" style={{ width: 26, height: 26, borderRadius: 9 }}><Icono n="box" size={13} /></div>
                ) : (
                  <Avatar i={p.avatar} size={26} />
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <b style={{ fontWeight: 600 }}>{p.quien}</b>
                  <div style={{ fontSize: 9.3, color: "#5F7183" }}>{p.herramienta}, {p.destino}</div>
                </div>
                <span className="num" style={{ fontSize: 10.3 }}>{p.coste}</span>
                <span className={`chip ${p.tono}`}>{p.decision}</span>
                <span style={{ fontSize: 9.3, color: "#5F7183", fontVariantNumeric: "tabular-nums" }}>{p.hora}</span>
              </div>
            );
          })}
        </div>
        <Detalle p={elegida} />
      </div>
    </>
  );
}
