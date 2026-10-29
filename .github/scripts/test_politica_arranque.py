"""Tests de `infra/bootstrap/politica-arranque-ci.json` (portados de Fenora).

Una política que se adjunta una vez por CLI y nadie vuelve a mirar tiene dos formas de
estar mal que no saltan solas: un `Deny` que bloquea algo que Terraform necesita (el apply
revienta a mitad) y un `Deny` vaciado por su `Resource` (sigue en la lista, ya no protege).
Más una propia de Cardea: la cuenta es compartida y no se puede tocar nada de Fenora.
"""

import datetime as dt
import fnmatch
import json
import os
import unittest

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
POLITICA = os.path.join(RAIZ, "infra", "bootstrap", "politica-arranque-ci.json")
CUENTA = "966378755474"
ROL_CI = f"arn:aws:iam::{CUENTA}:role/cardea-dev-github-actions"
OIDC = f"arn:aws:iam::{CUENTA}:oidc-provider/token.actions.githubusercontent.com"


def carga():
    with open(POLITICA, encoding="utf-8") as f:
        return json.load(f)


def _lista(valor):
    return [valor] if isinstance(valor, str) else list(valor)


def bloque(sid):
    return next(s for s in carga()["Statement"] if s["Sid"] == sid)


def denegada(accion, recurso="*", etiquetas=None):
    """¿`accion` sobre `recurso` cae bajo algún Deny? Comodines con la semántica de IAM."""
    etiquetas = etiquetas or {}
    accion = accion.lower()
    for s in carga()["Statement"]:
        if s["Effect"] != "Deny":
            continue
        if not any(fnmatch.fnmatchcase(accion, p.lower()) for p in _lista(s["Action"])):
            continue
        if not any(r == "*" or fnmatch.fnmatchcase(recurso, r) for r in _lista(s["Resource"])):
            continue
        condicion = s.get("Condition", {}).get("StringEquals", {})
        if any(k.startswith("aws:ResourceTag/") and etiquetas.get(k.split("/", 1)[1]) != v for k, v in condicion.items()):
            continue
        if "ArnEquals" in s.get("Condition", {}):
            continue
        return True
    return False


class EsUnaPoliticaValida(unittest.TestCase):
    def test_json_y_sids_validos(self):
        for s in carga()["Statement"]:
            self.assertTrue(s["Sid"].isalnum(), s["Sid"])

    def test_los_arn_no_llevan_comodin_en_el_servicio(self):
        # IAM rechaza `arn:aws:*:...` y los ARN de IAM con región (MalformedPolicyDocument).
        for s in carga()["Statement"]:
            for r in _lista(s["Resource"]):
                if r == "*":
                    continue
                with self.subTest(recurso=r):
                    self.assertNotEqual(r.split(":")[2], "*")
                    if r.split(":")[2] == "iam":
                        self.assertEqual(r.split(":")[3], "")

    def test_cabe_en_una_politica_inline(self):
        tamano = len(json.dumps(carga(), separators=(",", ":")))
        self.assertLess(tamano, 10240)


class CaducaSola(unittest.TestCase):
    def test_el_allow_caduca_en_fecha_iso_utc(self):
        allow = bloque("AdministradorHastaEl31DeEneroDe2027")
        fecha = allow["Condition"]["DateLessThan"]["aws:CurrentTime"]
        self.assertTrue(fecha.endswith("Z"))
        self.assertEqual(dt.datetime.fromisoformat(fecha.replace("Z", "+00:00")).date(), dt.date(2027, 1, 31))

    def test_es_el_unico_allow(self):
        self.assertEqual([s["Sid"] for s in carga()["Statement"] if s["Effect"] == "Allow"], ["AdministradorHastaEl31DeEneroDe2027"])


class NoRompeLoQueTerraformNecesita(unittest.TestCase):
    NECESARIAS = [
        ("iam:PutRolePolicy", ROL_CI),
        ("iam:UpdateAssumeRolePolicy", ROL_CI),
        ("iam:CreateRole", f"arn:aws:iam::{CUENTA}:role/cardea-dev-contact-role"),
        ("iam:DeleteRole", f"arn:aws:iam::{CUENTA}:role/cardea-dev-otro"),
        ("iam:GetOpenIDConnectProvider", OIDC),
        ("s3:PutObject", f"arn:aws:s3:::cardea-terraform-state-{CUENTA}/dev/terraform.tfstate"),
        ("s3:GetObject", f"arn:aws:s3:::cardea-terraform-state-{CUENTA}/dev/terraform.tfstate"),
        ("dynamodb:PutItem", f"arn:aws:dynamodb:eu-west-1:{CUENTA}:table/cardea-terraform-locks"),
        ("rds:CreateDBCluster", f"arn:aws:rds:eu-west-1:{CUENTA}:cluster:cardea-dev"),
        ("route53:ChangeResourceRecordSets", "arn:aws:route53:::hostedzone/Z025408038NPHX3W382AH"),
    ]

    def test_ninguna_accion_que_terraform_necesita_esta_denegada(self):
        for accion, recurso in self.NECESARIAS:
            with self.subTest(accion=accion, recurso=recurso):
                self.assertFalse(denegada(accion, recurso))


