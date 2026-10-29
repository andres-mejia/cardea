# Inventario · fase 0 (solo lectura)

Fecha: 2026-10-29. Perfil `fintrack-dev`, región `eu-west-1` salvo donde se indica. No se ha creado ni modificado nada.

## Cuenta

```text
$ aws sts get-caller-identity --profile fintrack-dev
Account: 966378755474
Arn:     arn:aws:sts::966378755474:assumed-role/AWSReservedSSO_AdministratorAccess_204a87c3be7e512d/andres.mejia
```

## Proveedor OIDC de GitHub

```text
arn:aws:iam::966378755474:oidc-provider/token.actions.githubusercontent.com
ClientIDList: [sts.amazonaws.com]   Thumbprint: 6938fd4d98bab03faadb97b34396831e3780aea1
Tags: Project=fenora, Environment=dev, ManagedBy=terraform     → lo gestiona el estado de Fenora: data source.
```

Roles existentes relacionados: `fenora-github-actions-deploy`, `fenora-github-actions-agente-lectura`, `me-beauty-github-translate`. Ninguno `cardea-*`.

## Route 53

Zonas públicas: `teamcloud.com.co`, `me-beauty-salon.com`, `me-beauty.es`, `fenora.ai`, `tekhos.com` (`Z025408038NPHX3W382AH`), `attiresaccesorios.com`, `me-beauty-salon.es`, `milenaespinosa.com`, `docufly.io`, `tekhos.es`. **No hay zona `cardea.ai`.**

Dominios registrados en Route 53 Domains: `tekhos.com`, `tekhos.es`. `cardea.ai` resuelve a NS de Cloudflare (`jack`/`peaches.ns.cloudflare.com`, HTTPS 525); `cardea.eu`, a `a/b/c.gpk.eu`. Ninguno es de esta cuenta.

Foto de `tekhos.com` antes de Cardea (para comparar tras el apply; Amplify solo debe añadir registros `cardea` y `cardea-app` y su validación):

```text
tekhos.com.                MX     10 inbound-smtp.us-east-1.amazonaws.com
tekhos.com.                NS     ns-195.awsdns-24.com. ns-1049.awsdns-03.org. ns-694.awsdns-22.net. ns-1893.awsdns-44.co.uk.
tekhos.com.                SOA
tekhos.com.                TXT    "v=spf1 include:amazonses.com ~all"
_0c9c57a7…fa83.tekhos.com. CNAME  (validación ACM)
_dmarc.tekhos.com.         TXT    "v=DMARC1; p=none; rua=mailto:dmarc@tekhos.com; fo=1"
6 × <selector>._domainkey  CNAME  *.dkim.amazonses.com
andres.tekhos.com.         CNAME  d2g4tnxa5063z7.cloudfront.net
mail.tekhos.com.           MX     10 feedback-smtp.eu-west-1.amazonses.com
mail.tekhos.com.           TXT    "v=spf1 include:amazonses.com ~all"
```

Sin registro A en el apex (por eso Cognito no puede usar un dominio propio bajo `tekhos.com`).

## SES

`eu-west-1`: acceso de producción activo (`ProductionAccessEnabled = true`, 50 000/24 h, `HEALTHY`).

| Identidad | Tipo | Estado | Envío |
|---|---|---|---|
| `fenora.ai` | dominio | SUCCESS | sí |
| `tekhos.com` | dominio | SUCCESS (DKIM SUCCESS, MAIL FROM `mail.tekhos.com`; stack `tekhos-email-sending`) | sí |
| `me-beauty.es` | dominio | FAILED | no |
| `ramejiafernandez@gmail.com` | correo | SUCCESS | sí |
| `amilest7777@gmail.com` | correo | FAILED | no |

Recepción: un solo rule set activo por región.

- `eu-west-1`: activo `fenora-dev-rules` (regla `catch-all-fenora.ai` → `fenora-dev-inbound-mail` + `fenora-dev-email-forwarder`); inactivo `me-beauty`.
- `us-east-1`: activo `tekhos-inbound` (regla `catch-all-tekhos` para `tekhos.com` → `tekhos-inbound-mail-966378755474` + Lambda `tekhos-email-forwarder`, `FORWARD_TO = ramejiafernandez@gmail.com`; stack `tekhos-email-receiving`). Cubre `cardea@tekhos.com` sin cambios.
- `us-west-2`, `eu-central-1`: ninguno.

