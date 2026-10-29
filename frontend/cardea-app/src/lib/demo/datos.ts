/**
 * Datos ilustrativos de las pantallas del MVP (los del pitch, docs/pitch/pitch_ui.py).
 * Los sirve `/api/demo/<pantalla>` hasta que exista el control plane; todas las cifras
 * se marcan en pantalla como ilustrativas (AGENTS.md §3).
 */

export type Tono = "ok" | "warn" | "bad" | "mute" | "info";
export type ClaseIcono = "t" | "w" | "b" | "m" | "g" | "k";

export interface Equipo { nombre: string; centro: string; presupuesto: number; gastado: number }

const EQUIPOS: Equipo[] = [
  { nombre: "Plataforma", centro: "CC-1040", presupuesto: 6000, gastado: 5310 },
  { nombre: "Datos", centro: "CC-1300", presupuesto: 5000, gastado: 4120 },
  { nombre: "Siniestros", centro: "CC-2210", presupuesto: 4000, gastado: 3680 },
  { nombre: "Canales digitales", centro: "CC-3105", presupuesto: 3500, gastado: 2890 },
  { nombre: "Backoffice", centro: "CC-4020", presupuesto: 3000, gastado: 2420 },
];

const DIARIO = [410, 455, 470, 520, 498, 260, 240, 530, 575, 590, 610, 640, 300, 280, 650, 690, 700, 735, 720, 330, 310, 760, 790, 805, 840, 820, 360, 340, 870, 905];

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function periodo(hoy: Date) {
  const m = hoy.getMonth();
  return { mes: MESES[m] ?? "", mesAnterior: MESES[(m + 11) % 12] ?? "", anio: hoy.getFullYear() };
}

export function panel(hoy: Date) {
  const p = periodo(hoy);
  return {
    mes: p.mes,
    mesAnterior: p.mesAnterior,
    gasto: 18420,
    variacion: 12,
    presupuesto: 21500,
    diario: DIARIO,
    canales: [
      { nombre: "Aplicaciones", valor: 9870 },
      { nombre: "CLIs de código", valor: 6130 },
      { nombre: "Asientos", valor: 2420 },
    ],
    kpis: [
      { icono: "users", clase: "t", etiqueta: "Usuarios activos", valor: "214", delta: "+18", tono: "ok", serie: [170, 176, 181, 190, 188, 197, 203, 208, 214], color: "teal" },
      { icono: "send", clase: "k", etiqueta: "Peticiones", valor: "1,28 M", delta: "+9 %", tono: "ok", serie: [0.9, 1.0, 0.97, 1.05, 1.1, 1.12, 1.2, 1.24, 1.28], color: "ink" },
      { icono: "block", clase: "b", etiqueta: "Bloqueadas", valor: "342", delta: "0,03 %", tono: "mute", serie: [48, 41, 44, 39, 36, 40, 33, 31, 30], color: "bad" },
    ],
    atencion: [
      { icono: "alert", clase: "w", titulo: "Siniestros va al 92 % de su presupuesto", detalle: "Presupuesto mensual, quedan 320 €", accion: "Ampliar", href: "/costes" },
      { icono: "eye", clase: "t", titulo: "14 peticiones con datos personales redactados", detalle: "Hoy, en 2 aplicaciones", accion: "Ver", href: "/actividad" },
      { icono: "plug", clase: "b", titulo: "El collector de facturación cloud falla", detalle: "La credencial caducó ayer", accion: "Reconectar", href: "/conexiones" },
      { icono: "key", clase: "m", titulo: "3 claves sin uso en 30 días", detalle: "Candidatas a revocar", accion: "Revisar", href: "/desarrolladores" },
    ],
    equipos: EQUIPOS,
  };
}

