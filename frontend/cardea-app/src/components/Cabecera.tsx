import { Bell, Plus } from "lucide-react";

export function Cabecera({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div>
        <h1 className="text-[22px] leading-tight">{titulo}</h1>
        {subtitulo && <div className="mt-0.5 text-[12.5px] text-cardea-texto-suave">{subtitulo}</div>}
      </div>
      <div className="ml-auto hidden w-[240px] items-center gap-2 rounded-full bg-white px-4 py-2 text-[12.5px] text-cardea-texto-suave md:flex">
        Buscar o ejecutar
        <span className="ml-auto rounded-md bg-cardea-niebla px-1.5 py-0.5 text-[10px] text-cardea-texto">Ctrl K</span>
      </div>
      <button type="button" aria-label="Crear" className="grid size-9 place-items-center rounded-full bg-cardea-petroleo text-white">
        <Plus size={16} strokeWidth={2.2} />
      </button>
      <button type="button" aria-label="Avisos" className="grid size-9 place-items-center rounded-full bg-white text-cardea-tinta">
        <Bell size={15} />
      </button>
    </div>
  );
}
