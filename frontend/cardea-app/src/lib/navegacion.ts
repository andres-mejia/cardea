import type { LucideIcon } from "lucide-react";
import { Activity, BarChart3, FileCheck2, LayoutGrid, Plug, Shield, Users } from "lucide-react";

export type Seccion = { nombre: string; href: string; icono: LucideIcon };
export type Grupo = { titulo: string; secciones: Seccion[] };

/** Misma navegación que el pitch: Visión, Control, Cumplimiento. */
export const NAVEGACION: Grupo[] = [
  {
    titulo: "Visión",
    secciones: [
      { nombre: "Panel general", href: "/", icono: LayoutGrid },
      { nombre: "Costes", href: "/costes", icono: BarChart3 },
      { nombre: "Actividad", href: "/actividad", icono: Activity },
    ],
  },
  {
    titulo: "Control",
    secciones: [
      { nombre: "Políticas", href: "/politicas", icono: Shield },
      { nombre: "Desarrolladores", href: "/desarrolladores", icono: Users },
    ],
  },
  {
    titulo: "Cumplimiento",
    secciones: [
      { nombre: "Evidencias", href: "/evidencias", icono: FileCheck2 },
      { nombre: "Conexiones", href: "/conexiones", icono: Plug },
    ],
  },
];
