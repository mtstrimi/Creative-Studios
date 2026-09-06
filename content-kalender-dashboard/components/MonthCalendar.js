import { buildMonthGrid, fmtKey, isSameDay, monthLabel, colorFor, colorForArt, artLabel } from "../lib/helpers";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export default function MonthCalendar({ monthDate, eventsByDay }) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const cells = buildMonthGrid(year, month);
  const today = new Date();

  return (
    <div className="month-card">
      <h2>{monthLabel(monthDate)}</h2>
      <div className="weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="daygrid">
        {cells.map((cell, i) => {
          const key = fmtKey(cell.date);
          const dayEvents = eventsByDay[key] || [];
          const classes = ["day"];
          if (!cell.inMonth) classes.push("out");
          if (isSameDay(cell.date, today)) classes.push("today");
          return (
            <div className={classes.join(" ")} key={i}>
              <div className="num">{cell.date.getDate()}</div>
              <div className="entries">
                {dayEvents.map((ev) => {
                  const artColor = colorForArt(ev.contentArt);
                  const clientColor = colorFor(ev.kunde);
                  return (
                    <div
                      className="entry"
                      key={ev.id}
                      style={{ "--c": artColor.c, "--tint": artColor.tint }}
                      title={`${ev.kunde} · ${artLabel(ev.contentArt)} · ${ev.titel}`}
                      onClick={() => window.open(ev.url, "_blank", "noopener,noreferrer")}
                    >
                      <span className="entry-kunde">
                        {ev.kundeLogo ? (
                          <img className="entry-logo" src={ev.kundeLogo} alt="" />
                        ) : (
                          <span className="entry-dot" style={{ background: clientColor.c }} />
                        )}
                        {ev.kunde}
                      </span>
                      <span className="entry-titel">{ev.titel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
