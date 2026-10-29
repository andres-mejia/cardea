import { Cabecera } from "@/components/Cabecera";
import { Pendiente } from "@/components/Tarjeta";

export default function Conexiones() {
  return (
    <>
      <Cabecera titulo="Conexiones" subtitulo="De dónde sale cada dato y si está llegando" />
      <Pendiente que="Pantalla «Conexiones» del pitch (docs/pitch/cardea-pitch.pdf)." />
    </>
  );
}