## Amplify

| App | Id | Plataforma | Repo | Dominios |
|---|---|---|---|---|
| `fenora-landing-dev` | `d171n9vyhzg3xb` | WEB | fintrack | `fenora.ai` (`www`) |
| `fenora-app-dev` | `d2nym42w2nuf87` | WEB_COMPUTE | fintrack | `fenora.ai` (`app`) |
| `landing-andres-mejia` | `d1hswm1m43q8p7` | WEB | landing | `tekhos.com` (`andres`) |
| `docufly-frontend` | `d2nftk9ps6bkqb` | WEB | docufly-frontend | `docufly.io` |
| `me-beauty-site` | `d88tf9s35az05` | WEB | me-beauty-site | `me-beauty-salon.com` |
| `mebeauty` | `d2v06aqx2ozl0u` | WEB | — | `me-beauty-salon.com`, `me-beauty-salon.es`, `me-beauty.es` |
| `milenaespinosa` | `d1o2h3r4ijd20k` | WEB | — | — |

Ninguna `cardea-*`. `fenora.ai` en dos apps con prefijos distintos: precedente para asociar `tekhos.com` a las dos apps de Cardea.

## Estado de Terraform (no tocar)

| Bucket | Tabla de locks | Dueño |
|---|---|---|
| `fenora-terraform-state-966378755474` | `fenora-terraform-locks` | Fenora |
| `fintrack-terraform-state-966378755474` | `fintrack-terraform-locks` | Fenora (nombre anterior) |

No existe `cardea-terraform-state-966378755474` ni `cardea-terraform-locks`.

## Resto de recursos con prefijo `cardea`

| Servicio | Resultado |
|---|---|
| S3 | ninguno |
| DynamoDB | ninguno |
| IAM roles | ninguno |
| Cognito | solo `fenora-dev` |
| ECR | ninguno |
| SQS | ninguno |
| RDS | solo `fenora-dev` (aurora-postgresql 17.9) |
| VPC | `fenora-dev-vpc` `10.0.0.0/16` y la VPC por defecto `172.31.0.0/16` |
| Etiqueta `Project=cardea` | ningún recurso |

## Origen en Fenora

Repositorio `~/py/fintrack/src/fintrack` (no `~/py/fintrack`, que es una carpeta de documentos sin git), `origin/main` @ `95484504`. El árbol local está 1529 commits por detrás: se lee siempre de `origin/main`.

| Se porta | Ruta en Fenora |
|---|---|
| Bootstrap del estado | `infra/bootstrap.sh` |
| Política de arranque de CI | `infra/bootstrap/{README.md,politica-arranque-ci.json}` |
| Módulos | `infra/modules/{github-oidc,vpc,nat-instance,bastion,aurora,cognito,ecr,messaging,assets,email}/main.tf` |
| SG de Lambdas | `infra/environments/dev/main.tf` (`aws_security_group.lambdas_vpc`) |
| Guardia | `.github/scripts/guardia_plan.py`, `test_guardia_plan.py`, `test_politica_arranque.py` |
| Workflows | `.github/workflows/{infra-formato,infra-plan,infra-apply}.yml` |
| Lock de proveedores | `infra/environments/dev/.terraform.lock.hcl` (Fenora lo versiona) |

Hallazgo que cambia la spec: Fenora tiene Aurora privada desde `18e7e2cd` (2026-05-01) y Lambdas en VPC con JDBC desde #34; ver ADR-004 (pendiente) y la aclaración 5 de la spec.

## Bootstrap (T011)

```text
$ AWS_PROFILE=fintrack-dev infra/bootstrap.sh
→ Cuenta: 966378755474 · perfil: fintrack-dev · región: eu-west-1
→ Bucket: cardea-terraform-state-966378755474
→ Tabla:  cardea-terraform-locks
[1/5] Bucket cardea-terraform-state-966378755474…
    creado.
[4/5] Tabla cardea-terraform-locks…
    ACTIVE.
[5/5] Comprobación…
Enabled
ACTIVE
$ AWS_PROFILE=fintrack-dev infra/bootstrap.sh     # segunda vez
[4/5] Tabla cardea-terraform-locks…
    ya existe.
[5/5] Comprobación…
Enabled
ACTIVE
```

## Apply inicial (T045–T046)

