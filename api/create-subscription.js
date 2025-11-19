// /api/create-subscription.js
// POST JSON: { customerId: "...", unitPrice: 5000 }

const CHARGEBEE_SITE = 'sk-playground-test.chargebee.com';
const API_KEY = process.env.CHARGEBEE_API_KEY || 'test_xTchatU82zOc4hVXtX8UweS7jiJ0yq76';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end('Method Not Allowed');
    return;
  }

  let raw = '';
  for await (const chunk of req) raw += chunk;
  let parsed = {};
  try { parsed = JSON.parse(raw || '{}'); } catch (e) {}
  const { customerId, unitPrice } = parsed;

  const params = new URLSearchParams();
  params.append('subscription_items[item_price_id][0]', 'Pet-Policy-GBP-Monthly');
  params.append('subscription_items[unit_price][0]', String(unitPrice));

  const auth = Buffer.from(`${API_KEY}:`).toString('base64');

  const resp = await fetch(`https://${CHARGEBEE_SITE}/api/v2/customers/${encodeURIComponent(customerId)}/subscription_for_items`, {
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
