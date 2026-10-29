import type { APIRoute } from "astro";
import { t, path, withRoutes, type Lang } from "../i18n";
import { SITE } from "../i18n/routes.mjs";

// Texto completo de la web en inglés y en español, generado de los mismos diccionarios que las páginas.
const texto = (html: string) =>
  html.replace(/<li>/g, "\n- ").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\n{3,}/g, "\n\n").trim();

function idioma(lang: Lang): string {
  const d = t(lang);
  const url = (p: string) => new URL(p, SITE).toString();
  const out: string[] = [];
  out.push(`# Cardea (${lang === "en" ? "English" : "Español"}) — ${url(path("home", lang))}`, "");
  out.push(`## ${d.hero.title}`, "", d.hero.lead, "");
  out.push(`### ${d.flow.label}`, "", d.flow.caption, "");
  out.push(`## ${d.problem.title}`, "");
  for (const p of d.problem.items) out.push(`- ${p.who}: ${p.q}${p.d ? ` ${p.d}` : ""}`);
  out.push("", `## ${d.what.title}`, "", `### ${d.what.controls}`, "");
  for (const c of d.what.control) out.push(`- ${c.t}: ${c.d}`);
  out.push("", `### ${d.what.records}`, "", `- ${d.what.record.t}: ${d.what.record.d}`, "");
  for (const b of d.what.benefits) out.push(`- ${b.t}: ${b.d}`);
  out.push("", `## ${d.screens.title}`, "", `(${d.ui.illustrative})`, "");
  for (const s of d.screens.items) out.push(`- ${s.t} — ${s.q} ${s.d}`);
  out.push("", `## ${d.scope.title}`, "", d.scope.lead, "");
  out.push(`### ${d.scope.core.title}`, "");
  for (const s of d.scope.core.items) out.push(`- ${s.t}: ${s.d}`);
  out.push("", `### ${d.scope.edge.title}`, "");
  for (const s of d.scope.edge.items) out.push(`- ${s.t} (${s.who}): ${s.d}`);
  out.push("", `## ${d.install.title}`, "", d.install.lead, "");
  d.install.steps.forEach((s, i) => out.push(`${i + 1}. ${s.v} ${s.d}`));
  out.push("", `## ${d.demo.title}`, "", d.demo.lead, `${url(path("home", lang))}#demo`, "");
  for (const key of ["privacy", "terms", "notice", "cookies"] as const) {
    const doc = d.legal.pages[key];
    out.push(`## ${doc.title} — ${url(path(key, lang))}`, "", d.legal.updated, "");
    for (const s of doc.sections) out.push(`### ${s.h}`, "", texto(withRoutes(s.body.join("\n"), lang)), "");
  }
  out.push(d.footer.owner, d.footer.note, "");
  return out.join("\n");
}

export const GET: APIRoute = () =>
  new Response(`${idioma("en")}\n---\n\n${idioma("es")}`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
