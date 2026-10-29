import { test } from "node:test";
import assert from "node:assert/strict";

import { crearHandler, SIN_ACCESO } from "./enlace.mjs";

// Directorio en memoria: lo que se prueba es la decisión, no el SDK.
function entorno(usuarios) {
  const enlaces = [];
  const fotos = [];
  const directorio = {
    async buscarPorEmail(_pool, email) {
      return usuarios.filter((u) => u.email === email);
    },
    async enlazar(pool, proveedor, sujeto, destino) {
      enlaces.push({ pool, proveedor, sujeto, destino });
    },
    async ponerFoto(pool, destino, url) {
      fotos.push({ pool, destino, url });
    },
  };
  return { enlaces, fotos, handler: crearHandler({ directorio }) };
}

const desdeGoogle = (email, verificado = "true") => ({
  triggerSource: "PreSignUp_ExternalProvider",
  userPoolId: "eu-west-1_prueba",
  userName: "Google_1234567890",
  request: { userAttributes: { email, email_verified: verificado } },
  response: {},
});

const piloto = { email: "lucia@rumbonorte.example", username: "uuid-lucia", enabled: true, status: "CONFIRMED" };

test("un usuario dado de alta: se enlaza con Google y entra", async () => {
  const { enlaces, handler } = entorno([piloto]);
  const ev = desdeGoogle("Lucia@RumboNorte.example");
  assert.equal(await handler(ev), ev);
  assert.deepEqual(enlaces, [{ pool: "eu-west-1_prueba", proveedor: "Google", sujeto: "1234567890", destino: "uuid-lucia" }]);
});

test("un usuario creado sin contraseña todavía también se enlaza", async () => {
  const { enlaces, handler } = entorno([{ ...piloto, status: "FORCE_CHANGE_PASSWORD" }]);
  await handler(desdeGoogle(piloto.email));
  assert.equal(enlaces.length, 1);
});

test("un email sin alta: no entra ni se enlaza", async () => {
  const { enlaces, handler } = entorno([piloto]);
  await assert.rejects(handler(desdeGoogle("intruso@otra.example")), new RegExp(SIN_ACCESO));
  assert.equal(enlaces.length, 0);
});

test("email_verified llega como \"True\": se enlaza igual", async () => {
  const { enlaces, handler } = entorno([piloto]);
  await handler(desdeGoogle(piloto.email, "True"));
  assert.equal(enlaces.length, 1);
});

test("sin email (el cliente no puede escribirlo): no entra", async () => {
  const { enlaces, handler } = entorno([piloto]);
  const ev = desdeGoogle(piloto.email);
  ev.request.userAttributes = { name: "Lucía", "cognito:email_alias": "", "cognito:phone_number_alias": "" };
  await assert.rejects(handler(ev), new RegExp(SIN_ACCESO));
  assert.equal(enlaces.length, 0);
});

test("email no verificado por Google: no entra", async () => {
  const { enlaces, handler } = entorno([piloto]);
  await assert.rejects(handler(desdeGoogle(piloto.email, "false")), new RegExp(SIN_ACCESO));
  assert.equal(enlaces.length, 0);
});

test("usuario deshabilitado o solo federado: no entra", async () => {
  for (const u of [{ ...piloto, enabled: false }, { ...piloto, status: "EXTERNAL_PROVIDER" }]) {
    const { enlaces, handler } = entorno([u]);
    await assert.rejects(handler(desdeGoogle(piloto.email)), new RegExp(SIN_ACCESO));
    assert.equal(enlaces.length, 0);
  }
});

test("un error del directorio rechaza el acceso (falla cerrado)", async () => {
  const handler = crearHandler({ directorio: { buscarPorEmail: async () => { throw new Error("throttling"); }, enlazar: async () => {} } });
  await assert.rejects(handler(desdeGoogle(piloto.email)), /throttling/);
});

test("otras fuentes (alta por administrador) pasan sin tocar", async () => {
  const { enlaces, handler } = entorno([]);
  const ev = { ...desdeGoogle("x@y.example"), triggerSource: "PreSignUp_AdminCreateUser" };
  assert.equal(await handler(ev), ev);
  assert.equal(enlaces.length, 0);
});

test("al enlazar, la foto de Google se guarda en el usuario", async () => {
  const { fotos, handler } = entorno([piloto]);
  const ev = desdeGoogle(piloto.email);
  ev.request.userAttributes.picture = "https://lh3.googleusercontent.com/a/foto";
  await handler(ev);
  assert.deepEqual(fotos, [{ pool: "eu-west-1_prueba", destino: "uuid-lucia", url: "https://lh3.googleusercontent.com/a/foto" }]);
});

test("sin foto de Google no se toca el usuario", async () => {
  const { fotos, enlaces, handler } = entorno([piloto]);
  await handler(desdeGoogle(piloto.email));
  assert.equal(enlaces.length, 1);
  assert.equal(fotos.length, 0);
});
