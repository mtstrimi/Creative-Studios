import { colorFor } from "../lib/helpers";

export default function ClientCard({ client }) {
  const color = colorFor(client.name);
  const pkg = client.paket;

  return (
    <div className="client-card">
      <div className="client-name">
        {client.logo ? (
          <img className="client-logo" src={client.logo} alt="" />
        ) : (
          <span className="dot" style={{ background: color.c }} />
        )}
        {client.name}
      </div>
      {pkg ? (
        <>
          <div className="paket-name">Paket {pkg.name}</div>
          <div className="paket-detail">
            {pkg.reel ?? "–"} Reels · {pkg.beitrag ?? "–"} Beiträge · {pkg.story ?? "–"} Stories / Monat
          </div>
        </>
      ) : (
        <div className="paket-detail">Kein Paket verknüpft</div>
      )}
    </div>
  );
}
