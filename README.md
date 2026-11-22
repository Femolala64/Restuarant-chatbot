# Femi's Kitchen — Restaurant Chatbot

A chatbot that takes food orders through a numbered menu and accepts
payment via Paystack.

**Live:** https://restuarant-chatbot.onrender.com

> Hosted on Render's free tier, so the first request after a period of
> inactivity takes up to a minute while the service wakes up.

## How it works

Every visitor is given a device id stored in an `httpOnly` cookie. That id
keys an in-memory session holding the current order and the order history,
so a returning visitor on the same browser keeps their state.

## Commands

| Input | Action |
|-------|--------|
| 1 | Place an order (opens the item list) |
| 99 | Checkout — places the order and returns a payment link |
| 98 | Order history |
| 97 | Current order |
| 0 | Cancel order (main menu) / go back (item list) |

Inside the item list, enter an item number to add it to your order, or `0`
to return to the main menu.

## Menu

| # | Item | Price |
|---|------|-------|
| 1 | Jollof Rice | N2,500 |
| 2 | FuFu | N500 |
| 3 | Spaghetti | N3,000 |
| 4 | Pounded Yam | N700 |
| 5 | Pepper Soup | N10,000 |

## Payment flow

1. Checkout places the order with status `pending_payment` and returns a
   `/pay/:orderId` link.
2. That route calls Paystack's `transaction/initialize`, using the order id
   as the transaction reference, and redirects to Paystack's checkout page.
3. After payment Paystack redirects back to `/payment/callback`.
4. The callback does **not** trust the redirect. It calls Paystack's
   `transaction/verify` server-to-server and only marks the order paid if
   Paystack confirms the charge succeeded.

A declined payment therefore leaves the order pending, even though the
customer's browser still arrives at the callback.

## Tech

Node.js, Express, cookie-parser, Paystack. No database — sessions and
orders are held in memory and reset when the server restarts.

## Running locally

```bash
npm install
cp .env.example .env    # then add your Paystack test secret key
npm start
```

Open http://localhost:3000

## Environment variables

| Variable | Description |
|----------|-------------|
| `PAYSTACK_SECRET_KEY` | Paystack test secret key (`sk_test_...`) |

## Project structure

```
server.js           routes and middleware
src/menu.js         menu data and formatting
src/session.js      device ids and in-memory sessions
src/orders.js       cart and order placement
src/bot.js          conversation logic
src/payment.js      Paystack initialize and verify
public/             chat page
```