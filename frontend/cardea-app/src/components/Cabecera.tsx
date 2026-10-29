import { Bell, LogIn, Plus } from "lucide-react";

// Hosted UI de Cognito (spec 001). Solo abre el login y vuelve con `code`: el canje y la
// sesión llegan con la spec 002. Sin variables (local), el botón no aparece.
function urlDeEntrada(): string | null {
  const dominio = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
  const cliente = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  const vuelta = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI;
  if (!dominio || !cliente || !vuelta) return null;
  const params = new URLSearchParams({
    response_type: "code",
    client_id: cliente,
    redirect_uri: vuelta,
    scope: "openid email profile",
  });
  return `https://${dominio}/oauth2/authorize?${params.toString()}`;
}

export function Cabecera({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  const entrar = urlDeEntrada();
  return (
    <div className="flex items-center gap-3">
      <div>
        <h1 className="text-[22px] leading-tight">{titulo}</h1>
        {subtitulo && <div className="mt-0.5 text-[12.5px] text-cardea-texto-suave">{subtitulo}</div>}
      </div>
      <div className="ml-auto hidden w-[240px] items-center gap-2 rounded-full bg-white px-4 py-2 text-[12.5px] text-cardea-texto-suave md:flex">
        Buscar o ejecutar
        <span className="ml-auto rounded-md bg-cardea-niebla px-1.5 py-0.5 text-[10px] text-cardea-texto">Ctrl K</span>
      </div>
      <button type="button" aria-label="Crear" className="grid size-9 place-items-center rounded-full bg-cardea-petroleo text-white">
        <Plus size={16} strokeWidth={2.2} />
      </button>
      <button type="button" aria-label="Avisos" className="grid size-9 place-items-center rounded-full bg-white text-cardea-tinta">
        <Bell size={15} />
      </button>
      {entrar && (
        <a
          href={entrar}
          className="flex items-center gap-1.5 rounded-full bg-cardea-tinta px-4 py-2 text-[12.5px] text-white"
        >
          <LogIn size={14} />
          Entrar
        </a>
      )}
    </div>
  );
}
