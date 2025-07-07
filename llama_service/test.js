import { LLMClient } from './index.js';
import 'dotenv/config';

async function runTest() {
  try {
    const client = new LLMClient({
      apiKey: process.env.LLM_API_KEY,  // Passi la chiave corretta
      host: process.env.LLM_API_HOST,
      model: process.env.LLM_MODEL
    });

    // Prompt di sistema + messaggio utente
    const prompt = "Rispondi in modo conciso e formale.";
    const message = "Qual è la capitale della Francia?";

    const response = await client.sendPrompt(message, prompt);
    console.log("✅ Risposta del modello:\n", response);
  } catch (error) {
    console.error("❌ Errore durante il test:", error.message);
  }
}

runTest();
