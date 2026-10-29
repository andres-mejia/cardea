/**
 * Redacción de demostración para el probador de reglas: sustituye datos personales por
 * marcadores. Solo ilustra la regla en el navegador; la real vive en el data plane.
 */

export type Trozo = { texto: string; marcador?: string };

const PATRONES: [string, RegExp][] = [
  ["IBAN", /\bES\d{2}(?:\s?\d{4}){5}\b/g],
  ["DNI", /\b(?:\d{8}|[XYZ]\d{7})[A-Z]\b/g],
  ["CORREO", /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g],
  ["TELÉFONO", /(?:\+34\s?)?\b[6789]\d{2}\s?\d{3}\s?\d{3}\b/g],
  // Nombre y apellidos: dos o más palabras en mayúscula tras «de», «a», «con» o «para».
  ["NOMBRE", /(?<=\b(?:de|a|con|para)\s)[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+/g],
];

export function redactar(texto: string): { trozos: Trozo[]; cuenta: number } {
  const marcas: { ini: number; fin: number; marcador: string }[] = [];
  for (const [marcador, re] of PATRONES) {
    for (const m of texto.matchAll(re)) {
      const ini = m.index ?? 0;
      const fin = ini + m[0].length;
      if (!marcas.some((x) => ini < x.fin && fin > x.ini)) marcas.push({ ini, fin, marcador });
    }
  }
  marcas.sort((a, b) => a.ini - b.ini);
  const trozos: Trozo[] = [];
  let pos = 0;
  for (const m of marcas) {
    if (m.ini > pos) trozos.push({ texto: texto.slice(pos, m.ini) });
    trozos.push({ texto: "", marcador: m.marcador });
    pos = m.fin;
  }
  if (pos < texto.length) trozos.push({ texto: texto.slice(pos) });
  return { trozos, cuenta: marcas.length };
}
