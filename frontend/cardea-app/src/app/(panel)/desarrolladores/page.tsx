import { Cabecera } from "@/components/Cabecera";
import { Pendiente } from "@/components/Tarjeta";

export default function Desarrolladores() {
  return (
    <>
      <Cabecera titulo="Desarrolladores y claves" subtitulo="Una clave por persona, válida para todos sus CLIs" />
      <Pendiente que="Pantalla «Desarrolladores y claves» del pitch (docs/pitch/cardea-pitch.pdf)." />
    </>
  );
}
