export declare const SITE: string;
export declare const LOCALES: readonly ["es", "en"];
export declare const DEFAULT_LOCALE: "es";
export declare const HREFLANG: { es: string; en: string };
type Pair = { es: string; en: string };
export declare const ROUTES: { home: Pair; privacy: Pair; terms: Pair; notice: Pair; cookies: Pair };
export declare function routeKeyFor(pathname: string): keyof typeof ROUTES | undefined;
