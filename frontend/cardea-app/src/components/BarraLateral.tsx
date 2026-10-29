"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LogOut } from "lucide-react";
import { Isotipo } from "./Isotipo";
import type { Usuario } from "@/lib/auth/sesion";
import { salir } from "@/lib/auth/sesion";
import { NAVEGACION } from "@/lib/navegacion";

const ROL: Record<Usuario["rol"], string> = { owner: "Administración", member: "Miembro" };

export function BarraLateral({ usuario }: { usuario: Usuario }) {
  const ruta = usePathname();
  return (
    <aside className="m-3 mr-0 flex w-[196px] shrink-0 flex-col rounded-[18px] bg-cardea-tinta p-3 text-[13px] text-[#AFC0CF]">
      <div className="flex items-center gap-2 px-2 pb-2 pt-1 text-[17px] font-semibold tracking-[-0.02em] text-white">
        <Isotipo size={22} dark />
        Cardea
      </div>
      {NAVEGACION.map((g) => (
        <div key={g.titulo}>
          <div className="px-2 pb-1.5 pt-4 text-[11px] text-[#7C93A6]">{g.titulo}</div>
          {g.secciones.map((s) => {
            const activa = ruta === s.href;
            return (
              <Link
                key={s.href}
                href={s.href}
                className={clsx(
                  "mb-0.5 flex items-center gap-2.5 rounded-[10px] px-2 py-2",
                  activa ? "bg-cardea-tinta-3 text-white" : "hover:bg-cardea-tinta-2 hover:text-white",
                )}
              >
                <s.icono size={15} strokeWidth={1.8} />
                {s.nombre}
              </Link>
            );
          })}
        </div>
      ))}
      <div className="mt-auto flex items-center gap-2 rounded-[13px] bg-cardea-tinta-2 p-2">
        <div className="size-8 rounded-full bg-[#CFE4E8]" aria-hidden="true" />
        <div className="min-w-0">
          <div className="truncate text-[12px] font-semibold text-white" title={usuario.email}>{usuario.nombre}</div>
          <div className="text-[11px] text-[#8EA3B5]">{ROL[usuario.rol]}</div>
        </div>
        <button type="button" onClick={() => void salir()} aria-label="Salir" title="Salir" className="ml-auto grid size-7 shrink-0 place-items-center rounded-full hover:bg-cardea-tinta-3 hover:text-white">
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}
