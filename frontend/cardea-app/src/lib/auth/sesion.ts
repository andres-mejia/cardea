/**
 * Sesión de Cognito (portada de Jano): token, usuario y salida en una sola capa.
 * Amplify se importa dinámicamente para que el modo de ejemplo no lo cargue.
 */

import { configuracionAmplify } from "./amplify-config";
import { esModoEjemplo } from "./config";
import { clasificarRetorno, type ErrorRetorno } from "./oauth-retorno";

export interface Usuario {
  readonly email: string;
  readonly nombre: string;
  readonly tenantId: string;
  readonly rol: "owner" | "member";
  /** Foto de la cuenta de Google (atributo `picture`); vacía si entra con contraseña. */
  readonly foto: string;
}

const USUARIO_DE_EJEMPLO: Usuario = {
  email: "marta.soler@cardea.example",
  nombre: "Marta Soler",
  tenantId: "demo",
  rol: "owner",
  foto: "",
};

let configurado = false;
let errorDeRetorno: ErrorRetorno | null = null;

const CLAVE_REINTENTO = "cardea:google-reintento";

async function asegurarAmplify(): Promise<void> {
  if (configurado || esModoEjemplo()) return;
  // El error del retorno de Google se lee antes de configurar: Amplify limpia la URL.
  if (typeof window !== "undefined") errorDeRetorno = clasificarRetorno(window.location.search);
  const { Amplify } = await import("aws-amplify");
  // Sin el listener, el `code` del retorno de Cognito no se canjea por tokens.
  await import("aws-amplify/auth/enable-oauth-listener");
  Amplify.configure(configuracionAmplify(), { ssr: false });
  configurado = true;
}

/** El error con el que volvió el último «Continuar con Google», una sola vez. */
export function consumirErrorDeRetorno(): ErrorRetorno | null {
  const error = errorDeRetorno;
  errorDeRetorno = null;
  return error;
}

export async function entrarConGoogle(): Promise<void> {
  if (esModoEjemplo()) return;
  await asegurarAmplify();
  const { signInWithRedirect } = await import("aws-amplify/auth");
  await signInWithRedirect({ provider: "Google" });
}

/**
 * Primer login tras enlazar la identidad de Google: Cognito falla una vez
 * («Already found an entry for username») y el segundo intento entra sin pedir
 * nada, porque la sesión de Google sigue abierta. Solo se reintenta una vez.
 */
export async function reintentarGoogleUnaVez(): Promise<boolean> {
  if (typeof window === "undefined" || window.sessionStorage.getItem(CLAVE_REINTENTO)) return false;
  window.sessionStorage.setItem(CLAVE_REINTENTO, "1");
  await entrarConGoogle();
  return true;
}

export async function idToken(forzarRefresco = false): Promise<string | null> {
  if (esModoEjemplo()) return null;
  try {
    await asegurarAmplify();
    const { fetchAuthSession } = await import("aws-amplify/auth");
    const sesion = await fetchAuthSession({ forceRefresh: forzarRefresco });
    return sesion.tokens?.idToken?.toString() ?? null;
  } catch {
    return null;
  }
}

export async function usuarioActual(): Promise<Usuario | null> {
  if (esModoEjemplo()) return USUARIO_DE_EJEMPLO;
  try {
    await asegurarAmplify();
    const { fetchAuthSession } = await import("aws-amplify/auth");
    const sesion = await fetchAuthSession();
    const payload = sesion.tokens?.idToken?.payload;
    if (!payload) return null;
    if (typeof window !== "undefined") window.sessionStorage.removeItem(CLAVE_REINTENTO);
    const texto = (k: string): string => (typeof payload[k] === "string" ? (payload[k] as string) : "");
    return {
      email: texto("email"),
      nombre: texto("name") || texto("email"),
      tenantId: texto("custom:tenant_id"),
      rol: texto("custom:role") === "owner" ? "owner" : "member",
      foto: texto("picture"),
    };
  } catch {
    return null;
  }
}

/** Resultado de entrar con contraseña: dentro, o hace falta fijar una contraseña nueva. */
export type ResultadoEntrada = "dentro" | "nueva_contrasena";

/** Traduce los errores de Cognito a un mensaje que la persona pueda entender. */
export function mensajeDeError(e: unknown): string {
  const nombre = e instanceof Error ? e.name : "";
  switch (nombre) {
    case "NotAuthorizedException":
    case "UserNotFoundException":
      return "El email o la contraseña no son correctos.";
    case "InvalidPasswordException":
      return "La contraseña nueva no cumple la política: al menos 12 caracteres, con mayúsculas, minúsculas, números y símbolos.";
    case "LimitExceededException":
    case "TooManyRequestsException":
      return "Demasiados intentos. Espera unos minutos y vuelve a probar.";
    case "UserNotConfirmedException":
      return "Tu cuenta aún no está confirmada. Pide ayuda a tu administrador.";
    default:
      return "No se ha podido iniciar sesión. Prueba otra vez en un momento.";
  }
}

export async function entrar(email: string, contrasena: string): Promise<ResultadoEntrada> {
  if (esModoEjemplo()) return "dentro";
  await asegurarAmplify();
  const auth = await import("aws-amplify/auth");
  const resultado = await auth.signIn({
    username: email,
    password: contrasena,
    options: { authFlowType: "USER_AUTH", preferredChallenge: "PASSWORD_SRP" },
  });
  if (resultado.isSignedIn) return "dentro";
  // Usuario dado de alta por un administrador: la primera vez fija su contraseña.
  if (resultado.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") return "nueva_contrasena";
  throw new Error(`Inicio de sesión incompleto: ${resultado.nextStep.signInStep}`);
}

export async function fijarContrasena(nueva: string): Promise<void> {
  await asegurarAmplify();
  const { confirmSignIn } = await import("aws-amplify/auth");
  const resultado = await confirmSignIn({ challengeResponse: nueva });
  if (!resultado.isSignedIn) throw new Error(`Inicio de sesión incompleto: ${resultado.nextStep.signInStep}`);
}

let saliendo = false;

export async function salir(): Promise<void> {
  if (saliendo) return;
  saliendo = true;
  try {
    if (!esModoEjemplo()) {
      await asegurarAmplify();
      const { signOut } = await import("aws-amplify/auth");
      await signOut().catch(() => undefined);
    }
  } finally {
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      // Recarga completa a propósito: vacía el estado de Amplify.
      window.location.assign("/login");
    }
    saliendo = false;
  }
}
