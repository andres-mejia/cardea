"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Cabecera, Cargando } from "@/components/Cabecera";
import { Icono, miles, type NombreIcono, Segmentos } from "@/components/graficos";
import type { DatosDe } from "@/lib/demo/datos";
import { redactar } from "@/lib/demo/redaccion";
import { usePantalla } from "@/lib/demo/use-pantalla";

const FILTROS = ["Todas", "Datos", "Modelos", "Tools", "Gasto"] as const;
type Filtro = (typeof FILTROS)[number];
type Regla = DatosDe<"politicas">["reglas"][number];

const EJEMPLO = "Resume la reclamación de Lucía Romero Gil con DNI 12345678Z y cuenta ES91 2100 0418 4502 0005 1332.";

/** En pantallas estrechas el detalle queda debajo: al elegir, se lleva la vista hasta él. */
function irAlDetalle(el: HTMLElement | null) {
  if (el && window.matchMedia("(max-width: 1023px)").matches) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Flujo({ regla, detecta }: { regla: Regla; detecta: string[] }) {
  const si: Record<string, React.ReactNode> = {
    Datos: (
      <span className="mt-1.5 flex flex-wrap gap-1.5">
        {detecta.map((x) => <span key={x} className="chip mute">{x}</span>)}
      </span>
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
  const pasos: [string, NombreIcono, React.ReactNode, boolean?][] = [
    ["Cuando llega", "send", regla.ambitos[0] === "Todos los equipos" ? "Una petición de cualquier aplicación o CLI" : `Una petición de ${regla.ambitos.join(", ")}`],
    ["Si contiene", "search", si[regla.categoria]],
    ["Entonces", regla.icono as NombreIcono, entonces[regla.accion] ?? regla.accion, true],
    ["Y registra", "file", "Un evento de auditoría, sin guardar el texto original"],
  ];
  return (
    <ol className="space-y-2">
      {pasos.map(([titulo, icono, cuerpo, clave]) => (
        <li key={titulo} className="bloque flex items-start gap-3">
          <span className={`mt-0.5 flex size-8 flex-none items-center justify-center rounded-full ${clave ? "bg-cardea-tinta text-white" : "bg-white text-cardea-texto-suave"}`}>
            <Icono n={icono} size={16} />
          </span>
          <div className="min-w-0">
            <p className="etiqueta">{titulo}</p>
            <div className={clave ? "font-medium" : ""}>{cuerpo}</div>
          </div>
        </li>
      ))}
    </ol>
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
  const detalle = useRef<HTMLElement>(null);
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

  function elegir(id: string) {
    setSel(id);
    setGuardado(false);
    irAlDetalle(detalle.current);
  }

  function crear() {
    const id = `nueva-${reglas.length + 1}`;
    const nueva: Regla = { id, icono: "shield", clase: "m", nombre: "Regla nueva", categoria: "Datos", ambitos: ["Todos los equipos"], accion: "Redactar", aciertos: 0, activa: false, estado: "Borrador", tono: "mute" };
    setReglas((rs) => [nueva, ...rs]);
    setFiltro("Todas");
    elegir(id);
  }

  return (
    <>
      {cabecera}
      <div className="barra-herr">
        <Segmentos etiqueta="Filtrar reglas" opciones={FILTROS} valor={filtro} onChange={setFiltro} />
        <button type="button" className="boton sm:ml-auto" onClick={crear}><Icono n="plus" size={16} sw={2.2} />Crear regla</button>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[5fr_4fr]">
        <section className="tarjeta" aria-labelledby="reglas">
          <div className="tarjeta-titulo">
            <h2 id="reglas">Reglas</h2>
            <span className="meta">{reglas.length} reglas, {activas} activas</span>
          </div>
          <ul className="-mx-3 space-y-1">
            {visibles.map((r) => {
              const elegida = r.id === regla.id;
              const estado = r.activa ? r.estado : r.estado === "Borrador" ? "Borrador" : "Pausada";
              return (
                <li key={r.id} data-elegida={elegida} onClick={() => elegir(r.id)} className="seleccionable grid grid-cols-[1fr_auto_auto] items-center gap-x-4 gap-y-2 px-3 py-3 sm:grid-cols-[1fr_auto_auto_auto]">
                  <button type="button" aria-pressed={elegida} className="col-span-3 min-w-0 rounded-control text-left sm:col-span-1" onClick={(e) => { e.stopPropagation(); elegir(r.id); }}>
                    <span className="block font-medium">{r.nombre}</span>
                    <span className="meta block">{r.ambitos.join(" · ")} · <span className="text-cardea-texto">{r.accion}</span></span>
                  </button>
                  <p className="meta text-left sm:text-right"><span className="num text-cardea-tinta">{miles(r.aciertos)}</span> este mes</p>
                  <span className={`chip justify-self-end ${r.activa ? r.tono : "mute"}`}>{estado}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={r.activa}
                    aria-label={`Regla activa: ${r.nombre}`}
                    className="interruptor ml-1 justify-self-end"
                    onClick={(e) => {
                      e.stopPropagation();
                      alternar(r.id);
                    }}
                  />
                </li>
              );
            })}
          </ul>
        </section>

        <section ref={detalle} className="tarjeta flex scroll-mt-20 flex-col gap-4" aria-labelledby="actua">
          <div>
            <h2 id="actua" className="text-lg font-semibold">Cómo actúa la regla</h2>
            <p className="meta">{regla.nombre}</p>
          </div>
          <Flujo regla={regla} detecta={d.detecta} />
          {regla.categoria === "Datos" && (
            <div className="rounded-bloque border border-cardea-linea-suave p-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="etiqueta" aria-live="polite">
                  Prueba con un ejemplo{prueba.cuenta > 0 ? `: ${prueba.cuenta} datos sustituidos` : ": ningún dato detectado"}
                </p>
                <button type="button" className="boton sec peq" aria-expanded={editando} onClick={() => setEditando((v) => !v)}>
                  {editando ? "Ocultar texto" : "Probar otro texto"}
                </button>
              </div>
              {editando && (
                <label className="mt-3 block">
                  <span className="sr-only">Texto de prueba</span>
                  <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={3} className="w-full resize-y rounded-control border border-cardea-linea bg-white p-2.5 outline-none focus:border-cardea-petroleo" />
                </label>
              )}
              <p className="mt-2 leading-6">
                {prueba.trozos.map((t, i) => (t.marcador ? <span key={i} className="redact">{t.marcador}</span> : <span key={i}>{t.texto}</span>))}
              </p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="boton" onClick={() => setGuardado(true)}>Guardar cambios</button>
            <span role="status" className="meta flex items-center gap-1.5">
              {guardado && <><Icono n="check" size={14} />Guardado. En la demo no sale del navegador.</>}
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
