// session.js — beat two: who is this?

const crypto = require("crypto");

const SESSIONS = new Map();

// The two positions a customer can be in.
const MAIN_MENU = "MAIN_MENU";
const ITEM_LIST = "ITEM_LIST";

function newSession() {
  return {
    position: MAIN_MENU,
    currentOrder: [],
    orderHistory: [],
  };
}

function getSession(deviceId) {
  if (!SESSIONS.has(deviceId)) {
    SESSIONS.set(deviceId, newSession());
  }
  return SESSIONS.get(deviceId);
}

// Generates the id we put in the cookie for a first-time visitor.
function newDeviceId() {
  return crypto.randomUUID();
}

module.exports = { getSession, newDeviceId, MAIN_MENU, ITEM_LIST };
