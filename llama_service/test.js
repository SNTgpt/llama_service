import { LLMClient } from './index.js';

import 'dotenv/config';

let key =process.env.LLM_API_KEY;

const client = new LLMClient(key);

(async () => {
  try {
    const risposta = await client.sendPrompt(
      "Ciao, chi sei?",
      "Test", // prompt di sistema opzionale
      false // stream disattivato
    );
    console.log("✅ Risposta LLM:", risposta);
  } catch (err) {
    console.error("❌ Errore durante il test:", err.message);
  }
})();