export function costes(hoy: Date) {
  const p = periodo(hoy);
  return {
    periodo: `${p.mes.charAt(0).toUpperCase()}${p.mes.slice(1)} de ${p.anio}`,
    total: 18420,
    semanas: [
      { etiqueta: "S1", total: 4020 },
      { etiqueta: "S2", total: 4480 },
      { etiqueta: "S3", total: 4790 },
      { etiqueta: "S4", total: 5130 },
    ],
    modelos: [
      { nombre: "Claude Sonnet", valor: 7940 },
      { nombre: "GPT", valor: 5260 },
      { nombre: "Gemini", valor: 3150 },
      { nombre: "Otros", valor: 2070 },
    ],
    // Reparto alternativo para las pestañas Proyecto y Herramienta.
    proyectos: [
      { nombre: "app-siniestros", centro: "PRJ-071", presupuesto: 4500, gastado: 3920 },
      { nombre: "app-backoffice", centro: "PRJ-044", presupuesto: 3000, gastado: 2110 },
      { nombre: "Migración COBOL", centro: "PRJ-102", presupuesto: 5000, gastado: 4870 },
      { nombre: "Portal clientes", centro: "PRJ-018", presupuesto: 4000, gastado: 3060 },
      { nombre: "Analítica", centro: "PRJ-090", presupuesto: 5000, gastado: 4460 },
    ],
    herramientas: [
      { nombre: "Claude Code", centro: "CLI", presupuesto: 7000, gastado: 5980 },
      { nombre: "Copilot", centro: "Asientos", presupuesto: 3000, gastado: 2420 },
      { nombre: "Codex", centro: "CLI", presupuesto: 1500, gastado: 1150 },
      { nombre: "API de aplicaciones", centro: "API", presupuesto: 9000, gastado: 7870 },
      { nombre: "Tools MCP", centro: "MCP", presupuesto: 1500, gastado: 1000 },
    ],
    equipos: EQUIPOS,
  };
}

export function politicas() {
  return {
    reglas: [
      { id: "datos-clientes", icono: "eye", clase: "t", nombre: "Datos de clientes no salen sin redactar", categoria: "Datos", ambitos: ["Todos los equipos", "API y CLIs"], accion: "Redactar", aciertos: 1204, activa: true, estado: "Activa", tono: "ok" },
      { id: "modelos-siniestros", icono: "sliders", clase: "k", nombre: "Modelos permitidos en Siniestros", categoria: "Modelos", ambitos: ["Siniestros"], accion: "Lista permitida", aciertos: 86, activa: true, estado: "Activa", tono: "ok" },
      { id: "tools-mcp", icono: "plug", clase: "t", nombre: "Tools MCP permitidas por equipo", categoria: "Tools", ambitos: ["Todos los equipos", "MCP remoto"], accion: "Lista permitida", aciertos: 58, activa: true, estado: "Activa", tono: "ok" },
      { id: "limite-mensual", icono: "euro", clase: "w", nombre: "Límite mensual por equipo", categoria: "Gasto", ambitos: ["Todos los equipos"], accion: "Bloquear al 100 %", aciertos: 0, activa: true, estado: "Activa", tono: "ok" },
      { id: "codigo-confidencial", icono: "term", clase: "m", nombre: "Código marcado como confidencial", categoria: "Datos", ambitos: ["CLIs"], accion: "Avisar", aciertos: 37, activa: true, estado: "En pruebas", tono: "warn" },
      { id: "fuera-ue", icono: "shield", clase: "m", nombre: "Proveedores fuera de la UE", categoria: "Modelos", ambitos: ["Backoffice"], accion: "Bloquear", aciertos: 0, activa: false, estado: "Borrador", tono: "mute" },
    ],
    detecta: ["DNI/NIE", "IBAN", "Correo", "Teléfono", "Nombre y apellidos"],
  };
}

