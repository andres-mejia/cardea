import { Cabecera } from "@/components/Cabecera";
import { Pendiente } from "@/components/Tarjeta";

export default function Costes() {
  return (
    <>
      <Cabecera titulo="Costes y chargeback" subtitulo="Reparto por equipo y centro de coste" />
      <Pendiente que="Pantalla «Costes y chargeback» del pitch (docs/pitch/cardea-pitch.pdf)." />
    </>
  );
}
