"use client";

import { Buscador } from "./Buscador";

/** Título de la pantalla. La etiqueta avisa de que las cifras son ilustrativas (AGENTS.md §3). */
export function Cabecera({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <header className="cabecera">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1>{titulo}</h1>
          <span className="ilustrativo" title="Las cifras de esta pantalla son de demostración">
            Datos ilustrativos
          </span>
        </div>
        {subtitulo && <p>{subtitulo}</p>}
      </div>
      <Buscador />
    </header>
  );
}

/** Esqueleto mientras llegan los datos: mismo ritmo que la pantalla, sin spinner. */
export function Cargando() {
  return (
    <div className="grid gap-4 lg:grid-cols-[3fr_2fr]" role="status" aria-label="Cargando datos">
      <div className="tarjeta h-64 animate-pulse bg-white/70" />
      <div className="tarjeta h-64 animate-pulse bg-white/70" />
    </div>
  );
}
