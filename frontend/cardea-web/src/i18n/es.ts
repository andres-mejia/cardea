/**
 * Textos de la landing en castellano. El inglés (en.ts) tiene la misma forma: los componentes solo
 * leen de aquí. Todas las cifras y capturas que aparecen son ilustrativas y van marcadas.
 */
const es = {
  lang: "es",
  ogLocale: "es_ES",
  meta: {
    home: {
      title: "Cardea · Gobierno del uso de IA en la empresa",
      description:
        "Cardea gobierna el uso de IA en tu empresa: quién usa qué modelo, qué tools ejecuta, qué datos salen y cuánto cuesta por equipo. Instalado en tu infraestructura.",
    },
    ogAlt: "Cardea: quién usa qué modelo, con qué datos y a qué coste.",
    ogImage: "/img/og-es.png",
  },
  ui: {
    skip: "Saltar al contenido",
    home: "Cardea, inicio",
    nav: "Secciones",
    sections: { what: "Qué hace", screens: "Pantallas", scope: "Alcance", install: "Instalación" },
    signIn: "Entrar",
    signInLabel: "Entrar al panel de Cardea",
    demo: "Pedir una demo",
    demoShort: "Demo",
    language: "Idioma",
    otherLanguage: { code: "EN", label: "English", hint: "Read this page in English" },
    thisLanguage: { code: "ES", label: "Español" },
    illustrative: "Datos ilustrativos",
  },
  hero: {
    title: "Quién usa qué modelo, con qué datos y a qué coste.",
    lead:
      "Un punto de control para las aplicaciones, los CLIs de código y las tools que ejecutan los agentes, con el coste repartido por equipo y un informe que un auditor puede leer. Instalado en tu infraestructura: los prompts no salen de tu red y no se almacenan.",
    primary: "Pedir una demo",
    secondary: "Qué cubre y qué no",
  },
  flow: {
    label: "Cómo pasa una petición por Cardea",
    caption:
      "Cada petición de una aplicación, un CLI o una tool MCP pasa por Cardea, que comprueba identidad, datos, modelo y presupuesto antes de enviarla al proveedor. Unas salen tal cual, otras con los datos personales sustituidos por marcadores y otras se bloquean.",
    sources: [
      { id: "api", t: "Aplicaciones", s: "por API" },
      { id: "cli", t: "CLIs de código", s: "Claude Code, Codex, Copilot" },
      { id: "mcp", t: "Tools MCP", s: "remotas" },
    ],
    gate: { t: "Cardea", s: "Gateway y políticas", checks: ["Identidad", "Datos personales", "Modelo y tool", "Presupuesto"] },
    targets: [
      { id: "anthropic", t: "Anthropic" },
      { id: "openai", t: "OpenAI" },
      { id: "bedrock", t: "Amazon Bedrock" },
      { id: "mcp", t: "Servidores MCP aprobados" },
    ],
    outcomes: { ok: "Permitida", redacted: "Redactada", blocked: "Bloqueada" },
    logTitle: "Últimas decisiones",
    // Ejemplos de decisiones para el registro animado. Equipos y motivos son ilustrativos.
    events: [
      { src: "api", dst: "openai", team: "Siniestros", outcome: "ok", why: "" },
      { src: "cli", dst: "anthropic", team: "Plataforma", outcome: "redacted", why: "DNI e IBAN sustituidos" },
      { src: "mcp", dst: "mcp", team: "Datos", outcome: "ok", why: "" },
      { src: "api", dst: "bedrock", team: "Atención al cliente", outcome: "redacted", why: "2 correos sustituidos" },
      { src: "mcp", dst: "mcp", team: "Marketing", outcome: "blocked", why: "Tool no aprobada para el equipo" },
      { src: "cli", dst: "anthropic", team: "Datos", outcome: "ok", why: "" },
      { src: "api", dst: "openai", team: "Riesgos", outcome: "blocked", why: "Presupuesto del mes agotado" },
      { src: "cli", dst: "openai", team: "Plataforma", outcome: "ok", why: "" },
    ],
    srcName: { api: "API", cli: "CLI", mcp: "Tool MCP" },
    dstName: { anthropic: "Anthropic", openai: "OpenAI", bedrock: "Bedrock", mcp: "Servidor MCP" },
  },
  problem: {
    title: "Tres canales de uso y ninguna vista común",
    items: [
      { who: "Finanzas no puede responder", q: "¿Cuánto gasta cada equipo y en qué?", d: "Cada proveedor factura aparte y nadie lo reparte por centro de coste." },
      { who: "Seguridad no puede responder", q: "¿Qué datos de clientes han salido, y qué ha ejecutado un agente en nombre de quién?", d: "" },
      { who: "Dirección técnica no puede responder", q: "¿Quién usa qué herramienta y qué modelo?", d: "Hay una consola distinta por herramienta y ninguna las suma." },
    ],
  },
  what: {
    title: "Un punto de control para API, CLIs y tools MCP, y visibilidad sobre los asientos",
    controls: "Controla y registra",
    records: "Solo registra",
    control: [
      { t: "Aplicaciones por API", d: "Pasan por el gateway. Reglas, límites de gasto y redacción de datos antes de llegar al proveedor." },
      { t: "CLIs de código", d: "Claude Code, Codex y Copilot con una clave por desarrollador emitida tras el SSO. El tráfico pasa por el mismo gateway." },
      { t: "Tools MCP remotas", d: "Lo que ejecutan los agentes: servidores aprobados, permiso por equipo y por tool, credenciales guardadas en el gateway y no en el portátil." },
    ],
    record: { t: "Asientos y chat web", d: "No se pueden enrutar. Se leen las métricas de las consolas de cada proveedor para sumar uso y coste a la misma vista." },
    benefits: [
      { t: "El coste, en el idioma de Finanzas", d: "Centro de coste, presupuesto por equipo con aviso y bloqueo, y una exportación de chargeback." },
      { t: "Los datos personales no salen", d: "DNI, IBAN, correos y nombres se sustituyen por marcadores antes de llegar al proveedor. El original no se guarda." },
      { t: "Un informe que dice lo que no cubre", d: "Evidencias por periodo para auditoría, con la cobertura declarada control por control." },
    ],
  },
  screens: {
    title: "Hecho para que lo lean Finanzas, Seguridad y Cumplimiento, no solo Plataforma",
    carousel: "Pantallas del panel",
    roledescription: "carrusel",
    slideRole: "pantalla",
    pause: "Pausar el pase de pantallas",
    play: "Reproducir el pase de pantallas",
    prev: "Pantalla anterior",
    next: "Pantalla siguiente",
    of: "de",
    list: "Elegir pantalla",
    items: [
      { id: "panel", t: "Panel general", q: "¿Cómo va el mes y qué necesita una decisión hoy?", d: "Gasto frente a presupuesto, reparto por canal y una lista corta de lo que no puede esperar." },
      { id: "costes", t: "Costes y chargeback", q: "¿Cuánto gasta cada equipo, y en qué?", d: "Gasto por equipo, proyecto, modelo o herramienta, con centro de coste, aviso y bloqueo. Exportable a tu ERP." },
      { id: "politicas", t: "Políticas", q: "¿Qué se comprueba antes de que una petición salga?", d: "Datos personales, modelos permitidos, tools MCP y límites de gasto. Cada regla se prueba con un texto antes de activarse." },
      { id: "actividad", t: "Actividad y auditoría", q: "¿Qué ha pasado con esta petición?", d: "Cada petición y cada tool call con su decisión y su recorrido. El texto original no se almacena." },
      { id: "desarrolladores", t: "Desarrolladores y claves", q: "¿Quién usa qué herramienta, y con qué clave?", d: "Una clave por persona para todos sus CLIs, emitida tras el SSO, con caducidad y detección de claves sin uso." },
      { id: "evidencias", t: "Evidencias", q: "¿Qué puedo demostrar ante una auditoría?", d: "Un informe por periodo que declara qué controles cubre, cuáles en parte y cuáles no." },
      { id: "conexiones", t: "Conexiones", q: "¿Está llegando cada dato?", d: "Proveedores de modelos, collectors e identidad, con su estado y lo que hay que reconectar." },
    ],
    alt: "Pantalla de {t} del panel de Cardea: {d}",
  },
  scope: {
    title: "Lo que Cardea no cubre, dicho antes de que lo preguntes",
    lead: "Preferimos que lo sepas en la primera reunión y no en la auditoría.",
    items: [
      { t: "Chat web fuera del SSO corporativo y control de las completions inline de Copilot", d: "Solo métricas agregadas." },
      { t: "Servidores MCP locales y tools internas de cada CLI", d: "No pasan por ningún gateway; se limitan con configuración gestionada en el puesto." },
      { t: "Seguridad ofensiva de agentes", d: "Inyección de prompts, tools envenenadas, sandbox. Para eso hay fabricantes de seguridad." },
      { t: "Alojamiento de modelos, workspace de chat para empleados y gestión de APIs", d: "Cardea es solo gobierno." },
    ],
  },
  install: {
    title: "En tu red, con tu identidad",
    lead:
      "El gateway y el motor de políticas corren en tu infraestructura: un chart de Helm en tu Kubernetes o en tu cuenta de AWS. Los prompts no pasan por servidores nuestros. Tu Entra ID u Okta emite las identidades; cada desarrollador recibe una clave propia válida para todos sus CLIs.",
    steps: [
      { v: "Conecta", d: "proveedores de modelos, servidores MCP y tu SSO." },
      { v: "Apunta", d: "las aplicaciones y los CLIs al gateway; un cambio de URL y de clave." },
      { v: "Define", d: "presupuestos, datos a redactar, modelos y tools permitidos por equipo." },
      { v: "Reparte", d: "el coste y genera el informe de evidencias cada trimestre." },
    ],
  },
  demo: {
    title: "Pide una demo con tu tráfico real",
    lead:
      "Desplegamos el MVP en tu cuenta con tus aplicaciones, tus CLIs y tu proveedor de identidad. Si no responde las tres preguntas en el primer mes, no se factura.",
  },
  form: {
    name: "Nombre",
    email: "Correo de empresa",
    company: "Empresa",
    optional: "opcional",
    usage: "Cómo usáis la IA hoy",
    usageOptions: [
      { v: "api", t: "Aplicaciones por API" },
      { v: "clis", t: "CLIs de código" },
      { v: "asientos", t: "Asientos y chat web" },
      { v: "todo", t: "Las tres cosas" },
    ],
    submit: "Pedir una demo",
    sending: "Enviando…",
    note: "Sin listas de marketing. Te escribimos nosotros, no un bot.",
    privacy: "Usamos estos datos solo para contestarte. Detalles en la",
    privacyLink: "política de privacidad",
    errName: "Escribe tu nombre.",
    errEmailEmpty: "Escribe tu correo de empresa.",
    errEmail: "Este correo no parece válido. Revisa que tenga @ y dominio.",
    errSummary: "Revisa los campos marcados.",
    okTitle: "Recibido.",
    ok: "Te contestamos en dos días laborables desde cardea@tekhos.com.",
    again: "Enviar otra solicitud",
    fail: "No se ha podido enviar. Vuelve a intentarlo o escríbenos a cardea@tekhos.com.",
  },
  footer: {
    tagline: "Gobierno del uso de IA. Instalado en tu infraestructura.",
    legal: "Legal",
    links: { privacy: "Privacidad", terms: "Términos", notice: "Aviso legal", cookies: "Cookies" },
    owner: "© 2026 Tekhos. Cardea es un producto de Tekhos.",
    note: "Las pantallas y cifras de esta web son ilustrativas. Cardea es una marca en proceso de registro.",
  },
  legal: {
    updated: "Última actualización: 29 de octubre de 2026.",
    back: "Volver al inicio",
    others: "Otros textos legales",
    pages: {
      privacy: {
        title: "Política de privacidad",
        description: "Qué datos trata Tekhos en la web y el panel de Cardea, para qué, durante cuánto tiempo y cómo ejercer tus derechos.",
        sections: [
          {
            h: "Responsable",
            body: [
              "<p>El responsable del tratamiento es Tekhos, titular de Cardea.</p><ul><li>Titular: Robinson Andrés Mejía Fernández, que opera con el nombre comercial Tekhos</li><li>NIF: 16831970H</li><li>Domicilio: Paseo Rei en Jaume, 5, 46130 Valencia (España)</li><li>Contacto para cualquier cuestión de privacidad: <a href=\"mailto:cardea@tekhos.com\">cardea@tekhos.com</a></li></ul>",
            ],
          },
          {
            h: "Qué datos tratamos",
            body: [
              "<ul><li><strong>Formulario de demo</strong> (cardea.tekhos.com): nombre, correo de empresa y, si los indicas, empresa y cómo usáis la IA hoy. Sirven solo para contactar contigo sobre la demo.</li><li><strong>Inicio de sesión en el panel</strong> (cardea-app.tekhos.com): correo, nombre e identificador de la cuenta con la que entras, incluida tu cuenta de Google si eliges «Continuar con Google». Sirven solo para identificarte y darte acceso a la organización a la que perteneces.</li><li><strong>Registros técnicos</strong>: fecha, IP y resultado de las peticiones, para seguridad y diagnóstico.</li></ul>",
              "<p>Cardea no almacena el contenido de los prompts ni las respuestas de los modelos: el producto registra metadatos de uso (quién, qué modelo, cuántos tokens, qué tool), nunca el contenido.</p>",
            ],
          },
          {
            h: "Datos de Google",
            body: [
              "<p>Si entras con Google, recibimos únicamente tu dirección de correo, si está verificada, tu nombre y el identificador de tu cuenta (permisos <code>openid</code>, <code>email</code> y <code>profile</code>). Los usamos solo para autenticarte y enlazar tu cuenta con el usuario que tu organización dio de alta. No accedemos a otros datos de tu cuenta de Google, no los vendemos, no los usamos para publicidad ni para entrenar modelos, y no los compartimos con terceros salvo los proveedores de infraestructura indicados abajo. El uso de la información recibida de las API de Google cumple la <a href=\"https://developers.google.com/terms/api-services-user-data-policy\">Google API Services User Data Policy</a>, incluidos los requisitos de uso limitado.</p>",
            ],
          },
          {
            h: "Base legal y conservación",
            body: [
              "<p>El formulario se trata con tu consentimiento y sus datos se borran automáticamente a los 12 meses. Los datos de acceso al panel se tratan para ejecutar el servicio que tu organización contrata y se conservan mientras tu cuenta esté activa. Los registros técnicos se conservan un máximo de 30 días.</p>",
            ],
          },
          {
            h: "Dónde se guardan",
            body: [
              "<p>En Amazon Web Services, región de Irlanda (eu-west-1), cifrados en reposo. AWS actúa como encargado del tratamiento. Si entras con Google, Google actúa como proveedor de identidad conforme a su propia política de privacidad.</p>",
            ],
          },
          {
            h: "Cookies",
            body: [
              "<p>Esta web no usa cookies. El panel usa solo el almacenamiento técnico necesario para mantener tu sesión. Los detalles están en la <a href=\"{cookies}\">política de cookies</a>.</p>",
            ],
          },
          {
            h: "Tus derechos",
            body: [
              "<p>Puedes pedir acceso, rectificación, supresión, oposición, limitación o portabilidad de tus datos, y retirar tu consentimiento en cualquier momento, escribiendo a <a href=\"mailto:cardea@tekhos.com\">cardea@tekhos.com</a>. Puedes retirar el acceso de Cardea a tu cuenta de Google en <a href=\"https://myaccount.google.com/permissions\">myaccount.google.com/permissions</a>. Si crees que no hemos atendido bien tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos (<a href=\"https://www.aepd.es\">aepd.es</a>).</p>",
            ],
          },
        ],
      },
      terms: {
        title: "Términos y condiciones",
        description: "Condiciones de uso de Cardea, el servicio de gobierno del uso de IA de Tekhos, durante su fase piloto.",
        sections: [
          {
            h: "Qué es Cardea",
            body: [
              "<p>Cardea es un servicio de gobierno del uso de IA en empresas: quién usa qué modelo, con qué datos, qué tools ejecuta y a qué coste. Lo presta Tekhos.</p><p>Titular: Robinson Andrés Mejía Fernández, que opera con el nombre comercial Tekhos. NIF: 16831970H. Domicilio: Paseo Rei en Jaume, 5, 46130 Valencia (España). Contacto: <a href=\"mailto:cardea@tekhos.com\">cardea@tekhos.com</a>.</p>",
            ],
          },
          {
            h: "Estado del servicio",
            body: [
              "<p>Cardea está en fase de desarrollo y se ofrece en modo piloto a organizaciones invitadas, sin garantía de disponibilidad ni de continuidad. Las cifras que aparecen en la web, las demos y el panel son ilustrativas salvo que se indique lo contrario.</p>",
            ],
          },
          {
            h: "Cuentas y acceso",
            body: [
              "<ul><li>Las cuentas las da de alta el administrador de cada organización; no hay registro abierto. Entrar con Google solo funciona si ya existe una cuenta con ese correo.</li><li>Eres responsable de custodiar tus credenciales y las claves que emita Cardea, y de avisarnos si sospechas un uso indebido.</li><li>Podemos suspender una cuenta que ponga en riesgo la seguridad del servicio o de otros usuarios.</li></ul>",
            ],
          },
          {
            h: "Uso aceptable",
            body: [
              "<p>No puedes usar Cardea para actividades ilegales, para intentar acceder a datos de otras organizaciones, para eludir sus controles ni para sobrecargarlo deliberadamente.</p>",
            ],
          },
          {
            h: "Datos",
            body: [
              "<p>Los datos de tu organización siguen siendo suyos. El tratamiento de datos personales se describe en la <a href=\"{privacy}\">política de privacidad</a>. Cardea no almacena el contenido de los prompts.</p>",
            ],
          },
          {
            h: "Responsabilidad",
            body: [
              "<p>En la fase piloto, el servicio se presta «tal cual». En la medida permitida por la ley, Tekhos no responde de daños indirectos ni de la pérdida de beneficios derivados de su uso.</p>",
            ],
          },
          {
            h: "Cambios y ley aplicable",
            body: [
              "<p>Podemos actualizar estos términos; los cambios relevantes se avisarán por correo o en el panel. Se rigen por la ley española.</p>",
            ],
          },
        ],
      },
      notice: {
        title: "Aviso legal",
        description: "Titular de cardea.tekhos.com, condiciones de uso de la web, propiedad intelectual y ley aplicable.",
        sections: [
          {
            h: "Titular de la web",
            body: [
              "<p>Esta web (cardea.tekhos.com) y el panel de Cardea (cardea-app.tekhos.com) son de Tekhos, titular del producto Cardea.</p><ul><li>Titular: Robinson Andrés Mejía Fernández, que opera con el nombre comercial Tekhos</li><li>NIF: 16831970H</li><li>Domicilio: Paseo Rei en Jaume, 5, 46130 Valencia (España)</li><li>Contacto: <a href=\"mailto:cardea@tekhos.com\">cardea@tekhos.com</a></li><li>Web: <a href=\"https://tekhos.com\">tekhos.com</a></li></ul>",
            ],
          },
          {
            h: "Objeto",
            body: [
              "<p>La web presenta Cardea y permite pedir una demo. Usarla implica aceptar este aviso. El uso del panel se rige además por los <a href=\"{terms}\">términos y condiciones</a>.</p>",
            ],
          },
          {
            h: "Contenidos",
            body: [
              "<p>Las pantallas, cifras, equipos y ejemplos que aparecen en la web son ilustrativos y no corresponden a clientes reales. Procuramos que la información sobre el producto sea exacta y esté al día, pero puede cambiar sin previo aviso mientras Cardea esté en desarrollo.</p>",
            ],
          },
          {
            h: "Propiedad intelectual e industrial",
            body: [
              "<p>Los textos, el diseño, el logotipo y el software de Cardea son de Tekhos o se usan con licencia. No se permite reproducirlos ni distribuirlos con fines comerciales sin autorización escrita. Los nombres de terceros (Anthropic, OpenAI, Amazon Bedrock, Claude Code, Codex, Copilot, Entra ID, Okta, Google) se citan solo para describir con qué se integra Cardea y pertenecen a sus titulares.</p>",
            ],
          },
          {
            h: "Enlaces",
            body: [
              "<p>Los enlaces a webs de terceros se ofrecen como referencia. Tekhos no controla esas webs ni responde de su contenido.</p>",
            ],
          },
          {
            h: "Ley aplicable",
            body: ["<p>Este aviso se rige por la ley española.</p>"],
          },
        ],
      },
      cookies: {
        title: "Política de cookies",
        description: "La web de Cardea no usa cookies ni carga servicios de terceros. El panel usa solo almacenamiento técnico necesario para la sesión.",
        sections: [
          {
            h: "Esta web no usa cookies",
            body: [
              "<p>cardea.tekhos.com no instala cookies, ni propias ni de terceros, y no usa analítica, publicidad, píxeles de seguimiento ni vídeos o mapas incrustados. La tipografía y todos los recursos se sirven desde el propio dominio. Por eso no te pedimos consentimiento ni verás un aviso de cookies.</p>",
              "<p>El formulario de demo solo envía datos cuando pulsas el botón, y únicamente a nuestro propio servicio en AWS. Lo que pasa con esos datos está en la <a href=\"{privacy}\">política de privacidad</a>.</p>",
            ],
          },
          {
            h: "El panel usa solo almacenamiento técnico",
            body: [
              "<p>Cuando entras al panel (cardea-app.tekhos.com) se guarda en tu navegador lo imprescindible para mantener la sesión: los tokens de inicio de sesión de Amazon Cognito y una marca técnica temporal para reintentar el acceso. El servicio de inicio de sesión (Amazon Cognito y, si lo eliges, Google) usa sus propias cookies técnicas en su dominio para autenticarte.</p>",
              "<p>Son estrictamente necesarias para prestar el servicio que pides, no sirven para seguirte ni para publicidad y, por eso, están exentas de consentimiento según el artículo 22.2 de la LSSI. Se borran al cerrar la sesión o cuando caducan.</p>",
            ],
          },
          {
            h: "Cómo borrarlas",
            body: [
              "<p>Puedes borrar las cookies y el almacenamiento del sitio desde la configuración de tu navegador en cualquier momento. Si borras los del panel, tendrás que volver a entrar.</p>",
            ],
          },
          {
            h: "Cambios",
            body: [
              "<p>Si algún día añadimos cookies que no sean técnicas, lo diremos aquí y te pediremos consentimiento antes de instalarlas. Dudas: <a href=\"mailto:cardea@tekhos.com\">cardea@tekhos.com</a>.</p><p>Responsable: Robinson Andrés Mejía Fernández, que opera con el nombre comercial Tekhos. NIF: 16831970H. Domicilio: Paseo Rei en Jaume, 5, 46130 Valencia (España). Contacto: <a href=\"mailto:cardea@tekhos.com\">cardea@tekhos.com</a>.</p>",
            ],
          },
        ],
      },
    },
  },
};

export default es;
export type Dict = typeof es;
