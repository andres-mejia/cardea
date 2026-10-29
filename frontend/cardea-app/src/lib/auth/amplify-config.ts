import type { ResourcesConfig } from "aws-amplify";

import { COGNITO } from "./config";

/**
 * Amplify Auth contra el pool de Cardea (portado de Jano): contraseña con USER_AUTH y
 * Google por el Hosted UI. Tras el login se vuelve a `/` y tras salir a `/login`; las
 * dos URL están en el cliente de Cognito (infra/environments/dev/identity.tf).
 */
export function configuracionAmplify(): ResourcesConfig {
  const { userPoolId, clientId, domain } = COGNITO;
  const origen = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  return {
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId: clientId,
        loginWith: {
          email: true,
          ...(domain
            ? {
                oauth: {
                  domain,
                  scopes: ["openid", "email", "profile"],
                  redirectSignIn: [`${origen}/`],
                  redirectSignOut: [`${origen}/login`],
                  responseType: "code" as const,
                },
              }
            : {}),
        },
      },
    },
  };
}
