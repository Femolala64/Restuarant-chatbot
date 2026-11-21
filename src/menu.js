// menu.js — what the restaurant sells.

const MENU = [
  { id: 1, name: "Jollof Rice", priceKobo: 250000 },
  { id: 2, name: "FuFu", priceKobo: 50000 },
  { id: 3, name: "Spaghetti", priceKobo: 300000 },
  { id: 4, name: "Pounded Yam", priceKobo: 70000 },
  { id: 5, name: "Pepper Soup", priceKobo: 1000000 },
];

function findItem(id) {
  Number(id);
  return MENU.find((item) => item.id === id);
}

function formatPrice(priceKobo) {
  return "N" + (priceKobo / 100).toLocaleString();
}

function formatMenu() {
  return MENU.map(
    (item) => `${item.id}. ${item.name}-${formatPrice(item.priceKobo)}`,
  ).join("\n");
}

module.exports = { MENU, findItem, formatPrice, formatMenu };
