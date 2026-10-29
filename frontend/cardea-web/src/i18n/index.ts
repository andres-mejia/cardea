import es from "./es";
import en from "./en";
import { ROUTES } from "./routes.mjs";

export type Lang = "es" | "en";
export type RouteKey = keyof typeof ROUTES;
export type LegalKey = Exclude<RouteKey, "home">;

const dicts = { es, en } as const;

export function t(lang: Lang) {
  return dicts[lang];
}

export function path(key: RouteKey, lang: Lang): string {
  return ROUTES[key][lang];
}

export function other(lang: Lang): Lang {
  return lang === "es" ? "en" : "es";
}

/** Sustituye {privacy}, {terms}, {notice}, {cookies} por las rutas del idioma. */
export function withRoutes(html: string, lang: Lang): string {
  return html.replace(/\{(privacy|terms|notice|cookies)\}/g, (_, k: LegalKey) => path(k, lang));
}

export function asLang(value: string | undefined): Lang {
  return value === "en" ? "en" : "es";
}
