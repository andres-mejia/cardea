"use client";

import { useEffect, useState } from "react";

import type { DatosDe, Pantalla } from "./datos";

/** Pide los datos de una pantalla a la API de demostración. */
export function usePantalla<P extends Pantalla>(pantalla: P): DatosDe<P> | null {
  const [datos, setDatos] = useState<DatosDe<P> | null>(null);
  useEffect(() => {
    let cancelado = false;
    fetch(`/api/demo/${pantalla}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { datos: DatosDe<P> }) => {
        if (!cancelado) setDatos(j.datos);
      })
      .catch(() => undefined);
    return () => {
      cancelado = true;
    };
  }, [pantalla]);
  return datos;
}