- Plan: `95 to add, 0 to change, 0 to destroy`; guardia en verde; ningún `aws_iam_openid_connect_provider` como recurso; ningún atributo con `fenora`/`fintrack`; asociaciones de Amplify solo con `cardea` y `cardea-app`.
- `Apply complete! Resources: 95 added, 0 changed, 0 destroyed.`
- Primer plan posterior: cambio fantasma en `rds.force_ssl` (`apply_method`); corregido declarando `pending-reboot`.
- Conexión Amplify–GitHub con el token de `gh` (OAuth, scopes `repo, workflow, read:org, gist`): `CreateApp` → `BadRequestException: There was an issue setting up your repository`. Las apps se recrearon sin repositorio (6 recursos, destrucción autorizada a mano con `PERMITIR_DESTRUCCION` sobre las direcciones exactas de Amplify) y la landing se publica por despliegue manual (`.github/workflows/landing-deploy.yml`).
- Idempotencia: `terraform plan -detailed-exitcode` → exit 0.

## Validación (T049)

| Comprobación | Resultado |
|---|---|
| Despliegue manual de la landing | job `SUCCEED`; `https://main.d27g2lwow3wmgb.amplifyapp.com` → 200 |
| DNS | `cardea.tekhos.com CNAME d2lhlq7feq1av3.cloudfront.net`, `cardea-app.tekhos.com CNAME d3rj86kt223pwd.cloudfront.net`; ningún otro registro de la zona cambiado |
| Formulario válido | `{"ok":true} 200`; ítem en `cardea-contact-dev` (borrado tras la prueba) |
| Formulario inválido | `{"error":"Faltan datos"} 400`; la tabla solo tenía el ítem válido |
| Correo | objeto nuevo en `tekhos-inbound-mail-966378755474` a las 00:28 UTC y `forwarded` en `tekhos-email-forwarder` |
| Aurora aislada | `publicly_accessible = false`; 5432 desde internet: timeout; el DNS resuelve a `10.20.12.189` |
| Bastión | `i-0f7e37e518ce662fd` `Online` en SSM desde subred privada (sale por la NAT) |
| `psql` por el bastión | `PostgreSQL 17.9 on aarch64…`, `ssl = on`, `cardea_dev`; el primer intento agotó el tiempo mientras el clúster salía de la pausa |
| Rol de plan | `s3:PutObject` explicitDeny; `s3:GetObject` del estado allowed; `dynamodb:PutItem` en locks allowed; `GetItem/Scan` en `cardea-contact-dev` explicitDeny; `secretsmanager:GetSecretValue` explicitDeny; `ec2:CreateVpc` implicitDeny |
| Rol de apply (con `aws:CurrentTime`) | `rds:CreateDBCluster` cardea allowed; `rds:DeleteDBCluster` fenora-dev explicitDeny; `iam:PutRolePolicy` fenora-github-actions-deploy explicitDeny; `s3:DeleteBucket` estado de Cardea explicitDeny; tras 2027-01-31 implicitDeny |
| Access Analyzer | solo los avisos esperados de `Allow *` (`PassRole`, `CreateServiceLinkedRole`) y el de claves de etiqueta no soportadas por algunas acciones |

## Inventario por etiqueta (T052, SC-004)

109 recursos en el estado, 57 ARN con `Project=cardea`. Los que no casan por ARN con un atributo del estado:

| ARN | Explicación |
|---|---|
| `cardea-terraform-state-966378755474`, `cardea-terraform-locks` | bootstrap (`ManagedBy=bootstrap`), declarados |
| `subnet-02ad587f78df64d03`, `subnet-0e26fa8e487f2bfd4` | ya no existen (`InvalidSubnetID.NotFound`): caché eventual de la API de etiquetas |
| `vol-0338a9b9de90c5a2a`, `vol-0e5ffcf0978c2d89a` | discos raíz de la NAT y del bastión (parte de su `aws_instance`) |
| `cluster:cluster-pgzvuct32qway6s5bhjyqqihku` | el clúster `cardea-dev` por su resource id |
| `secret:rds!cluster-…` | secreto de la contraseña maestra, gestionado por RDS (`manage_master_user_password`) |

Ningún recurso de Cardea creado fuera de Terraform salvo lo declarado. La política de arranque (`arranque-ci-caduca-2027-01-31`) se adjuntó por CLI.
