// public/app.js — the only script on the page.

const messagesEl = document.getElementById("messages");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("chat-input");



const addMessage = function (text, who) {
  const div = document.createElement("div");
  div.className = `msg msg--${who}`;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
};

async function sendText(text) {
  const res = await fetch("/api/message", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  return data.reply;
}

(async () => {
  const res = await fetch("/api/start");
  const data = await res.json();
  addMessage(data.reply, "bot");
})();

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  let value = inputEl.value.trim();
  if (!value) return;
  addMessage(value, "user");
  inputEl.value = "";
  const reply = await sendText(value);
  addMessage(reply, "bot");
});
