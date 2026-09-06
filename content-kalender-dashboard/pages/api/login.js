export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Methode nicht erlaubt." });
    return;
  }

  const { password } = req.body || {};
  const expected = process.env.DASHBOARD_PASSWORD;

  if (!expected) {
    res.status(500).json({ ok: false, error: "DASHBOARD_PASSWORD ist nicht konfiguriert." });
    return;
  }

  if (password && password === expected) {
    const isProd = process.env.NODE_ENV === "production";
    res.setHeader(
      "Set-Cookie",
      `dashboard_auth=${encodeURIComponent(password)}; HttpOnly; Path=/; Max-Age=2592000; SameSite=Lax${
        isProd ? "; Secure" : ""
      }`
    );
    res.status(200).json({ ok: true });
  } else {
    res.status(401).json({ ok: false, error: "Falsches Passwort." });
  }
}
