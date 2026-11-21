// server.js — the front door. Receives, routes, replies. No logic lives here.

require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const { getSession, newDeviceId } = require("./src/session");
const { handleMessage, MAIN_MENU_TEXT } = require("./src/bot");
const { startPayment, verifyPayment } = require("./src/payment");

const app = express();

app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  let deviceId = req.cookies.deviceId;
  if (!deviceId) {
    deviceId = newDeviceId();
    res.cookie("deviceId", deviceId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 28, // ~4 weeks
    });
  }
  req.deviceId = deviceId;
  req.session = getSession(deviceId);
  next();
});

app.get("/api/start", (req, res) => {
  res.json({
    reply: `Welcome to Femi's Kitchen\n\n${MAIN_MENU_TEXT}`,
  });
});

app.post("/api/message", (req, res) => {
  const { text } = req.body;
  const session = req.session;
  const reply = handleMessage(session, text);
  res.json({
    reply,
  });
});

app.get("/pay/:orderId", async (req, res) => {
  const order = req.session.orderHistory.find(
    (o) => o.id === req.params.orderId,
  );
  if (!order) return res.status(404).send("Order not found");
  if (order.status === "paid") return res.redirect("/?paid=1");

  try {
    const callbackUrl = `${req.protocol}://${req.get("host")}/payment/callback`;
    const url = await startPayment(order, "customer@bloom.test", callbackUrl);
    res.redirect(url);
  } catch (err) {
    console.error("startPayment failed:", err.message);
    res
      .status(502)
      .send("Could not reach the payment provider. Please try again.");
  }
});

app.get("/payment/callback", async (req, res) => {
  const { reference } = req.query;
  if (!reference) return res.redirect("/?paid=0");

  try {
    // Verify FIRST. The customer arriving here proves nothing — anyone
    // can type this URL. Only Paystack's answer may change the status.
    const ok = await verifyPayment(reference);
    if (!ok) return res.redirect("/?paid=0");

    const order = req.session.orderHistory.find((o) => o.id === reference);
    if (order) order.status = "paid";

    res.redirect("/?paid=1");
  } catch (err) {
    console.error("verifyPayment failed:", err.message);
    res.redirect("/?paid=0");
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
