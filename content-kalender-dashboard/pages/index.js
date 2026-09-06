import { useEffect, useMemo, useState } from "react";
import MonthCalendar from "../components/MonthCalendar";
import ClientCard from "../components/ClientCard";
import { addMonths, rangeLabel, colorFor, CONTENT_ART_LEGEND } from "../lib/helpers";

const REFRESH_MS = 5 * 60 * 1000;

export default function Home() {
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState("");
  const [base, setBase] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });

  useEffect(() => {
    let cancelled = false;

    function load() {
      Promise.all([
        fetch("/api/events").then((r) => r.json()),
        fetch("/api/clients").then((r) => r.json())
      ])
        .then(([eventsData, clientsData]) => {
          if (cancelled) return;
          if (eventsData.error) {
            setErrorMsg(eventsData.error);
            setStatus("error");
            return;
          }
          setEvents(eventsData.events);
          setClients(clientsData.clients || []);
          setStatus("ready");
        })
        .catch((err) => {
          if (cancelled) return;
          setErrorMsg(String(err));
          setStatus("error");
        });
    }

    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const monthsToShow = useMemo(() => [0, 1, 2].map((i) => addMonths(base, i)), [base]);

  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const key = ev.datum.slice(0, 10);
      (map[key] = map[key] || []).push(ev);
    });
    return map;
  }, [events]);

  const sortedClients = useMemo(
    () => [...clients].sort((a, b) => a.name.localeCompare(b.name, "de")),
    [clients]
  );

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-row">
          <h1>Content Kalender</h1>
          {sortedClients.length > 0 && (
            <ul className="legend">
              {sortedClients.map((c) => (
                <li key={c.id}>
                  {c.logo ? (
                    <img className="entry-logo" src={c.logo} alt="" />
                  ) : (
                    <span className="dot" style={{ background: colorFor(c.name).c }} />
                  )}
                  {c.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="topbar-row">
          <div>
            <p className="subtitle">Ein Kalender für alle Kunden · Planung für die nächsten 3 Monate</p>
            <ul className="legend legend-art">
              {CONTENT_ART_LEGEND.map((a) => (
                <li key={a.name}>
                  <span className="dot" style={{ background: a.c }} />
                  {a.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="monthnav">
            <button onClick={() => setBase((b) => addMonths(b, -1))} aria-label="Vorheriger Monat">
              ‹
            </button>
            <span className="range">{rangeLabel(monthsToShow)}</span>
            <button onClick={() => setBase((b) => addMonths(b, 1))} aria-label="Nächster Monat">
              ›
            </button>
            <button
              className="today"
              onClick={() => {
                const t = new Date();
                setBase(new Date(t.getFullYear(), t.getMonth(), 1));
              }}
            >
              Heute
            </button>
          </div>
        </div>
      </header>

      <div className="body">
        <aside className="sidebar">
          <div className="sidebar-heading">Kunden &amp; Pakete</div>
          {status === "loading" && <div className="sidebar-empty">Lade Kunden …</div>}
          {status === "ready" && sortedClients.length === 0 && (
            <div className="sidebar-empty">Noch keine Einträge in der Clients-Datenbank gefunden.</div>
          )}
          {sortedClients.map((c) => (
            <ClientCard client={c} key={c.id} />
          ))}
        </aside>

        <main className="calendars">
          {status === "loading" && <div className="state-message">Lade Content-Kalender aus Notion …</div>}
          {status === "error" && (
            <div className="state-message">
              Daten konnten nicht geladen werden.
              <br />
              {errorMsg}
            </div>
          )}
          {status === "ready" &&
            monthsToShow.map((m) => (
              <MonthCalendar monthDate={m} eventsByDay={eventsByDay} key={m.toISOString()} />
            ))}
        </main>
      </div>

      <footer className="footer">
        Farbe des Eintrags = Content-Art (Reel/Beitrag/Story). Logo bzw. Farbpunkt + Name zeigt den Kunden. Klick öffnet den Notion-Datensatz.
      </footer>
    </div>
  );
}
