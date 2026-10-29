import { Cabecera } from "@/components/Cabecera";
import { Pendiente } from "@/components/Tarjeta";

export default function Actividad() {
  return (
    <>
      <Cabecera titulo="Actividad y auditoría" subtitulo="Cada petición y cada tool call, con su decisión y su recorrido" />
      <Pendiente que="Pantalla «Actividad y auditoría» del pitch (docs/pitch/cardea-pitch.pdf)." />
    </>
  );
}
