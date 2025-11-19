// Vercel Serverless Function: POST /api/create-subscription
// Body: { customerId: string, unitPrice: number }
// Returns: { subscriptionId, raw }

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { customerId, unitPrice } = await readJSON(req);
    if (!customerId) return res.status(400).json({ error: "customerId is required" });
    if (unitPrice == null) return res.status(400).json({ error: "unitPrice is required" });

    // Same payload you provided; ONLY the URL customer id and unit_price get replaced
    const form = new URLSearchParams();
    form.set("subscription_items[item_price_id][0]", "Pet-Policy-GBP-Monthly");
    form.set("subscription_items[unit_price][0]", String(unitPrice));

    const apiKey = process.env.CHARGEBEE_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing CHARGEBEE_API_KEY env var" });

    const url = `https://sk-playground-test.chargebee.com/api/v2/customers/${encodeURIComponent(customerId)}/subscription_for_items`;

    const chargebeeRes = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(apiKey + ":").toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    const raw = await chargebeeRes.json();
    if (!chargebeeRes.ok) return res.status(chargebeeRes.status).json({ error: raw, step: "create-subscription" });

    const subscriptionId = raw?.subscription?.id;
    return res.status(200).json({ subscriptionId, raw });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}

// --- helpers ---
async function readJSON(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const buf = Buffer.concat(chunks).toString("utf8") || "{}";
  return JSON.parse(buf);
}
