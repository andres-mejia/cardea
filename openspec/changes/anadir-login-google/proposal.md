# Añadir login con Google al panel (dev)

## Por qué

Entrar al panel en dev sin dar de alta cada cuenta a mano en Cognito.

## Qué cambia

- El user pool `cardea-dev` gana Google como IdP social; el cliente `cardea-app-dev` lo admite junto a `COGNITO`.
- El cliente OAuth de Google (proyecto GCP `cardea-513108`) vive en Secrets Manager como `cardea/dev/google-oauth` con `{client_id, client_secret}`. Se crea por CLI desde el JSON descargado de Google, que se guarda en `.credentials/` (ignorado); Terraform lo lee como data source.
- El rol de plan puede leer ese secreto: su valor ya está en el estado, que el rol lee.
- Cognito queda como el de Jano (B2B): trigger PreSignUp que enlaza la identidad de Google con el usuario ya dado de alta con ese email o la rechaza (falla cerrado); atributos `custom:tenant_id` y `custom:role` (`owner`, `member`) que el trigger pre-token copia al ID token; el cliente escribe `name` y `email`, y un cambio de email exige verificar el nuevo; `ALLOW_USER_AUTH` con primer factor solo contraseña.

## Límites

- Google nunca crea usuarios: solo entra quien tenga alta previa con tenant y rol. La app OAuth sigue en modo Testing (solo test users de Google).
- La federación con el IdP corporativo de cada cliente sigue en la spec 002.
