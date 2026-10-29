"use client";

import { useEffect, useMemo, useState } from "react";

import { Cabecera, Cargando } from "@/components/Cabecera";
import { Icono, miles, type NombreIcono, Segmentos } from "@/components/graficos";
import type { DatosDe } from "@/lib/demo/datos";
import { redactar } from "@/lib/demo/redaccion";
import { usePantalla } from "@/lib/demo/use-pantalla";

const FILTROS = ["Todas", "Datos", "Modelos", "Tools", "Gasto"] as const;
type Filtro = (typeof FILTROS)[number];
type Regla = DatosDe<"politicas">["reglas"][number];

const EJEMPLO = "Resume la reclamación de Lucía Romero Gil con DNI 12345678Z y cuenta ES91 2100 0418 4502 0005 1332.";

function Flujo({ regla, detecta }: { regla: Regla; detecta: string[] }) {
  const si: Record<string, React.ReactNode> = {
    Datos: (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 3 }}>
        {detecta.map((x) => <span key={x} className="chip line" style={{ padding: "2px 8px", fontSize: 9.3 }}>{x}</span>)}
      </div>
    ),
    Modelos: <>El modelo pedido no está en la lista de {regla.ambitos[0]}</>,
    Tools: <>La tool MCP no está permitida para el equipo de quien la llama</>,
    Gasto: <>El equipo ya ha consumido el 100 % de su presupuesto del mes</>,
  };
  const entonces: Record<string, string> = {
    Redactar: "Sustituir cada dato por un marcador y continuar",
    "Lista permitida": "Rechazar la petición con un mensaje claro",
    "Bloquear al 100 %": "Bloquear hasta que alguien amplíe el presupuesto",
    Avisar: "Dejar pasar y avisar a quien la envía",
    Bloquear: "Rechazar la petición",
  };
  return (
    <>
      <div className="node"><div className="ic t"><Icono n="send" size={13} /></div><div><small>Cuando llega</small>{regla.ambitos[0] === "Todos los equipos" ? "Una petición de cualquier aplicación o CLI" : `Una petición de ${regla.ambitos.join(", ")}`}</div></div>
      <div className="enlace" />
      <div className="node"><div className="ic t"><Icono n="search" size={13} /></div><div><small>Si contiene</small>{si[regla.categoria]}</div></div>
      <div className="enlace" />
      <div className="node"><div className="ic k"><Icono n={regla.icono as NombreIcono} size={13} /></div><div><small>Entonces</small>{entonces[regla.accion] ?? regla.accion}</div></div>
      <div className="enlace" />
      <div className="node"><div className="ic m"><Icono n="file" size={13} /></div><div><small>Y registrar</small>Un evento de auditoría, sin guardar el original</div></div>
    </>
  );
}

export default function Politicas() {
  const d = usePantalla("politicas");
  const [filtro, setFiltro] = useState<Filtro>("Todas");
  const [reglas, setReglas] = useState<Regla[]>([]);
  const [sel, setSel] = useState("datos-clientes");
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(EJEMPLO);
  const [guardado, setGuardado] = useState(false);
  useEffect(() => {
    if (d) setReglas(d.reglas);
  }, [d]);
  const prueba = useMemo(() => redactar(texto), [texto]);
  const cabecera = <Cabecera titulo="Políticas" subtitulo="Lo que se comprueba antes de que una petición salga" />;
  if (!d || reglas.length === 0) return <>{cabecera}<Cargando /></>;

  const visibles = reglas.filter((r) => filtro === "Todas" || r.categoria === filtro);
  const regla = reglas.find((r) => r.id === sel) ?? reglas[0]!;
  const activas = reglas.filter((r) => r.activa).length;

  function alternar(id: string) {
    setGuardado(false);
    setReglas((rs) => rs.map((r) => (r.id === id ? { ...r, activa: !r.activa, estado: !r.activa ? (r.estado === "Borrador" ? "En pruebas" : r.estado) : r.estado } : r)));
  }

  return (
    <>
      {cabecera}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Segmentos opciones={FILTROS} valor={filtro} onChange={setFiltro} />
        <button type="button" className="pillbtn" style={{ marginLeft: "auto" }}><Icono n="plus" size={11} sw={2.2} />Crear regla</button>
      </div>
      <div className="r2" style={{ flex: 1 }}>
        <div className="c2" style={{ flex: 1.25 }}>
          <h4>Reglas<span>{reglas.length} reglas, {activas} activas</span></h4>
          {visibles.map((r) => {
            const elegida = r.id === regla.id;
            return (
              <div
                key={r.id}
                onClick={() => setSel(r.id)}
                className="fila"
                style={{ background: elegida ? "#F1F8F9" : "#F4F7F9", boxShadow: elegida ? "inset 0 0 0 1.5px #0A6F7D" : undefined, borderRadius: 14, padding: "9px 12px", display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}
              >
                <div className={`ic ${r.clase}`}><Icono n={r.icono as NombreIcono} size={14} /></div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 11.2, fontWeight: 600 }}>{r.nombre}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 4, alignItems: "center", flexWrap: "wrap" }}>
                    {r.ambitos.map((a) => <span key={a} className="chip mute" style={{ padding: "1.5px 7px", fontSize: 9 }}>{a}</span>)}
                    <span className="chip line" style={{ padding: "1.5px 7px", fontSize: 9 }}>{r.accion}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right", flex: "none" }}>
                  <div className="num" style={{ fontSize: 12.5 }}>{miles(r.aciertos)}</div>
                  <div style={{ fontSize: 8.6, color: "#5F7183" }}>este mes</div>
                </div>
                <span className={`chip ${r.activa ? r.tono : "mute"}`}>{r.activa ? r.estado : r.estado === "Borrador" ? "Borrador" : "Pausada"}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={r.activa}
                  aria-label={`Activar ${r.nombre}`}
                  className={`tog ${r.activa ? "on" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    alternar(r.id);
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="c2" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <h4>Cómo actúa la regla<span>{regla.nombre}</span></h4>
          <Flujo regla={regla} detecta={d.detecta} />
          {regla.categoria === "Datos" && (
            <div className="quote" style={{ marginTop: 10 }}>
              <div style={{ fontSize: 9.3, color: "#5F7183", marginBottom: 3 }}>
                Prueba con un ejemplo{prueba.cuenta > 0 ? `: ${prueba.cuenta} datos sustituidos` : ""}
              </div>
              {editando ? (
                <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={3} className="w-full resize-none rounded-lg bg-white p-2 outline-none ring-1 ring-cardea-linea focus:ring-cardea-petroleo" />
              ) : null}
              <div style={{ marginTop: editando ? 6 : 0 }}>
                {prueba.trozos.map((t, i) => (t.marcador ? <span key={i} className="redact">{t.marcador}</span> : <span key={i}>{t.texto}</span>))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 7, marginTop: "auto", paddingTop: 10, alignItems: "center" }}>
            <button type="button" className="pillbtn" onClick={() => setGuardado(true)}>Guardar cambios</button>
            {regla.categoria === "Datos" && (
              <button type="button" className="pillbtn ghost" onClick={() => setEditando((v) => !v)}>{editando ? "Ver resultado" : "Probar otro texto"}</button>
            )}
            {guardado && <span className="chip ok">Guardado (demo)</span>}
          </div>
        </div>
      </div>
    </>
  );
}
