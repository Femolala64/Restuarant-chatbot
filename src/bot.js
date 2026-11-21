// bot.js  beat three: the brain.
// Given a session and an input, decide the reply and the new position.

const { MAIN_MENU, ITEM_LIST } = require("./session");
const { findItem, formatMenu, formatPrice } = require("./menu");
const { addItem, clearOrder, formatOrder, placeOrder } = require("./orders");

const MAIN_MENU_TEXT = [
  "Select 1 to Place an order",
  "Select 99 to checkout order",
  "Select 98 to see order history",
  "Select 97 to see current order",
  "Select 0 to cancel order",
].join("\n");

function handleMainMenu(session, input) {
  switch (input) {
    case 1: {
      session.position = ITEM_LIST;
      return `${formatMenu()}\n\nEnter an item number to order or Press 0 to go back`;
    }

    case 99: {
      if (session.currentOrder.length === 0) return "No order to place";
      const placed = placeOrder(session);
      return `Order placed\n\n${formatOrder(placed.items)}\n\nPay here: /pay/${placed.id}\n\nSelect 1 to place a new order`;
    }

    case 98: {
      if (session.orderHistory.length === 0) return "No Orders yet";
      return session.orderHistory
        .map((o, i) => `${i + 1}. ${formatPrice(o.totalKobo)} - ${o.status}`)
        .join("\n");
    }

    case 97: {
      if (session.currentOrder.length === 0) return "You have no current order";
      return formatOrder(session.currentOrder);
    }

    case 0: {
      if (session.currentOrder.length === 0) return "No order to cancel";
      clearOrder(session);
      return "Order canceled";
    }

    default:
      return `I did not understand that.\n\n${MAIN_MENU_TEXT}`;
  }
}

function handleItemList(session, input) {
  if (input === 0) {
    session.position = MAIN_MENU;
    return MAIN_MENU_TEXT;
  }
  const item = findItem(input);
  if (!item) {
    return `No such item.\n\n${formatMenu()}\n\nEnter an item number, or 0 to go back.`;
  }
  addItem(session, item);
  return `Added ${item.name}.\n\nEnter another item number to add more, or 0 to go back.`;
}

// The only function server.js calls.
function handleMessage(session, rawInput) {
  const text = String(rawInput ?? "").trim();

  if (text === "") {
    return `Please enter a number.\n\n${MAIN_MENU_TEXT}`;
  }

  const input = Number(text);

  if (!Number.isInteger(input)) {
    return `Please enter a number.\n\n${MAIN_MENU_TEXT}`;
  }

  return session.position === ITEM_LIST
    ? handleItemList(session, input)
    : handleMainMenu(session, input);
}

module.exports = { handleMessage, MAIN_MENU_TEXT };
