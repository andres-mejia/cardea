/** Símbolo «Gozne» (ADR-001). */
export function Isotipo({ size = 24, dark = false }: { size?: number; dark?: boolean }) {
  const ink = dark ? "#FFFFFF" : "var(--color-cardea-tinta)";
  const dot = dark ? "var(--color-cardea-petroleo-claro)" : "var(--color-cardea-petroleo)";
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} aria-hidden="true" className="block shrink-0">
      <path d="M 72 72 A 34 34 0 1 1 72 24" fill="none" stroke={ink} strokeWidth={11} />
      <circle cx="48" cy="48" r="10" fill={dot} />
    </svg>
  );
}
