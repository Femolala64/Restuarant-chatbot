// payment.js — the only file that talks to the outside world.

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE = "https://api.paystack.co";

async function startPayment(order, email, callbackUrl) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: order.totalKobo,
      reference: order.id,
      callback_url: callbackUrl,
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(
      json.message || "Failed to initialize Paystack transaction",
    );
  }

  return json.data.authorization_url;
}

async function verifyPayment(reference) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
    },
  });

  const json = await res.json();

  if (!res.ok || !json.status) {
    return false;
  }

  return json.data.status === "success";
}

module.exports = { startPayment, verifyPayment };
