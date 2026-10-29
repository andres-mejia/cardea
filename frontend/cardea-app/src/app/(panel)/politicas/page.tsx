import { Cabecera } from "@/components/Cabecera";
import { Pendiente } from "@/components/Tarjeta";

export default function Politicas() {
  return (
    <>
      <Cabecera titulo="Políticas" subtitulo="Lo que se comprueba antes de que una petición salga o una tool se ejecute" />
      <Pendiente que="Pantalla «Políticas» del pitch (docs/pitch/cardea-pitch.pdf)." />
    </>
  );
}