export function actividad() {
  return {
    resumen: { permitidas: 1842, redactadas: 61, bloqueadas: 7, tools: 212 },
    feed: [
      { id: "req_51c0e8aa", quien: "Laura Ortega", avatar: 1, app: false, herramienta: "Claude Code", destino: "Claude Sonnet", proveedor: "Anthropic", coste: "0,09 €", decision: "Permitida", tono: "ok", hora: "10:42:18", regla: "Ninguna aplicable", ms: 1, latencia: "2,4 s" },
      { id: "req_7f3a91c2", quien: "app-siniestros", avatar: 0, app: true, herramienta: "API", destino: "GPT", proveedor: "OpenAI", coste: "0,04 €", decision: "Redactada", tono: "info", hora: "10:42:03", regla: "datos de clientes", ms: 2, latencia: "1,8 s", redactados: 3 },
      { id: "req_a19d2b07", quien: "Marc Vidal", avatar: 2, app: false, herramienta: "Copilot CLI", destino: "tool MCP github.create_pull_request", proveedor: "GitHub MCP", coste: "tool", decision: "Permitida", tono: "ok", hora: "10:41:57", regla: "tools MCP permitidas", ms: 1, latencia: "0,6 s" },
      { id: "req_0c44e5f1", quien: "app-backoffice", avatar: 0, app: true, herramienta: "API", destino: "Gemini", proveedor: "Google", coste: "0,01 €", decision: "Bloqueada", tono: "bad", hora: "10:41:40", regla: "proveedores fuera de la UE", ms: 1, latencia: "—" },
      { id: "req_93be7a10", quien: "Rosa Castro", avatar: 3, app: false, herramienta: "Codex", destino: "GPT", proveedor: "OpenAI", coste: "0,11 €", decision: "Permitida", tono: "ok", hora: "10:41:22", regla: "Ninguna aplicable", ms: 1, latencia: "3,1 s" },
      { id: "req_2d7f66c9", quien: "Laura Ortega", avatar: 1, app: false, herramienta: "Claude Code", destino: "Claude Sonnet", proveedor: "Anthropic", coste: "0,11 €", decision: "Aviso", tono: "warn", hora: "10:40:31", regla: "código marcado como confidencial", ms: 3, latencia: "2,9 s" },
      { id: "req_e8a1c3d4", quien: "Rosa Castro", avatar: 3, app: false, herramienta: "Codex", destino: "tool MCP postgres-prod.query", proveedor: "Postgres MCP", coste: "tool", decision: "Bloqueada", tono: "bad", hora: "10:40:12", regla: "tools MCP permitidas", ms: 1, latencia: "—" },
      { id: "req_6b2f09e3", quien: "Sergio Navarro", avatar: 4, app: false, herramienta: "Claude Code", destino: "Claude Sonnet", proveedor: "Anthropic", coste: "0,06 €", decision: "Permitida", tono: "ok", hora: "10:39:58", regla: "Ninguna aplicable", ms: 1, latencia: "1,9 s" },
    ],
  };
}

export function desarrolladores() {
  return {
    herramientas: [
      { nombre: "Claude Code", valor: 48 },
      { nombre: "Copilot", valor: 61 },
      { nombre: "Codex", valor: 22 },
    ],
    conClave: 86,
    activos: 214,
    caducanSemana: 5,
    devs: [
      { avatar: 1, nombre: "Laura Ortega", equipo: "Plataforma", herramientas: ["Claude Code", "Copilot"], gasto: 412, estado: "Activa", tono: "ok", serie: [30, 42, 38, 55, 61, 58, 72] },
      { avatar: 2, nombre: "Marc Vidal", equipo: "Plataforma", herramientas: ["Copilot CLI"], gasto: 188, estado: "Activa", tono: "ok", serie: [20, 22, 25, 21, 28, 30, 27] },
      { avatar: 3, nombre: "Rosa Castro", equipo: "Datos", herramientas: ["Codex", "Claude Code"], gasto: 356, estado: "Caduca en 3 días", tono: "warn", serie: [40, 44, 52, 49, 58, 55, 60] },
      { avatar: 4, nombre: "Sergio Navarro", equipo: "Canales digitales", herramientas: ["Claude Code"], gasto: 97, estado: "Activa", tono: "ok", serie: [10, 14, 12, 18, 15, 16, 14] },
      { avatar: 5, nombre: "Pablo Gil", equipo: "Datos", herramientas: ["Copilot"], gasto: 0, estado: "Sin uso, 34 días", tono: "mute", serie: [6, 4, 2, 1, 0, 0, 0] },
      { avatar: 6, nombre: "Ana Ferrer", equipo: "Siniestros", herramientas: ["Claude Code"], gasto: 241, estado: "Activa", tono: "ok", serie: [22, 30, 28, 36, 40, 38, 44] },
    ],
  };
}

