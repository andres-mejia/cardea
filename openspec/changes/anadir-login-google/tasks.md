# Tareas

- [x] 0. Inventario: pool `cardea-dev` sin IdP; cliente solo `COGNITO`; dominio `cardea-dev.auth.eu-west-1.amazoncognito.com`.
- [x] 1. Cliente OAuth web en GCP con redirect `https://cardea-dev.auth.eu-west-1.amazoncognito.com/oauth2/idpresponse`.
- [x] 2. Secreto `cardea/dev/google-oauth` por CLI.
- [x] 3. IdP Google en `infra/modules/cognito` y lectura del secreto en el rol de plan.
- [x] 4. Apply local con plan y guardia; re-plan sin cambios; `/oauth2/authorize?identity_provider=Google` responde 302 a accounts.google.com con el client id.
- [ ] 5. Login real con una cuenta test user desde `cardea-app.tekhos.com` (pendiente de conectar el panel a GitHub).
