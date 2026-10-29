"use client";

import { createContext, useContext } from "react";

import type { Usuario } from "./sesion";

export const UsuarioContexto = createContext<Usuario | null>(null);

export function useUsuario(): Usuario | null {
  return useContext(UsuarioContexto);
}
