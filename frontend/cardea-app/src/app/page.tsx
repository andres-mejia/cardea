import { Cabecera } from "@/components/Cabecera";
import { Pendiente } from "@/components/Tarjeta";

export default function PanelGeneral() {
  return (
    <>
      <Cabecera titulo="Panel general" subtitulo="Resume el mes y señala lo que necesita una decisión" />
      <Pendiente que="Gasto del mes, reparto por canal, usuarios activos, peticiones, bloqueadas, lo que requiere atención y presupuesto por equipo." />
    </>
  );
}
