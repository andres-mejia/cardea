#!/usr/bin/env bash
# Cardea — bootstrap del backend de Terraform (portado de Fenora).
#
# Crea, de forma idempotente, lo que Terraform necesita antes de inicializarse:
#   - S3 `cardea-terraform-state-<account>` (versionado, cifrado, sin acceso público)
#   - DynamoDB `cardea-terraform-locks` (lock distribuido)
#
# La cuenta es compartida con Fenora: el script se niega a tocar nada cuyo
# nombre no sea de Cardea.
#
# Uso:
#     aws sso login --profile fintrack-dev
#     AWS_PROFILE=fintrack-dev infra/bootstrap.sh

set -euo pipefail

export AWS_PROFILE="${AWS_PROFILE:-fintrack-dev}"
REGION="${AWS_DEFAULT_REGION:-eu-west-1}"
TAGS='[{"Key":"Project","Value":"cardea"},{"Key":"Environment","Value":"dev"},{"Key":"ManagedBy","Value":"bootstrap"}]'

if ! command -v aws >/dev/null 2>&1; then
  echo "✗ AWS CLI no instalado." >&2
  exit 1
fi

if ! aws sts get-caller-identity >/dev/null 2>&1; then
  echo "✗ Credenciales no válidas para el perfil ${AWS_PROFILE}: aws sso login --profile ${AWS_PROFILE}" >&2
  exit 1
fi

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
BUCKET="cardea-terraform-state-${ACCOUNT_ID}"
TABLE="cardea-terraform-locks"

for nombre in "${BUCKET}" "${TABLE}"; do
  case "${nombre}" in
    cardea-*) ;;
    *) echo "✗ ${nombre} no es un nombre de Cardea; no se toca." >&2; exit 1 ;;
  esac
  case "${nombre}" in
    *fenora*|*fintrack*) echo "✗ ${nombre} parece de Fenora; no se toca." >&2; exit 1 ;;
  esac
done

echo "→ Cuenta: ${ACCOUNT_ID} · perfil: ${AWS_PROFILE} · región: ${REGION}"
echo "→ Bucket: ${BUCKET}"
echo "→ Tabla:  ${TABLE}"
echo

echo "[1/5] Bucket ${BUCKET}…"
if aws s3api head-bucket --bucket "${BUCKET}" 2>/dev/null; then
  echo "    ya existe."
else
  aws s3api create-bucket \
    --bucket "${BUCKET}" \
    --region "${REGION}" \
    --create-bucket-configuration LocationConstraint="${REGION}" >/dev/null
  echo "    creado."
fi

echo "[2/5] Versionado…"
aws s3api put-bucket-versioning \
  --bucket "${BUCKET}" \
  --versioning-configuration Status=Enabled

echo "[3/5] Cifrado y bloqueo de acceso público…"
aws s3api put-bucket-encryption \
  --bucket "${BUCKET}" \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"},"BucketKeyEnabled":true}]}'
aws s3api put-public-access-block \
  --bucket "${BUCKET}" \
  --public-access-block-configuration '{"BlockPublicAcls":true,"IgnorePublicAcls":true,"BlockPublicPolicy":true,"RestrictPublicBuckets":true}'
aws s3api put-bucket-tagging \
  --bucket "${BUCKET}" \
  --tagging "{\"TagSet\":${TAGS}}"

echo "[4/5] Tabla ${TABLE}…"
if aws dynamodb describe-table --table-name "${TABLE}" --region "${REGION}" >/dev/null 2>&1; then
  echo "    ya existe."
else
  aws dynamodb create-table \
    --table-name "${TABLE}" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --tags "${TAGS}" \
    --region "${REGION}" >/dev/null
  aws dynamodb wait table-exists --table-name "${TABLE}" --region "${REGION}"
  echo "    ACTIVE."
fi

echo "[5/5] Comprobación…"
aws s3api get-bucket-versioning --bucket "${BUCKET}" --query Status --output text
aws dynamodb describe-table --table-name "${TABLE}" --region "${REGION}" --query Table.TableStatus --output text

echo
echo "✓ Bootstrap completo. Siguiente paso:"
echo "  terraform -chdir=infra/environments/dev init -backend-config=\"bucket=${BUCKET}\""
