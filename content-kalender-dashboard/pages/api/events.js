import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const CLIENTS_DATABASE_ID = process.env.NOTION_CLIENTS_DATABASE_ID;

function text(prop) {
  if (!prop) return "";
  switch (prop.type) {
    case "title":
      return prop.title.map((t) => t.plain_text).join("");
    case "rich_text":
      return prop.rich_text.map((t) => t.plain_text).join("");
    case "select":
      return prop.select ? prop.select.name : "";
    case "url":
      return prop.url || "";
    default:
      return "";
  }
}

function dateValue(prop) {
  if (!prop || prop.type !== "date" || !prop.date) return null;
  return prop.date.start;
}

function relationId(prop) {
  if (!prop || prop.type !== "relation" || !prop.relation || !prop.relation.length) return null;
  return prop.relation[0].id;
}

function fileUrl(prop) {
  if (!prop || prop.type !== "files" || !prop.files || !prop.files.length) return null;
  const f = prop.files[0];
  if (f.type === "file") return f.file.url;
  if (f.type === "external") return f.external.url;
  return null;
}

// "Client" ist eine Relation zur Clients-Datenbank. Wir holen uns einmalig
// alle Client-Seiten, um Relation-IDs auf Namen + Logo abzubilden.
async function loadClients() {
  const map = new Map();
  if (!CLIENTS_DATABASE_ID) return map;
  let cursor;
  do {
    const response = await notion.databases.query({
      database_id: CLIENTS_DATABASE_ID,
      start_cursor: cursor,
      page_size: 100
    });
    response.results.forEach((page) => {
      const p = page.properties;
      const nameProp = Object.values(p).find((prop) => prop.type === "title");
      map.set(page.id, {
        name: nameProp ? text(nameProp) : "Unbekannt",
        logo: fileUrl(p["Logo"])
      });
    });
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
  return map;
}

export default async function handler(req, res) {
  if (!process.env.NOTION_TOKEN || !DATABASE_ID) {
    res.status(500).json({
      error: "NOTION_TOKEN oder NOTION_DATABASE_ID ist nicht gesetzt. Bitte Umgebungsvariablen prüfen."
    });
    return;
  }

  try {
    const clients = await loadClients();

    let results = [];
    let cursor;
    do {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        start_cursor: cursor,
        page_size: 100
      });
      results = results.concat(response.results);
      cursor = response.has_more ? response.next_cursor : undefined;
    } while (cursor);

    const events = results
      .map((page) => {
        const p = page.properties;
        const datum = dateValue(p["Posting-Datum"]);
        if (!datum) return null;
        const clientId = relationId(p["Client"]);
        const client = clientId ? clients.get(clientId) : null;
        return {
          id: page.id,
          kunde: client ? client.name : "Ohne Kunde",
          kundeLogo: client ? client.logo : null,
          contentArt: text(p["Content-Art"]) || "Beitrag",
          titel: text(p["Content-Titel"]) || "(Ohne Titel)",
          datum,
          url: page.url
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.datum.localeCompare(b.datum));

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({ events });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Notion-Abfrage fehlgeschlagen.",
      detail: String(err && err.message ? err.message : err)
    });
  }
}
