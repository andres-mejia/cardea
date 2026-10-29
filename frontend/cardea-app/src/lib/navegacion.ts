/** Misma navegación que el pitch: Visión, Control, Cumplimiento. */
export type Seccion = { nombre: string; href: string; icono: string; contador?: string };
export type Grupo = { titulo: string; secciones: Seccion[] };

export const NAVEGACION: Grupo[] = [
  {
    titulo: "Visión",
    secciones: [
      { nombre: "Panel general", href: "/", icono: "grid" },
      { nombre: "Costes", href: "/costes", icono: "bars" },
      { nombre: "Actividad", href: "/actividad", icono: "pulse", contador: "342" },
    ],
  },
  {
    titulo: "Control",
    secciones: [
      { nombre: "Políticas", href: "/politicas", icono: "shield" },
      { nombre: "Desarrolladores", href: "/desarrolladores", icono: "users" },
    ],
  },
  {
    titulo: "Cumplimiento",
    secciones: [
      { nombre: "Evidencias", href: "/evidencias", icono: "file" },
      { nombre: "Conexiones", href: "/conexiones", icono: "plug", contador: "1" },
    ],
  },
];
