"use client";

import { useState } from "react";

import { Cabecera, Cargando } from "@/components/Cabecera";
import { Anillo, Area, Avatar, eur, Icono, INK, Segmentos, TEAL } from "@/components/graficos";
import { usePantalla } from "@/lib/demo/use-pantalla";

const EQUIPOS = ["Todos", "Plataforma", "Datos", "Siniestros"] as const;
const COLORES = [INK, TEAL, "#8CCDD4"];

function claveDeEjemplo(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return `crd_dev_${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export default function Desarrolladores() {
  const d = usePantalla("desarrolladores");
  const [equipo, setEquipo] = useState<(typeof EQUIPOS)[number]>("Todos");
  const [clave, setClave] = useState<string | null>(null);
  const cabecera = <Cabecera titulo="Desarrolladores y claves" subtitulo="Una clave por persona, válida para todos sus CLIs" />;
  if (!d) return <>{cabecera}<Cargando /></>;

  const max = Math.max(...d.herramientas.map((h) => h.valor));
  const devs = d.devs.filter((x) => equipo === "Todos" || x.equipo === equipo);
  return (
    <>
      {cabecera}
      <div className="r2">
        <div className="c2" style={{ flex: 1.5 }}>
          <h4>Desarrolladores por herramienta</h4>
          {d.herramientas.map((h, i) => (
            <div key={h.nombre} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8, fontSize: 10.5 }}>
              <span style={{ width: 70 }}>{h.nombre}</span>
              <div style={{ flex: 1, height: 10, borderRadius: 5, background: "#EEF2F5" }}>
                <div style={{ width: `${(h.valor / max) * 100}%`, height: "100%", borderRadius: 5, background: COLORES[i] }} />
              </div>
              <b className="num" style={{ width: 20, textAlign: "right" }}>{h.valor}</b>
            </div>
          ))}
        </div>
        <div className="c2" style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
          <Anillo pct={(d.conClave / d.activos) * 100} size={64} thick={9} color={TEAL}>
            <div className="num" style={{ fontSize: 14 }}>{d.conClave}</div>
          </Anillo>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600 }}>Con clave propia</div>
            <div style={{ fontSize: 9.8, color: "#6B7C8C", marginTop: 2 }}>de {d.activos} usuarios activos</div>
          </div>
        </div>
        <div className="c2" style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
          <div className="ic w" style={{ width: 40, height: 40, borderRadius: 14 }}><Icono n="key" size={18} /></div>
          <div>
            <div className="num" style={{ fontSize: 20, lineHeight: 1 }}>{d.caducanSemana}</div>
            <div style={{ fontSize: 9.8, color: "#6B7C8C", marginTop: 3 }}>claves caducan esta semana.<br />Se renuevan con el SSO.</div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Segmentos opciones={EQUIPOS} valor={equipo} onChange={setEquipo} />
        <button type="button" className="pillbtn" style={{ marginLeft: "auto" }} onClick={() => setClave(claveDeEjemplo())}>
          <Icono n="key" size={11} />Emitir clave
        </button>
      </div>
      {clave && (
        <div className="c2" style={{ display: "flex", alignItems: "center", gap: 12, boxShadow: "inset 0 0 0 1.5px #0A6F7D" }}>
          <div className="ic t"><Icono n="key" size={14} /></div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600 }}>Clave emitida para ti, válida 90 días en Claude Code, Codex y Copilot CLI</div>
            <div className="mono" style={{ fontSize: 10.5, marginTop: 3, wordBreak: "break-all" }}>{clave}</div>
            <div style={{ fontSize: 9.5, color: "#6B7C8C", marginTop: 3 }}>Solo se muestra una vez. Clave de demostración: no da acceso a nada.</div>
          </div>
          <button type="button" className="pillbtn ghost" onClick={() => void navigator.clipboard?.writeText(clave)}>Copiar</button>
          <button type="button" className="chip line" onClick={() => setClave(null)}>Cerrar</button>
        </div>
      )}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gridAutoRows: "minmax(150px, 1fr)", gap: 12 }}>
        {devs.map((x) => (
          <div key={x.nombre} className="dev">
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Avatar i={x.avatar} size={34} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 600 }}>{x.nombre}</div>
                <div style={{ fontSize: 9.5, color: "#6B7C8C" }}>{x.equipo}</div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div className="num" style={{ fontSize: 14 }}>{eur(x.gasto)}</div>
                <div style={{ fontSize: 8.8, color: "#7A8A99" }}>este mes</div>
              </div>
            </div>
            <Area vals={x.serie} w={200} h={48} line={TEAL} fill="rgba(10,111,125,.10)" sw={1.6} pad={4} />
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {x.herramientas.map((t) => <span key={t} className="chip mute" style={{ padding: "1.5px 7px", fontSize: 9 }}>{t}</span>)}
              <span className={`chip ${x.tono}`} style={{ marginLeft: "auto" }}>{x.estado}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
