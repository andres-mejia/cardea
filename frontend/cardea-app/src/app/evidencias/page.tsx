import { Cabecera } from "@/components/Cabecera";
import { Pendiente } from "@/components/Tarjeta";

export default function Evidencias() {
  return (
    <>
      <Cabecera titulo="Evidencias" subtitulo="Lo que se puede demostrar ante una auditoría, y lo que no" />
      <Pendiente que="Pantalla «Evidencias» del pitch (docs/pitch/cardea-pitch.pdf)." />
    </>
  );
}
