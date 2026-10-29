# Añadir login con Google al panel (dev)

## Por qué

Entrar al panel en dev sin dar de alta cada cuenta a mano en Cognito.

## Qué cambia

- El user pool `cardea-dev` gana Google como IdP social; el cliente `cardea-app-dev` lo admite junto a `COGNITO`.
- El cliente OAuth de Google (proyecto GCP `cardea-513108`) vive en Secrets Manager como `cardea/dev/google-oauth` con `{client_id, client_secret}`. Se crea por CLI desde el JSON descargado de Google, que se guarda en `.credentials/` (ignorado); Terraform lo lee como data source.
- El rol de plan puede leer ese secreto: su valor ya está en el estado, que el rol lee.

## Límites

- Quién entra lo decide Google mientras la app OAuth esté en modo Testing (solo test users). Antes de publicarla hace falta restringir el alta federada (trigger pre sign-up o lista de dominios), que llega con la spec 002 y los tenants.
- La federación con el IdP corporativo de cada cliente sigue en la spec 002.
