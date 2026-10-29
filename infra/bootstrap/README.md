# Arranque de Terraform en CI

El rol `cardea-dev-github-actions` lo crea Terraform (`module.github_oidc`) con una política permanente mínima (ECR y Lambda). Para que `infra-apply.yml` pueda aplicar todo lo demás hace falta, una vez, la política de arranque de este directorio: `Allow *` hasta el 2027-01-31 con `Deny` de guarda. Es el patrón de Fenora.

Es un paso manual **por CLI**, nunca desde la consola, y queda fuera del estado de Terraform (excepción declarada en SC-004 de la spec 001).

## Qué impide la política

| Sid | Qué cierra |
|---|---|
| `NoDejarseSinAcceso` | Borrar el propio rol de CI, sus políticas o el proveedor OIDC. |
| `NoTocarFenora` | Cualquier acción sobre recursos con `fenora` o `fintrack` en el ARN, incluidos sus buckets y tablas de estado. |
| `NoTocarRecursosEtiquetadosDeFenora` | EC2, ELB, RDS y Auto Scaling con `Project=fenora` (sus ARN no llevan el nombre). |
| `NoBorrarEstadoDeCardea` | Borrar o desversionar el bucket de estado y la tabla de locks de Cardea. |
| `NoEngancharPoliticasDeAdministradorANadie` | Adjuntar `AdministratorAccess`, `IAMFullAccess` o `PowerUserAccess`. |
| `NoRepintarPoliticasNiUsuariosNiGrupos` | Versiones de políticas gestionadas y políticas inline de usuarios y grupos. |
| `NoCrearCredencialesDeLargaVida` | Usuarios IAM, claves de acceso, contraseñas de consola. |
| `NoOrganizacionesNiCambiosDeFacturacion` | Organizations, cierre de cuenta, métodos de pago. |

Lo que **no** puede impedir, dicho sin adornos: con `Allow *` vigente, el rol puede crear otro rol con una política inline propia equivalente a administrador, o reescribir esta misma política con `put-role-policy` y el mismo nombre. La barrera real es que todo lo que ejecuta el rol entra por PR a `main` y pasa la guardia del plan. `.github/scripts/test_politica_arranque.py` comprueba que la política no bloquea lo que Terraform necesita y que los `Deny` siguen cerrando lo que deben.

Riesgo recíproco: el rol de CI de Fenora tiene su propia política `Allow *` hasta la misma fecha y **sí** puede tocar recursos de Cardea. Eso solo se corrige en Fenora.

## Adjuntarla (una vez)

```bash
cd infra/bootstrap
aws iam put-role-policy \
  --role-name cardea-dev-github-actions \
  --policy-name arranque-ci-caduca-2027-01-31 \
  --policy-document file://politica-arranque-ci.json \
  --profile fintrack-dev
aws iam list-role-policies --role-name cardea-dev-github-actions --profile fintrack-dev
# Debe listar cardea-dev-github-actions-deploy y arranque-ci-caduca-2027-01-31.
```

## Renovarla antes de que caduque

Primero se pone la nueva, después se borra la vieja; al revés hay una ventana sin permisos.

1. Mover la fecha en `politica-arranque-ci.json` (Sid y condición) en un PR con sus tests.
2. `put-role-policy` con el nombre nuevo (`arranque-ci-caduca-<fecha>`).
3. `list-role-policies` y comprobar que están las dos.
4. `delete-role-policy` de la vieja, desde la sesión SSO de Andrés: el propio rol de CI no puede (`NoDejarseSinAcceso`).

## Sustituirla

El objetivo es retirarla: una política permanente acotada a recursos `cardea-*` con permissions boundary para los roles que cree Terraform. Hasta entonces, la fecha de caducidad obliga a revisarla.
