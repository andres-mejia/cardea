import type { ReactNode } from "react";
import clsx from "clsx";

/** Tarjeta base: muy redondeada, sin borde (AGENTS.md §5). */
export function Tarjeta({ children, className, titulo, extra }: { children: ReactNode; className?: string; titulo?: string; extra?: ReactNode }) {
  return (
    <section className={clsx("min-w-0 rounded-tarjeta bg-white px-5 py-4", className)}>
      {titulo && (
        <h2 className="mb-3 flex items-center justify-between gap-2 text-[13px] font-semibold">
          {titulo}
          {extra && <span className="text-[11px] font-normal text-cardea-texto-suave">{extra}</span>}
        </h2>
      )}
      {children}
    </section>
  );
}

export function Pendiente({ que }: { que: string }) {
  return (
    <Tarjeta>
      <p className="text-[14px] text-cardea-texto">{que}</p>
      <p className="mt-2 inline-block rounded-md bg-[#FBEFD9] px-2 py-0.5 text-[11.5px] text-[#8A5306]">En construcción. Los datos de esta pantalla serán ilustrativos hasta conectar el control plane.</p>
    </Tarjeta>
  );
}
