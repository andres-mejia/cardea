"use client";

import { useState } from "react";

import { Avatar } from "./graficos";

/** Foto de Google del usuario; si no hay o no carga, el avatar genérico del pitch. */
export function FotoUsuario({ foto, nombre, size }: { foto?: string; nombre?: string; size: number }) {
  const [fallo, setFallo] = useState(false);
  if (!foto || fallo) return <Avatar nombre={nombre ?? ""} size={size} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- URL externa de Google, sin optimizar.
    <img
      src={foto}
      alt={nombre ? `Foto de ${nombre}` : ""}
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      onError={() => setFallo(true)}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flex: "none", display: "block" }}
    />
  );
}
