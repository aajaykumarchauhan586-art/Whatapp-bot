const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'mybot123';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

function getReply(text) {
  const t = text.toLowerCase();
  if (t.includes('hi') || t.includes('hello') || t.includes('hey') || t.includes('namaste')) return 'Namaste! 🙏 Main aapka AI assistant hu. Aapko kya help chahiye?';
  if (t.includes('kaise ho')) return 'Main mast hu! Aap batao, kya kar sakta hu aapke liye?';
  if (t.includes('tum kaun')) return 'Main aapka WhatsApp AI Bot hu, jo Meta WhatsApp API se chalta hai.';
  if (t.includes('price') || t.includes('daam') || t.includes('rate')) return 'Aap kis cheez ka price puch rahe ho? Thoda detail batao.';
  if (t.includes('bye') || t.includes('alvida')) return 'Bye bye! Phir baat karenge. 👋';
  if (t.includes('thank')) return 'Welcome! Aur kuch puchna hai to batao.';
  return `Aapne kaha: "${text}". Main abhi seekh raha hu, thoda aur detail me batao, main aapki puri help karunga!`;
}

app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const msg = value?.messages?.[0];
    if (msg && msg.type === 'text') {
      const from = msg.from;
      const text = msg.text.body;
      const reply = getReply(text);
      await axios.post(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
        messaging_product: 'whatsapp',
        to: from,
        type: 'text',
        text: { body: reply }
      }, { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' } });
    }
    res.sendStatus(200);
  } catch (e) { console.log(e.message); res.sendStatus(200); }
});

app.get('/', (req, res) => res.send('Bot is running!'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Running on ' + PORT));
