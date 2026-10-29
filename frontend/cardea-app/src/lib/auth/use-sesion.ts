"use client";

import { useEffect, useState } from "react";

import { usuarioActual, type Usuario } from "./sesion";

export type EstadoSesion = { estado: "cargando" } | { estado: "anonimo" } | { estado: "lista"; usuario: Usuario };

export function useSesion(): EstadoSesion {
  const [estado, setEstado] = useState<EstadoSesion>({ estado: "cargando" });
  useEffect(() => {
    let cancelado = false;
    usuarioActual().then((usuario) => {
      if (cancelado) return;
      setEstado(usuario ? { estado: "lista", usuario } : { estado: "anonimo" });
    });
    return () => {
      cancelado = true;
    };
  }, []);
  return estado;
}
