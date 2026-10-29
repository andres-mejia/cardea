// Formulario «Pedir una demo». Guarda la solicitud (idempotente por correo) y avisa por SES.
// Sin dependencias: el SDK v3 viene en el runtime nodejs20.x.
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ddb = new DynamoDBClient({});
const ses = new SESClient({});
const { TABLE_NAME, FROM_ADDRESS, NOTIFY_ADDRESS, CONFIGURATION_SET } = process.env;
const USOS = new Set(["", "api", "clis", "asientos", "todo"]);

const respond = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  let datos;
  try {
    datos = JSON.parse(event.body ?? "{}");
  } catch {
    return respond(400, { error: "JSON inválido" });
  }
  const nombre = String(datos.nombre ?? "").trim().slice(0, 120);
  const email = String(datos.email ?? "").trim().toLowerCase().slice(0, 254);
  const empresa = String(datos.empresa ?? "").trim().slice(0, 120);
  const uso = String(datos.uso ?? "").trim();
  if (!nombre || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !USOS.has(uso)) {
    return respond(400, { error: "Faltan datos" });
  }
  const ahora = new Date().toISOString();
  await ddb.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: {
      email: { S: email },
      nombre: { S: nombre },
      empresa: { S: empresa },
      uso: { S: uso },
      created_at: { S: ahora },
      ttl: { N: String(Math.floor(Date.now() / 1000) + 365 * 24 * 3600) },
    },
  }));
  try {
    await ses.send(new SendEmailCommand({
      Source: FROM_ADDRESS,
      ConfigurationSetName: CONFIGURATION_SET,
      Destination: { ToAddresses: [NOTIFY_ADDRESS] },
      Message: {
        Subject: { Data: `Demo de Cardea: ${empresa || nombre}` },
        Body: { Text: { Data: `Nombre: ${nombre}\nCorreo: ${email}\nEmpresa: ${empresa}\nUso: ${uso}\nFecha: ${ahora}` } },
      },
    }));
  } catch (err) {
    console.error("SES", err?.name);
  }
  return respond(200, { ok: true });
};