export function evidencias(hoy: Date) {
  const trimestre = Math.floor(hoy.getMonth() / 3);
  const nombres = ["Primer", "Segundo", "Tercer", "Cuarto"];
  const anterior = (trimestre + 3) % 4;
  const anioAnterior = trimestre === 0 ? hoy.getFullYear() - 1 : hoy.getFullYear();
  return {
    controles: [
      { icono: "check", clase: "g", texto: "Inventario de herramientas y modelos en uso", estado: "Cubierto", tono: "ok" },
      { icono: "check", clase: "g", texto: "Registro de accesos por usuario y equipo", estado: "Cubierto", tono: "ok" },
      { icono: "check", clase: "g", texto: "Tratamiento de datos personales en peticiones", estado: "Cubierto", tono: "ok" },
      { icono: "check", clase: "g", texto: "Límites de gasto aprobados y aplicados", estado: "Cubierto", tono: "ok" },
      { icono: "check", clase: "g", texto: "Llamadas a tools MCP remotas, por usuario y tool", estado: "Cubierto", tono: "ok" },
      { icono: "alert", clase: "w", texto: "Completions inline de Copilot, solo métricas agregadas", estado: "Parcial", tono: "warn" },
      { icono: "block", clase: "b", texto: "Servidores MCP locales y tools internas del CLI", estado: "No cubierto", tono: "bad" },
      { icono: "block", clase: "b", texto: "Chat web fuera del SSO corporativo", estado: "No cubierto", tono: "bad" },
    ],
    pasos: [
      { clave: "Periodo", valor: `${nombres[anterior]} trimestre de ${anioAnterior}` },
      { clave: "Alcance", valor: "Todos los equipos" },
      { clave: "Contenido", valor: "Inventario, accesos, políticas, datos, gasto" },
      { clave: "Formato", valor: "PDF firmado y CSV" },
    ],
    anteriores: [
      { titulo: `${nombres[anterior]} trimestre de ${anioAnterior}`, detalle: "Generado el 1 de este trimestre, 42 páginas" },
      { titulo: `${nombres[(anterior + 3) % 4]} trimestre`, detalle: "38 páginas, PDF y CSV" },
      { titulo: "Auditoría interna, mayo", detalle: "20 may, PDF y CSV" },
    ],
  };
}

export function conexiones() {
  return {
    colectores: [
      { nombre: "Copilot, métricas", estado: "ok" },
      { nombre: "Claude Code, OTel", estado: "ok" },
      { nombre: "Facturación cloud", estado: "bad" },
      { nombre: "Entra ID", estado: "ok" },
    ],
    proveedores: [
      { nombre: "Anthropic", estado: "ok" },
      { nombre: "OpenAI", estado: "ok" },
      { nombre: "AWS Bedrock", estado: "ok" },
      { nombre: "Azure OpenAI", estado: "mute" },
    ],
    estado: [
      { letra: "A", clase: "k", nombre: "Anthropic", detalle: "Clave de organización, hace 1 min", estado: "Conectado", tono: "ok" },
      { letra: "O", clase: "k", nombre: "OpenAI", detalle: "Clave de proyecto, hace 1 min", estado: "Conectado", tono: "ok" },
      { letra: "B", clase: "k", nombre: "AWS Bedrock", detalle: "Rol de IAM, eu-west-1", estado: "Conectado", tono: "ok" },
      { letra: "Az", clase: "m", nombre: "Azure OpenAI", detalle: "Sin credenciales", estado: "Sin configurar", tono: "mute" },
      { letra: "G", clase: "t", nombre: "Métricas de GitHub Copilot", detalle: "Sincroniza cada hora", estado: "Conectado", tono: "ok" },
      { letra: "C", clase: "t", nombre: "Telemetría de Claude Code", detalle: "OpenTelemetry", estado: "Conectado", tono: "ok" },
      { letra: "F", clase: "b", nombre: "Facturación cloud", detalle: "La credencial caducó ayer", estado: "Reconectar", tono: "bad" },
      { letra: "E", clase: "t", nombre: "Microsoft Entra ID", detalle: "OIDC, 214 usuarios y 5 grupos", estado: "Conectado", tono: "ok" },
    ],
  };
}

export const PANTALLAS = {
  panel: (hoy: Date) => panel(hoy),
  costes: (hoy: Date) => costes(hoy),
  politicas: () => politicas(),
  actividad: () => actividad(),
  desarrolladores: () => desarrolladores(),
  evidencias: (hoy: Date) => evidencias(hoy),
  conexiones: () => conexiones(),
};

export type Pantalla = keyof typeof PANTALLAS;
export type DatosDe<P extends Pantalla> = ReturnType<(typeof PANTALLAS)[P]>;
