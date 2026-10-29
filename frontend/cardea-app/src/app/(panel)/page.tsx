"use client";

import Link from "next/link";

import { Cabecera, Cargando } from "@/components/Cabecera";
import { Area, BAD, Donut, eur, Icono, INK, type NombreIcono, TEAL, TEAL_L, WARN } from "@/components/graficos";
import { useUsuario } from "@/lib/auth/usuario-contexto";
import { usePantalla } from "@/lib/demo/use-pantalla";

const COLORES_CANAL = [INK, TEAL, "#8CCDD4"];
const COLOR_KPI: Record<string, string> = { teal: TEAL, ink: INK, bad: BAD };

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
  return (
    <>
      {cabecera}
      <div className="r2">
        <div className="c2 dark" style={{ flex: 1.65, display: "flex", flexDirection: "column", paddingBottom: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 10.5, color: "#9FB4C4" }}>Gasto de {d.mes}</div>
              <div className="num" style={{ fontSize: 36, lineHeight: 1.1, marginTop: 3 }}>{eur(d.gasto)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className="chip glass">+{d.variacion} % frente a {d.mesAnterior}</span>
              <div style={{ fontSize: 9.8, color: "#9FB4C4", marginTop: 8 }}>{pctPresupuesto} % del presupuesto de {eur(d.presupuesto)}</div>
              <div style={{ width: 150, height: 5, borderRadius: 3, background: "#2A4259", margin: "5px 0 0 auto" }}>
                <div style={{ width: `${pctPresupuesto}%`, height: "100%", borderRadius: 3, background: TEAL_L }} />
              </div>
            </div>
          </div>
          <div style={{ margin: "10px -16px 0" }}>
            <Area vals={d.diario} w={480} h={84} line={TEAL_L} fill="rgba(108,203,211,.16)" />
          </div>
        </div>
        <div className="c2" style={{ flex: 1 }}>
          <h4>Gasto por canal</h4>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Donut segs={d.canales.map((c, i): [number, string] => [c.valor, COLORES_CANAL[i] ?? INK])} size={104} thick={15}>
              <div className="num" style={{ fontSize: 15 }}>{d.canales.length}</div>
              <div style={{ fontSize: 8.5, color: "#5F7183" }}>canales</div>
            </Donut>
            <div style={{ flex: 1 }}>
              {d.canales.map((c, i) => (
                <div key={c.nombre} className="lg">
                  <i style={{ background: COLORES_CANAL[i] }} />
                  {c.nombre}
                  <b>{eur(c.valor)}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="r2">
        {d.kpis.map((k) => (
          <div key={k.etiqueta} className="c2" style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "11px 14px" }}>
            <div className={`ic ${k.clase}`}><Icono n={k.icono as NombreIcono} size={15} /></div>
            <div>
              <div style={{ fontSize: 9.8, color: "#5F7183" }}>{k.etiqueta}</div>
              <div className="num" style={{ fontSize: 19, lineHeight: 1.15 }}>{k.valor}</div>
            </div>
            <div style={{ marginLeft: "auto", width: 74, textAlign: "right" }}>
              <span className={`chip ${k.tono}`} style={{ padding: "1.5px 7px" }}>{k.delta}</span>
              <div style={{ marginTop: 5 }}>
                <Area vals={k.serie} w={74} h={22} line={COLOR_KPI[k.color] ?? TEAL} fill="transparent" sw={1.6} pad={2} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="r2" style={{ flex: 1 }}>
        <div className="c2" style={{ flex: 1.45 }}>
          <h4>Requiere atención<span>{d.atencion.length} pendientes</span></h4>
          {d.atencion.map((a) => (
            <div key={a.titulo} className="li">
              <div className={`ic ${a.clase}`}><Icono n={a.icono as NombreIcono} size={14} /></div>
              <div className="tx"><b>{a.titulo}</b><span>{a.detalle}</span></div>
              <Link href={a.href} className="chip line hover:text-cardea-petroleo">{a.accion}</Link>
            </div>
          ))}
        </div>
        <div className="c2" style={{ flex: 1 }}>
          <h4>Presupuesto por equipo</h4>
          {d.equipos.map((e) => {
            const pct = Math.round((e.gastado / e.presupuesto) * 100);
            return (
              <div key={e.nombre} style={{ marginBottom: 9 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.3 }}>
                  <span>{e.nombre}</span>
                  <span className="num">{pct} %</span>
                </div>
                <div style={{ height: 7, borderRadius: 4, background: "#E6ECF1", marginTop: 4 }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: pct >= 90 ? WARN : TEAL }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
