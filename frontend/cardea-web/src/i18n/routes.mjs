// Rutas equivalentes por idioma. Las usa la cabecera (selector ES/EN), el layout (canonical y hreflang)
// y astro.config.mjs (alternates del sitemap). Las URLs españolas de legal no cambian: Google OAuth las usa.
export const SITE = "https://cardea.tekhos.com";
export const LOCALES = ["es", "en"];
export const DEFAULT_LOCALE = "es";
export const HREFLANG = { es: "es-ES", en: "en" };

export const ROUTES = {
  home: { es: "/", en: "/en/" },
  privacy: { es: "/legal/privacidad/", en: "/en/legal/privacy/" },
  terms: { es: "/legal/terminos/", en: "/en/legal/terms/" },
  notice: { es: "/legal/aviso-legal/", en: "/en/legal/legal-notice/" },
  cookies: { es: "/legal/cookies/", en: "/en/legal/cookies/" },
};

/** Devuelve la clave de ruta a partir de una ruta absoluta o relativa, con o sin barra final. */
export function routeKeyFor(pathname) {
  const p = pathname.endsWith("/") ? pathname : `${pathname}/`;
  for (const [key, paths] of Object.entries(ROUTES)) {
    if (paths.es === p || paths.en === p) return key;
  }
  return undefined;
}
