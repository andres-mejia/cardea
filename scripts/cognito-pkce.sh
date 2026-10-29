#!/usr/bin/env bash
# Prueba manual del login del panel contra Cognito (spec 001, US3): flujo authorization
# code con PKCE y comprobación del `iss` del ID token. No guarda ni imprime tokens.
#
#   scripts/cognito-pkce.sh            # lee las salidas de infra/environments/dev
#
# 1. Abre la URL que imprime e inicia sesión con un usuario de prueba.
# 2. Pega la URL completa a la que vuelve el navegador (lleva ?code=...).

set -euo pipefail

DEV="$(cd "$(dirname "$0")/../infra/environments/dev" && pwd)"
salida() { terraform -chdir="$DEV" output -raw "$1"; }

DOMINIO="$(salida cognito_hosted_ui_domain)"
CLIENTE="$(salida cognito_app_client_id)"
ISSUER="$(salida cognito_issuer)"
VUELTA="$(salida panel_url)/"

b64url() { openssl base64 -A | tr '+/' '-_' | tr -d '='; }
VERIFIER="$(openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 64)"
CHALLENGE="$(printf '%s' "$VERIFIER" | openssl dgst -sha256 -binary | b64url)"

echo "Abre en el navegador:"
echo "https://${DOMINIO}/oauth2/authorize?response_type=code&client_id=${CLIENTE}&redirect_uri=$(python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1],safe=""))' "$VUELTA")&scope=openid+email+profile&code_challenge_method=S256&code_challenge=${CHALLENGE}"
echo
read -r -p "URL de vuelta: " URL
CODE="$(python3 -c 'import sys,urllib.parse;print(urllib.parse.parse_qs(urllib.parse.urlparse(sys.argv[1]).query)["code"][0])' "$URL")"

RESPUESTA="$(curl -fsS -X POST "https://${DOMINIO}/oauth2/token" \
  -H 'content-type: application/x-www-form-urlencoded' \
  --data-urlencode grant_type=authorization_code \
  --data-urlencode "client_id=${CLIENTE}" \
  --data-urlencode "code=${CODE}" \
  --data-urlencode "redirect_uri=${VUELTA}" \
  --data-urlencode "code_verifier=${VERIFIER}")"

ISS="$(printf '%s' "$RESPUESTA" | python3 -c '
import base64, json, sys
token = json.load(sys.stdin)["id_token"].split(".")[1]
print(json.loads(base64.urlsafe_b64decode(token + "=" * (-len(token) % 4)))["iss"])')"

echo "iss del ID token: ${ISS}"
echo "issuer esperado:  ${ISSUER}"
[ "$ISS" = "$ISSUER" ] && echo "✓ coincide" || { echo "✗ no coincide"; exit 1; }
