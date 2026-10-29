/**
 * Cognito del panel. Las variables las pone Terraform en la app de Amplify
 * (infra/environments/dev/main.tf). Sin ellas (local) el panel entra en modo de
 * ejemplo con un usuario ficticio.
 */
export const COGNITO = {
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "",
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "",
  domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? "",
};

export function esModoEjemplo(): boolean {
  return !COGNITO.userPoolId || !COGNITO.clientId;
}
