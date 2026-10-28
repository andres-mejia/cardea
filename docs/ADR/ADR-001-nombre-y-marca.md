# ADR-001 · Nombre y marca: Cardea

Fecha: 2026-10-29 · Estado: aceptada, con comprobaciones pendientes

## Contexto

El producto nació como «Veedor», nombre de trabajo. El pitch de octubre de 2026 recogía dos grupos de alternativas: castellano y mitología. Andrés eligió Cardea, la diosa romana de los goznes, la que decide qué se abre y qué se cierra. Es exactamente lo que hace el producto con cada petición y cada tool call.

## Decisión

- Nombre: **Cardea**. Pronunciación aproximada en inglés: CAR-di-a. Descriptor bajo el logotipo: «Gobierno del uso de IA».
- Símbolo: **Gozne**. Una C en trazo grueso, abierta a la derecha, con un punto en su centro. La C es el nombre y el giro de la hoja; el punto es el gozne sobre el que gira. Hereda el punto de petróleo del símbolo anterior (Mirada), aguanta a 14 px y funciona en claro y en oscuro.
- Color, tipografía y estilo de interfaz se mantienen: tinta `#12263A`, petróleo `#0A6F7D` (acciones y el punto del símbolo), petróleo claro `#6CCBD3` sobre oscuro, niebla `#F3F6F8`; estados permitida `#2E7D4F`, aviso `#C7791A`, bloqueada `#B3362B`, nunca para marca. Archivo semibold en títulos y regular en texto. Tarjetas redondeadas sin borde, gráficos, píldoras; nada que parezca un CRUD ni cliché de IA.
- El símbolo definitivo se redibuja a mano a partir del boceto geométrico (`docs/pitch/build_pitch.py`, `SYMBOLS["Gozne"]`) antes de registrar nada.

## Alternativas

Seis bocetos para Cardea (Gozne, Eje, Marco, Giro, Hoja, Umbral) en el anexo del pitch. Eje pierde el punto en pequeño; Marco se confunde con un corchete; Giro lee como G; Hoja y Umbral no llevan la C.

## Consecuencias y riesgos

- **El nombre está ocupado en otros sectores.** Existen Cardea Health (Canadá), Cardea Bio (EE. UU.) y varias marcas «Cardea» registradas en la USPTO. Antes de anunciar nada hay que comprobar EUIPO y OEPM en las clases 9 y 42 y la disponibilidad de `cardea.ai` y `cardea.eu`. Si la clase 42 está tomada en la UE por software, el nombre cae y volvemos al anexo.
- La organización de GitHub y el repo ya se llaman `cardea`; cambiar de nombre más adelante cuesta un renombrado de repo y de dominios de Amplify, no más.
- El pitch, la landing y el panel usan «Cardea» desde esta decisión. «Veedor» solo sobrevive en el anexo de nombres como histórico.
