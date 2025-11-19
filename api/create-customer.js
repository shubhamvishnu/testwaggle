// /api/create-customer.js
// POST JSON: { paymentIntentId: "..." }

const CHARGEBEE_SITE = 'sk-playground-test.chargebee.com';
// For a quick demo you can hardcode the key; or set Vercel env var CHARGEBEE_API_KEY
const API_KEY = process.env.CHARGEBEE_API_KEY || 'test_xTchatU82zOc4hVXtX8UweS7jiJ0yq76';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end('Method Not Allowed');
    return;
  }

  // Read JSON body
  let raw = '';
  for await (const chunk of req) raw += chunk;
  let parsed = {};
  try { parsed = JSON.parse(raw || '{}'); } catch (e) {}
  const { paymentIntentId } = parsed;

  // Build the same payload as your cURL, only swapping payment_intent[id]
  const params = new URLSearchParams();
  params.append('first_name', 'John');
  params.append('last_name', 'Doe');
  params.append('email', 'john@test.com');
  params.append('locale', 'fr-CA');
  params.append('payment_intent[id]', paymentIntentId || '');
  params.append('billing_address[first_name]', 'John');
  params.append('billing_address[last_name]', 'Doe');
  params.append('billing_address[line1]', 'PO Box 9999');
  params.append('billing_address[city]', 'Walnut');
  params.append('billing_address[state]', 'California');
  params.append('billing_address[zip]', '91789');
  params.append('billing_address[country]', 'US');

  const auth = Buffer.from(`${API_KEY}:`).toString('base64');

  const resp = await fetch(`https://${CHARGEBEE_SITE}/api/v2/customers`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });

  const text = await resp.text();
  res.statusCode = resp.status;
  res.setHeader('Content-Type', 'application/json');
  try { res.end(JSON.stringify(JSON.parse(text))); }
  catch { res.end(JSON.stringify({ raw: text })); }
};
