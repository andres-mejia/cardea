"use client";

import Link from "next/link";

import { Cabecera, Cargando } from "@/components/Cabecera";
import { Area, eur, Icono, type NombreIcono, PETROLEO, SERIE } from "@/components/graficos";
import { useUsuario } from "@/lib/auth/usuario-contexto";
import { usePantalla } from "@/lib/demo/use-pantalla";

/** Solo lo que pide actuar lleva color de estado; lo informativo va en neutro. */
const COLOR_ATENCION: Record<string, string> = {
  w: "text-estado-aviso-texto",
  b: "text-estado-bloqueada-texto",
};

function saludo(hoy: Date): string {
  const h = hoy.getHours();
  return h < 14 ? "Buenos días" : h < 21 ? "Buenas tardes" : "Buenas noches";
}

export default function PanelGeneral() {
  const d = usePantalla("panel");
  const usuario = useUsuario();
  const hoy = new Date();
  const nombre = usuario?.nombre.split(" ")[0] ?? "";
  const fecha = hoy.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const cabecera = <Cabecera titulo={`${saludo(hoy)}${nombre ? `, ${nombre}` : ""}`} subtitulo={fecha.charAt(0).toUpperCase() + fecha.slice(1)} />;
  if (!d) return <>{cabecera}<Cargando /></>;

  const pctPresupuesto = Math.round((d.gasto / d.presupuesto) * 100);
  const totalCanales = d.canales.reduce((s, c) => s + c.valor, 0);
  return (
    <>
      {cabecera}

      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <section className="tarjeta" aria-labelledby="atencion">
          <div className="tarjeta-titulo">
            <h2 id="atencion">Requiere atención</h2>
            <span className="meta">{d.atencion.length} pendientes</span>
          </div>
          <ul className="lista">
            {d.atencion.map((a) => (
              <li key={a.titulo} className="flex items-center gap-3 py-3">
                <span className={COLOR_ATENCION[a.clase] ?? "text-cardea-texto-suave"}>
                  <Icono n={a.icono as NombreIcono} size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{a.titulo}</p>
                  <p className="meta">{a.detalle}</p>
                </div>
                <Link href={a.href} className="boton sec peq">{a.accion}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="tarjeta flex flex-col" aria-labelledby="gasto">
          <h2 id="gasto" className="meta">Gasto de {d.mes}</h2>
          <p className="num mt-1 text-3xl">{eur(d.gasto)}</p>
          <p className="meta mt-1">+{d.variacion} % frente a {d.mesAnterior}</p>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span>Presupuesto del mes</span>
              <span className="num">{pctPresupuesto} % de {eur(d.presupuesto)}</span>
            </div>
            <div className="pista mt-2"><i style={{ width: `${pctPresupuesto}%` }} /></div>
          </div>
          <div className="mt-auto pt-5">
            <p className="etiqueta mb-2">Gasto diario</p>
            <Area vals={d.diario} w={400} h={72} line={PETROLEO} fill="color-mix(in srgb, var(--color-cardea-petroleo) 10%, transparent)" sw={1.8} pad={2} />
            <div className="etiqueta mt-1 flex justify-between"><span>1 {d.mes.slice(0, 3)}</span><span>Hoy</span></div>
          </div>
        </section>
      </div>

      <section className="tarjeta grid gap-5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-cardea-linea-suave" aria-label="Uso del mes">
        {d.kpis.map((k) => (
          <div key={k.etiqueta} className="sm:px-6 sm:first:pl-0 sm:last:pr-0">
            <p className="meta">{k.etiqueta}</p>
            <p className="num mt-1 text-2xl">{k.valor}</p>
            <p className="etiqueta mt-1">{k.etiqueta === "Bloqueadas" ? `${k.delta} de las peticiones` : `${k.delta} frente a ${d.mesAnterior}`}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="tarjeta" aria-labelledby="canal">
          <div className="tarjeta-titulo"><h2 id="canal">Gasto por canal</h2></div>
          <div className="flex h-3 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
            {d.canales.map((c, i) => (
              <span key={c.nombre} style={{ width: `${(c.valor / totalCanales) * 100}%`, background: SERIE[i] }} />
            ))}
          </div>
          <ul className="lista mt-3">
            {d.canales.map((c, i) => (
              <li key={c.nombre} className="flex items-center gap-2.5 py-2.5">
                <span className="muestra" style={{ background: SERIE[i] }} />
                <span className="flex-1">{c.nombre}</span>
                <span className="meta num font-normal">{Math.round((c.valor / totalCanales) * 100)} %</span>
                <span className="num w-20 text-right">{eur(c.valor)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="tarjeta" aria-labelledby="equipos">
          <div className="tarjeta-titulo">
            <h2 id="equipos">Presupuesto por equipo</h2>
            <span className="meta">Consumido este mes</span>
          </div>
          <ul className="space-y-3">
            {d.equipos.map((e) => {
              const pct = Math.round((e.gastado / e.presupuesto) * 100);
              const cerca = pct >= 90;
              return (
                <li key={e.nombre}>
                  <div className="flex justify-between gap-3">
                    <span>{e.nombre}</span>
                    <span className={`num ${cerca ? "text-estado-aviso-texto" : ""}`}>
                      {cerca && <span className="mr-2 text-xs font-medium">Cerca del límite</span>}
                      {pct} %
                    </span>
                  </div>
                  <div className="pista mt-1.5"><i className={cerca ? "warn" : ""} style={{ width: `${pct}%` }} /></div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
