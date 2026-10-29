"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { FotoUsuario } from "./FotoUsuario";
import { Icono, type NombreIcono } from "./graficos";
import { Isotipo } from "./Isotipo";
import type { Usuario } from "@/lib/auth/sesion";
import { salir } from "@/lib/auth/sesion";
import { NAVEGACION } from "@/lib/navegacion";

const ROL: Record<Usuario["rol"], string> = { owner: "Administración", member: "Miembro" };

/** Barra lateral en escritorio; en pantallas estrechas, barra superior con menú plegable. */
export function BarraLateral({ usuario }: { usuario: Usuario }) {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);

  return (
    <aside className="nav" data-abierto={abierto}>
      <div className="nav-cabeza">
        <div className="nav-marca">
          <Isotipo size={22} dark />
          Cardea
        </div>
        <button type="button" className="nav-boton" aria-expanded={abierto} aria-controls="nav-cuerpo" onClick={() => setAbierto((v) => !v)}>
          <Icono n={abierto ? "close" : "menu"} size={20} />
          {abierto ? "Cerrar" : "Menú"}
        </button>
      </div>
      <div id="nav-cuerpo" className="nav-cuerpo">
        <nav aria-label="Principal">
          {NAVEGACION.map((g) => (
            <div key={g.titulo}>
              <div className="nav-grupo">{g.titulo}</div>
              {g.secciones.map((s) => (
                <Link key={s.href} href={s.href} className="nav-enlace" aria-current={ruta === s.href ? "page" : undefined} onClick={() => setAbierto(false)}>
                  <Icono n={s.icono as NombreIcono} size={16} />
                  {s.nombre}
                  {s.alerta && (
                    <span className="nav-alerta" title={s.alerta.texto}>
                      {s.alerta.n}
                      <span className="sr-only">, {s.alerta.texto}</span>
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="nav-yo">
          <FotoUsuario foto={usuario.foto} nombre={usuario.nombre} size={32} />
          <div className="min-w-0">
            <b className="truncate" title={usuario.email}>{usuario.nombre}</b>
            <span>{ROL[usuario.rol]}</span>
          </div>
          <button type="button" onClick={() => void salir()} aria-label="Salir" title="Salir" className="nav-salir">
            <Icono n="logout" size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
