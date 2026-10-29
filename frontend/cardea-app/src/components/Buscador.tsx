"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { Icono, type NombreIcono } from "./graficos";
import { NAVEGACION } from "@/lib/navegacion";

type Entrada = { texto: string; detalle: string; href: string; icono: NombreIcono };

const ACCIONES: Entrada[] = [
  { texto: "Crear regla", detalle: "Políticas", href: "/politicas", icono: "plus" },
  { texto: "Probar la redacción de datos", detalle: "Políticas", href: "/politicas", icono: "eye" },
  { texto: "Emitir clave", detalle: "Desarrolladores", href: "/desarrolladores", icono: "key" },
  { texto: "Exportar chargeback", detalle: "Costes", href: "/costes", icono: "down" },
  { texto: "Generar informe de evidencias", detalle: "Evidencias", href: "/evidencias", icono: "file" },
  { texto: "Reconectar facturación cloud", detalle: "Conexiones", href: "/conexiones", icono: "plug" },
  { texto: "Ver peticiones bloqueadas", detalle: "Actividad", href: "/actividad", icono: "block" },
];

const ENTRADAS: Entrada[] = [
  ...NAVEGACION.flatMap((g) => g.secciones.map((s) => ({ texto: s.nombre, detalle: `Ir a · ${g.titulo}`, href: s.href, icono: s.icono as NombreIcono }))),
  ...ACCIONES,
];

const sinAcentos = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** «Buscar o ejecutar»: salta a una pantalla o acción. Se abre con Ctrl K o Cmd K. */
export function Buscador() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const entrada = useRef<HTMLInputElement>(null);

  const resultados = useMemo(() => ENTRADAS.filter((e) => sinAcentos(`${e.texto} ${e.detalle}`).includes(sinAcentos(q))), [q]);

  useEffect(() => {
    const teclas = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAbierto((v) => !v);
      }
    };
    window.addEventListener("keydown", teclas);
    return () => window.removeEventListener("keydown", teclas);
  }, []);

  useEffect(() => {
    if (abierto) {
      setQ("");
      setI(0);
      setTimeout(() => entrada.current?.focus(), 0);
    }
  }, [abierto]);

  function ir(e: Entrada | undefined) {
    if (!e) return;
    setAbierto(false);
    router.push(e.href);
  }

  return (
    <>
      <button type="button" className="srch" onClick={() => setAbierto(true)} aria-haspopup="dialog">
        <Icono n="search" size={12} />
        Buscar o ejecutar
        <span className="kbd">Ctrl K</span>
      </button>
      {abierto && (
        <div className="paleta-fondo" onClick={() => setAbierto(false)}>
          <div role="dialog" aria-modal="true" aria-label="Buscar o ejecutar" className="paleta" onClick={(e) => e.stopPropagation()}>
            <div className="paleta-campo">
              <Icono n="search" size={14} />
              <input
                ref={entrada}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setI(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setAbierto(false);
                  else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setI((x) => Math.min(x + 1, resultados.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setI((x) => Math.max(x - 1, 0));
                  } else if (e.key === "Enter") ir(resultados[i]);
                }}
                placeholder="Pantalla o acción…"
                aria-label="Buscar pantalla o acción"
                aria-controls="paleta-lista"
                aria-activedescendant={resultados[i] ? `paleta-${i}` : undefined}
              />
              <span className="kbd">Esc</span>
            </div>
            <ul id="paleta-lista" role="listbox" className="paleta-lista">
              {resultados.map((e, n) => (
                <li key={`${e.texto}-${e.href}`} id={`paleta-${n}`} role="option" aria-selected={n === i} className={n === i ? "on" : ""} onMouseEnter={() => setI(n)} onClick={() => ir(e)}>
                  <span className="ic t" style={{ width: 26, height: 26, borderRadius: 8 }}><Icono n={e.icono} size={13} /></span>
                  <span className="min-w-0 flex-1">{e.texto}</span>
                  <span className="paleta-detalle">{e.detalle}</span>
                </li>
              ))}
              {resultados.length === 0 && <li className="paleta-vacio">Nada con «{q}».</li>}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
