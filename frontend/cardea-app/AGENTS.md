# Panel (app.cardea.ai)

- Next.js 16 con App Router, React 19, Tailwind 4 con los tokens de `src/app/globals.css`. Solo tokens `cardea-*`; los de estado, solo para estados.
- La navegación es la del pitch (`src/lib/navegacion.ts`): Visión, Control, Cumplimiento. Una ruta por pantalla.
- Tarjetas redondeadas sin borde, píldoras, gráficos en SVG propio; nada que parezca un CRUD. Cada pantalla se compara con su maqueta del pitch antes de cerrarse (gate visual).
- Datos: hasta que exista el control plane, cada pantalla usa datos ilustrativos marcados como tales, nunca cifras que parezcan reales sin etiqueta.
- Autenticación: Amplify Auth contra Cognito (`.env.example`); sin variables, arranca con un usuario de demostración.
