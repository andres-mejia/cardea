"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useSyncExternalStore } from "react";

import { Isotipo } from "@/components/Isotipo";
import { COGNITO, esModoEjemplo } from "@/lib/auth/config";
import { mensajeDeRetorno } from "@/lib/auth/oauth-retorno";
import { entrar, entrarConGoogle, fijarContrasena, mensajeDeError } from "@/lib/auth/sesion";

const sinSuscripcion = () => () => {};

/** «G» de Google con sus colores, como piden sus pautas para el botón de acceso. */
function LogoGoogle() {
  return (
    <svg viewBox="0 0 48 48" width={18} height={18} aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
const leerErrorDeRetorno = () => mensajeDeRetorno(new URLSearchParams(window.location.search).get("error"));

const CAMPO =
  "mt-1.5 h-11 w-full rounded-control border border-cardea-linea bg-white px-3.5 text-lg outline-none focus:border-cardea-petroleo focus:ring-2 focus:ring-cardea-petroleo/25 sm:text-base";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [pideNueva, setPideNueva] = useState(false);
  const [nueva, setNueva] = useState("");
  const conGoogle = !esModoEjemplo() && !!COGNITO.domain;

  // Error del retorno de Google (lo deja aquí el layout del panel). Se lee de la URL en el
  // cliente y deja de mostrarse al volver a intentar.
  const errorDeRetorno = useSyncExternalStore(sinSuscripcion, leerErrorDeRetorno, () => null);
  const [retornoVisto, setRetornoVisto] = useState(false);
  const aviso = error ?? (retornoVisto ? null : errorDeRetorno);

  async function onGoogle() {
    setRetornoVisto(true);
    setOcupado(true);
    setError(null);
    try {
      await entrarConGoogle();
    } catch {
      setError(mensajeDeRetorno("google"));
      setOcupado(false);
    }
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setRetornoVisto(true);
    setOcupado(true);
    setError(null);
    try {
      if (pideNueva) {
        await fijarContrasena(nueva);
        router.replace("/");
      } else if ((await entrar(email, contrasena)) === "nueva_contrasena") {
        setPideNueva(true);
      } else {
        router.replace("/");
      }
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <main className="grid min-h-screen grid-rows-[auto_1fr] lg:grid-cols-2 lg:grid-rows-1">
      <section className="flex flex-col gap-6 bg-cardea-tinta px-6 py-6 text-white lg:justify-between lg:p-10">
        <div className="flex items-center gap-2.5 text-2xl font-semibold tracking-[-0.02em]">
          <Isotipo size={30} dark />
          Cardea
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl">Gobierno del uso de IA.</h1>
          <p className="mt-2 max-w-md text-lg text-cardea-nav-texto">
            Quién usa qué modelo, con qué datos, qué tools ejecuta y a qué coste. Sin guardar un solo prompt.
          </p>
        </div>
        <p className="hidden text-xs text-cardea-nav-suave lg:block">{esModoEjemplo() ? "Modo de ejemplo, sin Cognito" : "Entorno dev"}</p>
      </section>

      <section className="flex items-start justify-center px-4 py-6 lg:items-center lg:p-8">
        <form onSubmit={onSubmit} className="w-full max-w-sm rounded-tarjeta bg-white p-6 sm:p-7">
          <h2 className="text-2xl">{pideNueva ? "Elige tu contraseña" : "Entrar"}</h2>
          <p className="mt-1 text-sm text-cardea-texto-suave">
            {pideNueva ? "Es tu primera vez: sustituye la contraseña temporal que te dio tu administrador." : "Con tu cuenta de empresa."}
          </p>
          {pideNueva ? (
            <label className="mt-6 block text-sm font-semibold">
              Contraseña nueva
              <input type="password" required autoComplete="new-password" minLength={12} value={nueva} onChange={(e) => setNueva(e.target.value)} aria-describedby="politica" className={CAMPO} />
              <span id="politica" className="mt-1.5 block text-xs font-normal text-cardea-texto-suave">Al menos 12 caracteres, con mayúsculas, minúsculas, números y símbolos.</span>
            </label>
          ) : (
          <>
          <label className="mt-6 block text-sm font-semibold">
            Correo electrónico
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={CAMPO} />
          </label>
          <label className="mt-4 block text-sm font-semibold">
            Contraseña
            <input type="password" required autoComplete="current-password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} className={CAMPO} />
          </label>
          </>
          )}
          {aviso && (
            <p role="alert" className="mt-4 rounded-control bg-estado-bloqueada-fondo p-3 text-sm text-estado-bloqueada-texto">
              {aviso}
            </p>
          )}
          <button type="submit" disabled={ocupado} className="mt-6 h-11 w-full rounded-control bg-cardea-petroleo text-base font-medium text-white hover:bg-cardea-petroleo-oscuro disabled:opacity-60">
            {ocupado ? "Entrando…" : pideNueva ? "Guardar y entrar" : "Entrar"}
          </button>
          {conGoogle && !pideNueva && (
            <>
              <div className="my-4 flex items-center gap-3 text-xs text-cardea-texto-suave" aria-hidden="true">
                <span className="h-px flex-1 bg-cardea-linea" />o<span className="h-px flex-1 bg-cardea-linea" />
              </div>
              <button type="button" disabled={ocupado} onClick={onGoogle} className="flex h-11 w-full items-center justify-center gap-2.5 rounded-control border border-cardea-linea text-base font-medium text-cardea-tinta hover:bg-cardea-niebla disabled:opacity-60">
                <LogoGoogle />
                Continuar con Google
              </button>
            </>
          )}
          {esModoEjemplo() && <p className="mt-3 text-center text-xs text-cardea-texto-suave">En modo de ejemplo cualquier credencial entra.</p>}
        </form>
      </section>
    </main>
  );
}
