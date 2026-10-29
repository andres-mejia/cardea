"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { FotoUsuario } from "./FotoUsuario";
import { Icono, type NombreIcono } from "./graficos";
import { Isotipo } from "./Isotipo";
import type { Usuario } from "@/lib/auth/sesion";
import { salir } from "@/lib/auth/sesion";
import { NAVEGACION } from "@/lib/navegacion";

const ROL: Record<Usuario["rol"], string> = { owner: "Administración", member: "Miembro" };

export function BarraLateral({ usuario }: { usuario: Usuario }) {
  const ruta = usePathname();
  return (
    <aside className="sb">
      <div className="brand">
        <Isotipo size={20} dark />
        Cardea
      </div>
      {NAVEGACION.map((g) => (
        <div key={g.titulo}>
          <div className="grp">{g.titulo}</div>
          {g.secciones.map((s) => (
            <Link key={s.href} href={s.href} className={ruta === s.href ? "on" : ""}>
              <Icono n={s.icono as NombreIcono} size={14} />
              {s.nombre}
              {s.contador && <span className="cnt">{s.contador}</span>}
            </Link>
          ))}
        </div>
      ))}
      <div className="me">
        <FotoUsuario foto={usuario.foto} nombre={usuario.nombre} size={30} />
        <div className="min-w-0">
          <b title={usuario.email}>{usuario.nombre}</b>
          <span>{ROL[usuario.rol]}</span>
        </div>
        <button type="button" onClick={() => void salir()} aria-label="Salir" title="Salir" className="ml-auto rounded-full p-1 text-[#8EA3B5] hover:bg-cardea-tinta-3 hover:text-white">
          <Icono n="logout" size={13} />
        </button>
      </div>
    </aside>
  );
}
