// Vercel Serverless Function: POST /api/create-customer
// Body: { paymentIntentId: string }
// Returns: { customerId, raw }

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { paymentIntentId } = await readJSON(req);
    if (!paymentIntentId) return res.status(400).json({ error: "paymentIntentId is required" });

    // Build the exact same payload you provided, ONLY swapping payment_intent[id]
    const form = new URLSearchParams();
    form.set("first_name", "John");
    form.set("last_name", "Doe");
    form.set("email", "john@test.com");
    form.set("locale", "fr-CA");
    form.set("payment_intent[id]", paymentIntentId);
    form.set("billing_address[first_name]", "John");
    form.set("billing_address[last_name]", "Doe");
    form.set("billing_address[line1]", "PO Box 9999");
    form.set("billing_address[city]", "Walnut");
    form.set("billing_address[state]", "California");
    form.set("billing_address[zip]", "91789");
    form.set("billing_address[country]", "US");

    // Basic auth with your Chargebee API key
    const apiKey = process.env.CHARGEBEE_API_KEY; // set in Vercel → Project → Settings → Environment Variables
    if (!apiKey) return res.status(500).json({ error: "Missing CHARGEBEE_API_KEY env var" });

    const chargebeeRes = await fetch("https://sk-playground-test.chargebee.com/api/v2/customers", {
      method: "POST",
      headers: {
        "Authorization": "Basic " + Buffer.from(apiKey + ":").toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    const raw = await chargebeeRes.json();
    if (!chargebeeRes.ok) return res.status(chargebeeRes.status).json({ error: raw, step: "create-customer" });

    // Chargebee wraps responses; customer id is usually at raw.customer.id
    const customerId = raw?.customer?.id;
    return res.status(200).json({ customerId, raw });
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
