# ADR-004 · Red privada para el control plane

Fecha: 2026-10-29 · Estado: aceptada

## Contexto

`AGENTS.md` §4 decía «Sin VPC para las Lambdas (Aurora con IAM auth y TLS, patrón heredado de Fenora)». Al preparar la spec 001 se comprobó en el repo de Fenora (`andres-mejia/fintrack`, `origin/main`) que ese patrón ya no existe allí:

- En su primer apply (commit `18e7e2cd`, 2026-05-01) Fenora sacó Aurora de las subredes públicas: con Lambdas fuera de VPC, sin IP fija, el SG de Aurora tenía que aceptar 5432 desde `0.0.0.0/0`, y la única barrera era la autenticación IAM.
- Después (#34) movió sus servicios Java a Lambdas en VPC privada con JDBC, salida a internet por una NAT instance (fck-nat) y acceso humano por un bastión con SSM Session Manager.

Cardea comparte cuenta con Fenora y tiene los mismos requisitos, más uno: el mismo artefacto del control plane corre en Lambda y en el Kubernetes del cliente con su Postgres (ADR-002).

## Decisión

- Aurora Serverless v2 en subredes privadas, sin acceso público. Su SG solo admite el SG compartido de las Lambdas del control plane y el del bastión. IAM auth y TLS obligatorios. Sin RDS Proxy en dev.
- Las Lambdas del control plane corren en VPC (subredes privadas) y hablan JDBC con Postgres, igual que en Helm.
- Salida a internet de las subredes privadas por una NAT instance fck-nat `t4g.nano`, no por NAT Gateway (~3 € frente a ~32 € al mes). Es un punto único de fallo aceptado en dev.
- Acceso humano a la base de datos por un bastión `t3.nano` en subred privada, con SSM Session Manager y port forwarding; sin SSH ni claves.
- VPC propia `cardea-dev-vpc` (`10.20.0.0/16`), distinta de la de Fenora (`10.0.0.0/16`).

## Alternativas

- **Aurora pública con IAM auth y TLS** (el texto anterior de `AGENTS.md`). Es más barata, pero expone 5432 a internet; Fenora la revirtió por seguridad. Rechazada.
- **Aurora privada con RDS Data API y Lambdas sin VPC.** No necesita NAT, pero el adaptador de persistencia sería específico de AWS y el mismo Quarkus no correría tal cual contra el Postgres del cliente. Rechazada.
- **NAT Gateway.** Más robusto, pero diez veces más caro para un entorno dev. Rechazada en dev; se revisa para producción.

## Consecuencias

- Coste fijo en dev de unos 12 €/mes (NAT, bastión, una IPv4 pública, EBS y el secreto de Aurora) antes de contar Aurora, que se pausa. El bastión se puede parar cuando no se usa.
- Las Lambdas en VPC tardan algo más en arrancar en frío por la ENI; se mide con el primer servicio (spec 002).
- El módulo `lambda` de la spec 002 recibe `private_subnet_ids` y `lambda_security_group_id` como en Fenora.
- **Riesgo de cuenta compartida**: el rol de CI de Fenora tiene hoy una política `Allow *` hasta 2027-01-31 y puede tocar recursos de Cardea. La política de arranque de Cardea niega lo recíproco (`NoTocarFenora`), pero lo de Fenora solo se corrige en Fenora.