class SigueCerrandoLoQueDebe(unittest.TestCase):
    CERRADAS = [
        "iam:CreateUser", "iam:CreateAccessKey", "organizations:CreateAccount", "iam:CreatePolicyVersion",
        "iam:SetDefaultPolicyVersion", "iam:PutUserPolicy", "account:CloseAccount", "payments:CreatePaymentInstrument",
    ]

    def test_lo_peligroso_sigue_denegado(self):
        for accion in self.CERRADAS:
            with self.subTest(accion=accion):
                self.assertTrue(denegada(accion))

    def test_el_lockout_esta_cerrado_sobre_el_rol_de_ci_y_el_proveedor(self):
        self.assertTrue(denegada("iam:DeleteRole", ROL_CI))
        self.assertTrue(denegada("iam:DeleteRolePolicy", ROL_CI))
        self.assertTrue(denegada("iam:DeleteOpenIDConnectProvider", OIDC))

    def test_los_deny_globales_valen_para_cualquier_recurso(self):
        for sid in ("NoCrearCredencialesDeLargaVida", "NoOrganizacionesNiCambiosDeFacturacion",
                    "NoRepintarPoliticasNiUsuariosNiGrupos", "NoEngancharPoliticasDeAdministradorANadie"):
            with self.subTest(sid=sid):
                self.assertEqual(bloque(sid)["Resource"], "*")

    def test_no_se_puede_enganchar_administrator_access(self):
        arns = bloque("NoEngancharPoliticasDeAdministradorANadie")["Condition"]["ArnEquals"]["iam:PolicyARN"]
        self.assertIn("arn:aws:iam::aws:policy/AdministratorAccess", arns)


class NoTocaFenora(unittest.TestCase):
    def test_estado_de_fenora_y_fintrack_denegado(self):
        for recurso in [
            f"arn:aws:s3:::fenora-terraform-state-{CUENTA}",
            f"arn:aws:s3:::fenora-terraform-state-{CUENTA}/dev/terraform.tfstate",
            f"arn:aws:s3:::fintrack-terraform-state-{CUENTA}",
            f"arn:aws:dynamodb:eu-west-1:{CUENTA}:table/fenora-terraform-locks",
            f"arn:aws:dynamodb:eu-west-1:{CUENTA}:table/fintrack-terraform-locks",
        ]:
            with self.subTest(recurso=recurso):
                self.assertTrue(denegada("s3:DeleteObject", recurso) or denegada("dynamodb:DeleteTable", recurso))

    def test_recursos_con_nombre_de_fenora_denegados(self):
        for accion, recurso in [
            ("rds:DeleteDBCluster", f"arn:aws:rds:eu-west-1:{CUENTA}:cluster:fenora-dev"),
            ("iam:PutRolePolicy", f"arn:aws:iam::{CUENTA}:role/fenora-github-actions-deploy"),
            ("lambda:UpdateFunctionCode", f"arn:aws:lambda:eu-west-1:{CUENTA}:function:fenora-dev-email-forwarder"),
            ("cognito-idp:DeleteUserPool", f"arn:aws:cognito-idp:eu-west-1:{CUENTA}:userpool/fenora-dev"),
        ]:
            with self.subTest(recurso=recurso):
                self.assertTrue(denegada(accion, recurso))

    def test_recursos_etiquetados_de_fenora_denegados_aunque_el_arn_no_lo_diga(self):
        self.assertTrue(denegada("ec2:TerminateInstances", f"arn:aws:ec2:eu-west-1:{CUENTA}:instance/i-0abc", {"Project": "fenora"}))
        self.assertFalse(denegada("ec2:TerminateInstances", f"arn:aws:ec2:eu-west-1:{CUENTA}:instance/i-0abc", {"Project": "cardea"}))

    def test_leer_el_proveedor_oidc_etiquetado_de_fenora_sigue_permitido(self):
        # El proveedor lo gestiona Fenora y lleva Project=fenora; Cardea lo lee con un data source.
        self.assertFalse(denegada("iam:GetOpenIDConnectProvider", OIDC, {"Project": "fenora"}))
        self.assertFalse(denegada("iam:ListOpenIDConnectProviders", "*", {"Project": "fenora"}))

    def test_el_estado_de_cardea_no_se_borra(self):
        self.assertTrue(denegada("s3:DeleteBucket", f"arn:aws:s3:::cardea-terraform-state-{CUENTA}"))
        self.assertTrue(denegada("dynamodb:DeleteTable", f"arn:aws:dynamodb:eu-west-1:{CUENTA}:table/cardea-terraform-locks"))


if __name__ == "__main__":
    unittest.main()
