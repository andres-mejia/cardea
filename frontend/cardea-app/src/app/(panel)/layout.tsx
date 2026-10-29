"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { BarraLateral } from "@/components/BarraLateral";
import { consumirErrorDeRetorno, reintentarGoogleUnaVez } from "@/lib/auth/sesion";
import { useSesion } from "@/lib/auth/use-sesion";

export default function PanelLayout({ children }: { children: ReactNode }) {
  const sesion = useSesion();
  const router = useRouter();

  useEffect(() => {
    if (sesion.estado !== "anonimo") return;
    // Si se llega aquí de vuelta de Google con un error, /login lo explica.
    const error = consumirErrorDeRetorno();
    if (error === "reintentar") {
      void reintentarGoogleUnaVez().then((reintentado) => {
        if (!reintentado) router.replace("/login?error=google");
      });
      return;
    }
    router.replace(error ? `/login?error=${error}` : "/login");
  }, [sesion.estado, router]);

  if (sesion.estado !== "lista") {
    return (
      <div className="flex min-h-screen items-center justify-center text-[13px] text-cardea-texto-suave" role="status">
        Comprobando la sesión…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <BarraLateral usuario={sesion.usuario} />
      <main className="flex min-w-0 flex-1 flex-col gap-3 p-4">{children}</main>
    </div>
  );
}
