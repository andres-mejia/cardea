"use client";

import Link from "next/link";

import { Buscador } from "./Buscador";
import { Icono } from "./graficos";

/** Barra superior del pitch. La etiqueta avisa de que las cifras son ilustrativas (AGENTS.md §3). */
export function Cabecera({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <div className="tb">
      <div>
        <h3>{titulo}</h3>
        {subtitulo && <div className="sub">{subtitulo}</div>}
      </div>
      <span className="chip ilustrativo ml-3" title="Las cifras de esta pantalla son de demostración">
        Datos ilustrativos
      </span>
      <Buscador />
      <Link href="/politicas" aria-label="Crear regla" title="Crear regla" className="ib pri">
        <Icono n="plus" size={15} sw={2.2} />
      </Link>
      <Link href="/desarrolladores" aria-label="Claves" title="Claves" className="ib">
        <Icono n="key" size={14} />
      </Link>
      <Link href="/evidencias" aria-label="Informes" title="Informes" className="ib">
        <Icono n="down" size={14} />
      </Link>
      <Link href="/" aria-label="Avisos: 3 pendientes" title="Avisos" className="ib">
        <Icono n="bell" size={14} />
        <span className="dot">3</span>
      </Link>
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
