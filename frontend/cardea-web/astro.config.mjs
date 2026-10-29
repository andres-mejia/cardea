import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { SITE, ROUTES, HREFLANG, routeKeyFor } from "./src/i18n/routes.mjs";

export default defineConfig({
  site: SITE,
  output: "static",
  trailingSlash: "ignore",
  i18n: {
    locales: ["es", "en"],
    defaultLocale: "es",
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      // Las páginas legales tienen slugs distintos por idioma: los alternates se declaran a mano.
      serialize(item) {
        const key = routeKeyFor(new URL(item.url).pathname);
        if (key) {
          const pair = ROUTES[key];
          item.links = [
            { lang: HREFLANG.es, url: new URL(pair.es, SITE).toString() },
            { lang: HREFLANG.en, url: new URL(pair.en, SITE).toString() },
            { lang: "x-default", url: new URL(pair.es, SITE).toString() },
          ];
        }
        return item;
      },
    }),
  ],
});
