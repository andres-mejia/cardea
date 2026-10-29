"use client";

import { FotoUsuario } from "./FotoUsuario";
import { Icono } from "./graficos";
import { useUsuario } from "@/lib/auth/usuario-contexto";

/** Barra superior del pitch. La etiqueta avisa de que las cifras son ilustrativas (AGENTS.md §3). */
export function Cabecera({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  const usuario = useUsuario();
  return (
    <div className="tb">
      <div>
        <h3>{titulo}</h3>
        {subtitulo && <div className="sub">{subtitulo}</div>}
      </div>
      <span className="chip ilustrativo ml-3" title="Las cifras de esta pantalla son de demostración">
        Datos ilustrativos
      </span>
      <div className="srch">
        <Icono n="search" size={12} />
        Buscar o ejecutar
        <span className="kbd">Ctrl K</span>
      </div>
      <button type="button" aria-label="Crear" className="ib pri">
        <Icono n="plus" size={15} sw={2.2} />
      </button>
      <button type="button" aria-label="Claves" className="ib">
        <Icono n="key" size={14} />
      </button>
      <button type="button" aria-label="Descargas" className="ib">
        <Icono n="down" size={14} />
      </button>
      <button type="button" aria-label="Avisos" className="ib">
        <Icono n="bell" size={14} />
        <span className="dot">3</span>
      </button>
      <FotoUsuario foto={usuario?.foto} nombre={usuario?.nombre} size={31} />
    </div>
  );
}

export function Cargando() {
  return (
    <div className="flex flex-1 items-center justify-center text-[11px] text-cardea-texto-suave" role="status">
      Cargando…
    </div>
  );
}
