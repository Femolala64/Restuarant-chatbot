// orders.js — the contents half: the basket and the history.

const crypto = require("crypto");
const { formatPrice } = require("./menu");

function addItem(session, item) {
  session.currentOrder.push(item);
}

function clearOrder(session) {
  session.currentOrder = [];
}

function orderTotal(items) {
  return items.reduce((sum, item) => sum + item.priceKobo, 0);
}

function formatOrder(items) {
  const lines = items.map(
    (item) => `${item.name} - ${formatPrice(item.priceKobo)}`,
  );
  lines.push(`Total: ${formatPrice(orderTotal(items))}`);
  return lines.join("\n");
}

function placeOrder(session) {
  const placed = {
    id: crypto.randomUUID(),
    items: session.currentOrder,
    totalKobo: orderTotal(session.currentOrder),
    status: "pending_payment",
    placedAt: new Date().toISOString(),
  };
  session.orderHistory.push(placed);
  session.currentOrder = [];
  return placed;
}

module.exports = { addItem, clearOrder, orderTotal, formatOrder, placeOrder };
