"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useSyncExternalStore } from "react";

import { Isotipo } from "@/components/Isotipo";
import { COGNITO, esModoEjemplo } from "@/lib/auth/config";
import { mensajeDeRetorno } from "@/lib/auth/oauth-retorno";
import { entrar, entrarConGoogle } from "@/lib/auth/sesion";

const sinSuscripcion = () => () => {};
const leerErrorDeRetorno = () => mensajeDeRetorno(new URLSearchParams(window.location.search).get("error"));

const CAMPO =
  "mt-1.5 w-full rounded-[10px] border border-cardea-linea bg-white px-3.5 py-2.5 text-[14px] outline-none focus:border-cardea-petroleo focus:ring-2 focus:ring-cardea-petroleo/25";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
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
      await entrar(email, contrasena);
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se ha podido iniciar sesión");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col justify-between bg-cardea-tinta p-10 text-white">
        <div className="flex items-center gap-2.5 text-[26px] font-semibold tracking-[-0.02em]">
          <Isotipo size={34} dark />
          Cardea
        </div>
        <div>
          <h1 className="text-[34px] leading-tight">Gobierno del uso de IA.</h1>
          <p className="mt-3 max-w-md text-[15px] text-[#AFC0CF]">
            Quién usa qué modelo, con qué datos, qué tools ejecuta y a qué coste. Sin guardar un solo prompt.
          </p>
        </div>
        <p className="text-[12px] text-[#7C93A6]">{esModoEjemplo() ? "Modo de ejemplo, sin Cognito" : "Entorno dev"}</p>
      </section>

      <section className="flex items-center justify-center p-8">
        <form onSubmit={onSubmit} className="w-full max-w-sm rounded-tarjeta bg-white p-7">
          <h2 className="text-[22px]">Entrar</h2>
          <p className="mt-1 text-[13px] text-cardea-texto-suave">Con tu cuenta de empresa.</p>
          <label className="mt-6 block text-[13px] font-semibold">
            Email
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={CAMPO} />
          </label>
          <label className="mt-4 block text-[13px] font-semibold">
            Contraseña
            <input type="password" required autoComplete="current-password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} className={CAMPO} />
          </label>
          {aviso && (
            <p role="alert" className="mt-3 rounded-[10px] bg-estado-bloqueada/10 p-3 text-[13px] text-estado-bloqueada">
              {aviso}
            </p>
          )}
          <button type="submit" disabled={ocupado} className="mt-6 w-full rounded-full bg-cardea-tinta py-2.5 text-[14px] text-white disabled:opacity-60">
            {ocupado ? "Entrando…" : "Entrar"}
          </button>
          {conGoogle && (
            <>
              <div className="my-4 flex items-center gap-3 text-[12px] text-cardea-texto-suave" aria-hidden="true">
                <span className="h-px flex-1 bg-cardea-linea" />o<span className="h-px flex-1 bg-cardea-linea" />
              </div>
              <button type="button" disabled={ocupado} onClick={onGoogle} className="w-full rounded-full border border-cardea-linea py-2.5 text-[14px] text-cardea-tinta disabled:opacity-60">
                Continuar con Google
              </button>
            </>
          )}
          {esModoEjemplo() && <p className="mt-3 text-center text-[12px] text-cardea-texto-suave">En modo de ejemplo cualquier credencial entra.</p>}
        </form>
      </section>
    </main>
  );
}
