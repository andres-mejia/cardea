import type { Dict } from "./es";

/** English copy. Same shape as es.ts; written for B2B product readers, not translated word for word. */
const en: Dict = {
  lang: "en",
  ogLocale: "en_GB",
  meta: {
    home: {
      title: "Cardea · AI usage governance for the enterprise",
      description:
        "Cardea governs how your company uses AI: who uses which model, which tools agents run, what data leaves and what each team spends. Deployed in your own infrastructure.",
    },
    ogAlt: "Cardea: who uses which model, with what data, at what cost.",
    ogImage: "/img/og-en.png",
  },
  ui: {
    skip: "Skip to content",
    top: "Back to top",
    home: "Cardea, home",
    nav: "Sections",
    sections: { what: "Product", screens: "Screens", scope: "Scope", install: "Deployment" },
    signIn: "Sign in",
    signInLabel: "Sign in to the Cardea console",
    demo: "Book a demo",
    demoShort: "Demo",
    language: "Language",
    otherLanguage: { code: "ES", label: "Español", hint: "Leer esta página en español" },
    thisLanguage: { code: "EN", label: "English" },
    illustrative: "Illustrative data",
  },
  hero: {
    title: "Who uses which model, with what data, at what cost.",
    lead:
      "One control point for your applications, coding CLIs and the tools your agents call, with spend allocated to each team and a report an auditor can actually read. It runs in your infrastructure: prompts never leave your network and are never stored.",
    primary: "Book a demo",
    secondary: "Where it fits",
  },
  flow: {
    label: "How a request flows through Cardea",
    caption:
      "Every request from an application, a CLI or an MCP tool goes through Cardea, which checks identity, data, model and budget before sending it to the provider. Some go through as they are, some with personal data replaced by placeholders, and some are blocked.",
    sources: [
      { id: "api", t: "Applications", s: "via API" },
      { id: "cli", t: "Coding CLIs", s: "Claude Code, Codex, Copilot" },
      { id: "mcp", t: "MCP tools", s: "remote servers" },
    ],
    gate: { t: "Cardea", s: "Gateway and policies", checks: ["Identity", "Personal data", "Model and tool", "Budget"] },
    targets: [
      { id: "anthropic", t: "Anthropic" },
      { id: "openai", t: "OpenAI" },
      { id: "bedrock", t: "Amazon Bedrock" },
      { id: "mcp", t: "Approved MCP servers" },
    ],
    outcomes: { ok: "Allowed", redacted: "Redacted", blocked: "Blocked" },
    logTitle: "Latest decisions",
    events: [
      { src: "api", dst: "openai", team: "Claims", outcome: "ok", why: "" },
      { src: "cli", dst: "anthropic", team: "Platform", outcome: "redacted", why: "ID number and IBAN replaced" },
      { src: "mcp", dst: "mcp", team: "Data", outcome: "ok", why: "" },
      { src: "api", dst: "bedrock", team: "Customer care", outcome: "redacted", why: "2 email addresses replaced" },
      { src: "mcp", dst: "mcp", team: "Marketing", outcome: "blocked", why: "Tool not approved for this team" },
      { src: "cli", dst: "anthropic", team: "Data", outcome: "ok", why: "" },
      { src: "api", dst: "openai", team: "Risk", outcome: "blocked", why: "Monthly budget used up" },
      { src: "cli", dst: "openai", team: "Platform", outcome: "ok", why: "" },
    ],
    srcName: { api: "API", cli: "CLI", mcp: "MCP tool" },
    dstName: { anthropic: "Anthropic", openai: "OpenAI", bedrock: "Bedrock", mcp: "MCP server" },
  },
  problem: {
    title: "Three ways in, and no shared view",
    items: [
      { who: "Finance can’t answer", q: "What does each team spend, and on what?", d: "Every provider bills separately and nobody splits it by cost centre." },
      { who: "Security can’t answer", q: "What customer data has left the company, and what did an agent run on whose behalf?", d: "" },
      { who: "Engineering leadership can’t answer", q: "Who uses which tool, and which model?", d: "Each tool has its own console and none of them add up." },
    ],
  },
  what: {
    title: "One control point for APIs, CLIs and MCP tools, plus visibility into seats",
    controls: "Controls and records",
    records: "Records only",
    control: [
      { t: "Applications via API", d: "Routed through the gateway. Rules, spend limits and data redaction before anything reaches the provider." },
      { t: "Coding CLIs", d: "Claude Code, Codex and Copilot with one key per developer, issued after SSO. Traffic goes through the same gateway." },
      { t: "Remote MCP tools", d: "What agents actually run: approved servers, permissions per team and per tool, and credentials held in the gateway instead of on laptops." },
    ],
    record: { t: "Seats and web chat", d: "These can’t be routed. Cardea reads the usage metrics from each provider’s admin console so usage and cost land in the same view." },
    benefits: [
      { t: "Cost, in Finance’s language", d: "Cost centres, per-team budgets that warn and then block, and a chargeback export." },
      { t: "Personal data stays in", d: "National IDs, IBANs, email addresses and names are swapped for placeholders before they reach the provider. The original is never stored." },
      { t: "A report that states what it doesn’t cover", d: "Audit evidence per period, with coverage declared control by control." },
    ],
  },
  screens: {
    title: "Built to be read by Finance, Security and Compliance, not just Platform",
    carousel: "Console screens",
    roledescription: "carousel",
    slideRole: "screen",
    pause: "Pause the screen tour",
    play: "Play the screen tour",
    prev: "Previous screen",
    next: "Next screen",
    of: "of",
    list: "Choose a screen",
    items: [
      { id: "panel", t: "Overview", q: "How is the month going, and what needs a decision today?", d: "Spend against budget, a split by channel and a short list of what can’t wait." },
      { id: "costes", t: "Costs and chargeback", q: "What does each team spend, and on what?", d: "Spend by team, project, model or tool, with cost centres, warnings and hard limits. Exports to your ERP." },
      { id: "politicas", t: "Policies", q: "What gets checked before a request leaves?", d: "Personal data, allowed models, MCP tools and spend limits. Every rule is tested against sample text before it goes live." },
      { id: "actividad", t: "Activity and audit", q: "What happened to this request?", d: "Every request and every tool call, with its decision and its path. The original text is never stored." },
      { id: "desarrolladores", t: "Developers and keys", q: "Who uses which tool, and with which key?", d: "One key per person for all their CLIs, issued after SSO, with expiry and detection of unused keys." },
      { id: "evidencias", t: "Evidence", q: "What can I prove in an audit?", d: "A report per period that states which controls it covers, which only in part, and which not at all." },
      { id: "conexiones", t: "Connections", q: "Is every data source reporting in?", d: "Model providers, collectors and identity, with their status and anything that needs reconnecting." },
    ],
    alt: "{t} screen in the Cardea console: {d}",
  },
  scope: {
    title: "AI governance that doesn’t step on what already works",
    lead: "Cardea owns four things and relies on the tools your company already runs for everything else. We show you where that line sits in the first meeting, not in the audit.",
    core: {
      title: "What Cardea governs",
      items: [
        { t: "Policies", d: "Data, models and tools checked before a request leaves." },
        { t: "Identity", d: "One key per person, issued after your SSO." },
        { t: "Cost", d: "Spend by team and project, with chargeback to your ERP." },
        { t: "Evidence", d: "A report per period that states its coverage control by control." },
      ],
    },
    edge: {
      title: "And what it leaves to your existing tools",
      items: [
        { who: "Your MDM", t: "Local MCP servers and each CLI’s built-in tools", d: "They never touch the network, so managed device configuration keeps them in bounds." },
        { who: "Your security vendor", t: "Offensive agent security", d: "Prompt injection, poisoned tools and sandboxing. Cardea works alongside it, not instead of it." },
        { who: "Your providers and API gateway", t: "Model hosting, employee chat and API management", d: "Cardea sits in front of them to govern them, not in their place." },
        { who: "Each provider’s console", t: "Web chat outside SSO and Copilot’s inline completions", d: "Cardea collects their aggregate metrics; per-request control isn’t possible." },
      ],
    },
  },
  install: {
    title: "On your network, with your identity",
    lead:
      "The gateway and the policy engine run in your infrastructure: a Helm chart on your Kubernetes or in your AWS account. Prompts never pass through our servers. Your Entra ID or Okta issues identities, and each developer gets their own key that works across all their CLIs.",
    steps: [
      { v: "Connect", d: "your model providers, MCP servers and SSO." },
      { v: "Point", d: "your applications and CLIs at the gateway: a new URL and a new key." },
      { v: "Set", d: "budgets, data to redact, and allowed models and tools per team." },
      { v: "Allocate", d: "the cost and produce the evidence report every quarter." },
    ],
  },
  demo: {
    title: "Book a demo on your real traffic",
    lead:
      "We deploy the MVP in your account with your applications, your CLIs and your identity provider. If it can’t answer those three questions in the first month, you don’t pay.",
  },
  form: {
    name: "Name",
    email: "Work email",
    company: "Company",
    optional: "optional",
    usage: "How you use AI today",
    usageOptions: [
      { v: "api", t: "Applications via API" },
      { v: "clis", t: "Coding CLIs" },
      { v: "asientos", t: "Seats and web chat" },
      { v: "todo", t: "All three" },
    ],
    submit: "Book a demo",
    sending: "Sending…",
    note: "No marketing lists. A person replies, not a bot.",
    privacy: "We only use this to get back to you. Details in our",
    privacyLink: "privacy policy",
    errName: "Enter your name.",
    errEmailEmpty: "Enter your work email.",
    errEmail: "That email doesn’t look right. Check it has an @ and a domain.",
    errSummary: "Check the highlighted fields.",
    okTitle: "Got it.",
    ok: "We’ll reply within two working days from cardea@tekhos.com.",
    again: "Send another request",
    fail: "We couldn’t send that. Try again, or email us at cardea@tekhos.com.",
  },
  footer: {
    tagline: "AI usage governance. Deployed in your infrastructure.",
    legal: "Legal",
    links: { privacy: "Privacy", terms: "Terms", notice: "Legal notice", cookies: "Cookies" },
    owner: "© 2026 Tekhos. Cardea is a Tekhos product.",
    note: "All screens and figures on this site are illustrative. The Cardea trademark registration is pending.",
  },
  legal: {
    updated: "Last updated: 29 October 2026.",
    back: "Back to home",
    others: "Other legal pages",
    pages: {
      privacy: {
        title: "Privacy policy",
        description: "What data Tekhos processes on the Cardea website and console, why, for how long, and how to exercise your rights.",
        sections: [
          {
            h: "Controller",
            body: [
              "<p>The data controller is Tekhos, the owner of Cardea.</p><ul><li>Owner: Robinson Andrés Mejía Fernández, trading as Tekhos</li><li>Tax ID (NIF): 16831970H</li><li>Address: Paseo Rei en Jaume, 5, 46130 Valencia (Spain)</li><li>Contact for any privacy question: <a href=\"mailto:cardea@tekhos.com\">cardea@tekhos.com</a></li></ul>",
            ],
          },
          {
            h: "What data we process",
            body: [
              "<ul><li><strong>Demo request form</strong> (cardea.tekhos.com): your name, work email and, if you provide them, your company and how you use AI today. We use them only to contact you about the demo.</li><li><strong>Console sign-in</strong> (cardea-app.tekhos.com): the email address, name and account identifier you sign in with, including your Google account if you choose “Continue with Google”. We use them only to identify you and give you access to your organisation.</li><li><strong>Technical logs</strong>: date, IP address and outcome of requests, for security and troubleshooting.</li></ul>",
              "<p>Cardea does not store the content of prompts or model responses. The product records usage metadata (who, which model, how many tokens, which tool), never the content.</p>",
            ],
          },
          {
            h: "Google user data",
            body: [
              "<p>If you sign in with Google, we receive only your email address, whether it is verified, your name and your account identifier (the <code>openid</code>, <code>email</code> and <code>profile</code> scopes). We use them only to authenticate you and link your account to the user your organisation created. We don’t access any other data in your Google account, we don’t sell it, we don’t use it for advertising or to train models, and we don’t share it with third parties other than the infrastructure providers listed below. Cardea’s use of information received from Google APIs adheres to the <a href=\"https://developers.google.com/terms/api-services-user-data-policy\">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>",
            ],
          },
          {
            h: "Legal basis and retention",
            body: [
              "<p>Form data is processed with your consent and deleted automatically after 12 months. Console sign-in data is processed to provide the service your organisation has contracted, and kept while your account is active. Technical logs are kept for 30 days at most.</p>",
            ],
          },
          {
            h: "Where it is stored",
            body: [
              "<p>On Amazon Web Services in the Ireland region (eu-west-1), encrypted at rest. AWS acts as our processor. If you sign in with Google, Google acts as the identity provider under its own privacy policy.</p>",
            ],
          },
          {
            h: "Cookies",
            body: [
              "<p>This website doesn’t use cookies. The console only uses the technical storage it needs to keep you signed in. See the <a href=\"{cookies}\">cookie policy</a> for details.</p>",
            ],
          },
          {
            h: "Your rights",
            body: [
              "<p>You can ask to access, correct, erase, restrict or port your data, object to its processing, or withdraw your consent at any time by writing to <a href=\"mailto:cardea@tekhos.com\">cardea@tekhos.com</a>. You can remove Cardea’s access to your Google account at <a href=\"https://myaccount.google.com/permissions\">myaccount.google.com/permissions</a>. If you feel we haven’t handled your request properly, you can complain to the Spanish Data Protection Agency (<a href=\"https://www.aepd.es\">aepd.es</a>).</p>",
            ],
          },
        ],
      },
      terms: {
        title: "Terms and conditions",
        description: "Terms of use for Cardea, Tekhos’s AI usage governance service, during its pilot phase.",
        sections: [
          {
            h: "What Cardea is",
            body: [
              "<p>Cardea is an AI usage governance service for companies: who uses which model, with what data, which tools they run and at what cost. It is provided by Tekhos.</p><p>Owner: Robinson Andrés Mejía Fernández, trading as Tekhos. Tax ID (NIF): 16831970H. Address: Paseo Rei en Jaume, 5, 46130 Valencia (Spain). Contact: <a href=\"mailto:cardea@tekhos.com\">cardea@tekhos.com</a>.</p>",
            ],
          },
          {
            h: "Service status",
            body: [
              "<p>Cardea is under development and offered as a pilot to invited organisations, with no guarantee of availability or continuity. Figures shown on the website, in demos and in the console are illustrative unless stated otherwise.</p>",
            ],
          },
          {
            h: "Accounts and access",
            body: [
              "<ul><li>Accounts are created by each organisation’s administrator; there is no open sign-up. Signing in with Google only works if an account with that email already exists.</li><li>You are responsible for keeping your credentials, and any keys Cardea issues, safe, and for telling us if you suspect misuse.</li><li>We may suspend an account that puts the security of the service or other users at risk.</li></ul>",
            ],
          },
          {
            h: "Acceptable use",
            body: [
              "<p>You may not use Cardea for illegal activities, to try to access other organisations’ data, to get around its controls, or to overload it on purpose.</p>",
            ],
          },
          {
            h: "Data",
            body: [
              "<p>Your organisation’s data remains your organisation’s. How we process personal data is described in the <a href=\"{privacy}\">privacy policy</a>. Cardea does not store the content of prompts.</p>",
            ],
          },
          {
            h: "Liability",
            body: [
              "<p>During the pilot, the service is provided “as is”. To the extent permitted by law, Tekhos is not liable for indirect damages or loss of profits arising from its use.</p>",
            ],
          },
          {
            h: "Changes and governing law",
            body: [
              "<p>We may update these terms; we’ll announce material changes by email or in the console. These terms are governed by Spanish law.</p>",
            ],
          },
        ],
      },
      notice: {
        title: "Legal notice",
        description: "Owner of cardea.tekhos.com, website terms of use, intellectual property and governing law.",
        sections: [
          {
            h: "Website owner",
            body: [
              "<p>This website (cardea.tekhos.com) and the Cardea console (cardea-app.tekhos.com) belong to Tekhos, the owner of the Cardea product.</p><ul><li>Owner: Robinson Andrés Mejía Fernández, trading as Tekhos</li><li>Tax ID (NIF): 16831970H</li><li>Address: Paseo Rei en Jaume, 5, 46130 Valencia (Spain)</li><li>Contact: <a href=\"mailto:cardea@tekhos.com\">cardea@tekhos.com</a></li><li>Website: <a href=\"https://tekhos.com\">tekhos.com</a></li></ul>",
            ],
          },
          {
            h: "Purpose",
            body: [
              "<p>This website presents Cardea and lets you request a demo. By using it you accept this notice. Use of the console is also governed by the <a href=\"{terms}\">terms and conditions</a>.</p>",
            ],
          },
          {
            h: "Content",
            body: [
              "<p>The screens, figures, teams and examples shown on this website are illustrative and do not belong to real customers. We aim to keep product information accurate and current, but it may change without notice while Cardea is under development.</p>",
            ],
          },
          {
            h: "Intellectual and industrial property",
            body: [
              "<p>Cardea’s text, design, logo and software belong to Tekhos or are used under licence. They may not be reproduced or distributed for commercial purposes without written permission. Third-party names (Anthropic, OpenAI, Amazon Bedrock, Claude Code, Codex, Copilot, Entra ID, Okta, Google) are mentioned only to describe what Cardea integrates with, and belong to their owners.</p>",
            ],
          },
          {
            h: "Links",
            body: [
              "<p>Links to third-party websites are provided for reference. Tekhos does not control those websites and is not responsible for their content.</p>",
            ],
          },
          {
            h: "Governing law",
            body: ["<p>This notice is governed by Spanish law.</p>"],
          },
        ],
      },
      cookies: {
        title: "Cookie policy",
        description: "The Cardea website uses no cookies and loads no third-party services. The console only uses technical storage needed for your session.",
        sections: [
          {
            h: "This website uses no cookies",
            body: [
              "<p>cardea.tekhos.com sets no cookies, first-party or third-party, and uses no analytics, advertising, tracking pixels, or embedded videos or maps. Fonts and every other asset are served from our own domain. That’s why we don’t ask for consent and you won’t see a cookie banner.</p>",
              "<p>The demo form only sends data when you press the button, and only to our own service on AWS. What happens to that data is explained in the <a href=\"{privacy}\">privacy policy</a>.</p>",
            ],
          },
          {
            h: "The console only uses technical storage",
            body: [
              "<p>When you sign in to the console (cardea-app.tekhos.com), your browser keeps only what is needed to maintain your session: the Amazon Cognito sign-in tokens and a short-lived technical flag used to retry sign-in. The sign-in service (Amazon Cognito and, if you choose it, Google) uses its own technical cookies on its own domain to authenticate you.</p>",
              "<p>They are strictly necessary to provide the service you ask for, aren’t used to track you or for advertising, and are therefore exempt from consent under article 22.2 of the Spanish Information Society Services Act (LSSI). They are removed when you sign out or when they expire.</p>",
            ],
          },
          {
            h: "How to remove them",
            body: [
              "<p>You can clear cookies and site storage from your browser settings at any time. If you clear the console’s, you’ll need to sign in again.</p>",
            ],
          },
          {
            h: "Changes",
            body: [
              "<p>If we ever add non-technical cookies, we’ll say so here and ask for your consent before setting them. Questions: <a href=\"mailto:cardea@tekhos.com\">cardea@tekhos.com</a>.</p><p>Responsible party: Robinson Andrés Mejía Fernández, trading as Tekhos. Tax ID (NIF): 16831970H. Address: Paseo Rei en Jaume, 5, 46130 Valencia (Spain). Contact: <a href=\"mailto:cardea@tekhos.com\">cardea@tekhos.com</a>.</p>",
            ],
          },
        ],
      },
    },
  },
};

export default en;
