import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const CLIENTS_DATABASE_ID = process.env.NOTION_CLIENTS_DATABASE_ID;
const PACKAGES_DATABASE_ID = process.env.NOTION_PACKAGES_DATABASE_ID;

function text(prop) {
  if (!prop) return "";
  if (prop.type === "title") return prop.title.map((t) => t.plain_text).join("");
  if (prop.type === "rich_text") return prop.rich_text.map((t) => t.plain_text).join("");
  if (prop.type === "select") return prop.select ? prop.select.name : "";
  return "";
}

function number(prop) {
  if (!prop || prop.type !== "number" || prop.number == null) return null;
  return prop.number;
}

function relationId(prop) {
  if (!prop || prop.type !== "relation" || !prop.relation || !prop.relation.length) return null;
  return prop.relation[0].id;
}

// Files-Property: erstes Bild, egal ob direkt hochgeladen oder externer Link.
function fileUrl(prop) {
  if (!prop || prop.type !== "files" || !prop.files || !prop.files.length) return null;
  const f = prop.files[0];
  if (f.type === "file") return f.file.url;
  if (f.type === "external") return f.external.url;
  return null;
}

async function queryAll(databaseId) {
  let results = [];
  let cursor;
  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100
    });
    results = results.concat(response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
  return results;
}

export default async function handler(req, res) {
  if (!process.env.NOTION_TOKEN || !CLIENTS_DATABASE_ID) {
    res.status(200).json({ clients: [] });
    return;
  }

  try {
    const packagePages = PACKAGES_DATABASE_ID ? await queryAll(PACKAGES_DATABASE_ID) : [];
    const packagesById = new Map();
    packagePages.forEach((page) => {
      const p = page.properties;
      packagesById.set(page.id, {
        name: text(p["Paket-Name"]),
        typ: text(p["Typ"]),
        reel: number(p["Reels"]),
        beitrag: number(p["Beiträge"]),
        story: number(p["Stories"])
      });
    });

    const clientPages = await queryAll(CLIENTS_DATABASE_ID);
    const clients = clientPages.map((page) => {
      const p = page.properties;
      const paketId = relationId(p["Paket"]);
      const basePaket = paketId ? packagesById.get(paketId) : null;

      // Beim Custom-Paket kommen die Mengen nicht aus der Packages-Tabelle
      // (die ist dort absichtlich leer), sondern aus den individuellen
      // "Custom ..."-Feldern direkt beim Kunden.
      const paket = basePaket
        ? basePaket.typ === "Custom"
          ? {
              name: basePaket.name,
              reel: number(p["Custom Reels"]),
              beitrag: number(p["Custom Beiträge"]),
              story: number(p["Custom Stories"])
            }
          : basePaket
        : null;

      return {
        id: page.id,
        name: text(p["Name"]) || "Unbekannt",
        logo: fileUrl(p["Logo"]),
        paket
      };
    });

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({ clients });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Kunden konnten nicht geladen werden.",
      detail: String(err && err.message ? err.message : err)
    });
  }
}
