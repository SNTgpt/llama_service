// test.js - Con esempi streaming
import { LLMClient } from '../index.js';
import 'dotenv/config';

const client = new LLMClient(process.env.LLM_API_KEY, 'llava');

(async () => {
  console.log("🧪 Test 1: Risposta normale");
  try {
    const risposta = await client.sendPrompt(
      "Ciao, chi sei?",
      "Sei un assistente utile",
      false // No streaming
    );
    console.log("✅ Risposta:", risposta);
  } catch (err) {
    console.error("❌ Errore:", err.message);
  }

  console.log("\n🧪 Test 2: Streaming con sendPrompt");
  try {
    const rispostaStream = await client.sendPrompt(
      "Raccontami una storia breve",
      "Sei un narratore creativo",
      true // Con streaming
    );
    console.log("✅ Risposta completa streaming:", rispostaStream);
  } catch (err) {
    console.error("❌ Errore streaming:", err.message);
  }

  console.log("\n🧪 Test 3: Streaming real-time con callback");
  try {
    await client.sendPromptStream(
      "Conta da 1 a 5 lentamente",
      "Conta numero per numero",
      (chunk) => {
        if (chunk.isComplete) {
          console.log("✅ Streaming completato!");
        } else {
          process.stdout.write(chunk.content); // Real-time output
        }
      }
    );
  } catch (err) {
    console.error("❌ Errore streaming callback:", err.message);
  }
})();