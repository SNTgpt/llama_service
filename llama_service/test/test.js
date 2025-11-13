// test/test.js
import { LLMClient } from '../index.js';

const API_KEY = 'sk-20258377';

console.log("🧪 ===== TEST SUITE LLAMA SERVICE =====\n");

(async () => {
  try {
    // Inizializza client
    const client = new LLMClient(API_KEY,true);
    console.log("✅ Client inizializzato correttamente\n");

    // ========================================
    // TEST 1: Prompt Base
    // ========================================
    console.log("🧪 Test 1: Prompt base");
    try {
      const risposta1 = await client.send("Ciao, chi sei? Che modello di LLM sei ? ");
      console.log("✅ Risposta:", risposta1.substring(0, 1000) + "...");
    } catch (err) {
      console.error("❌ Errore:", err.message);
    }

    console.log("\n---\n");

    // ========================================
    // TEST 2: Prompt con System Prompt
    // ========================================
    console.log("🧪 Test 2: Prompt con system prompt");
    try {
      const risposta2 = await client.send("Qual è la capitale d'Italia?", {
        systemPrompt: "Rispondi in modo conciso, massimo 10 parole"
      });
      console.log("✅ Risposta:", risposta2);
    } catch (err) {
      console.error("❌ Errore:", err.message);
    }

    console.log("\n---\n");

    // ========================================
    // TEST 3: Streaming con callback
    // ========================================
    console.log("🧪 Test 3: Streaming real-time");
    try {
      process.stdout.write("✅ Output streaming: ");
      await client.sendStream("Conta da 1 a 5", {
        systemPrompt: "Conta solo i numeri, uno per riga",
        onChunk: (chunk) => {
          if (chunk.isComplete) {
            console.log("\n✅ Streaming completato!");
          } else {
            process.stdout.write(chunk.content);
          }
        }
      });
    } catch (err) {
      console.error("❌ Errore:", err.message);
    }

    console.log("\n---\n");

    // ========================================
    // TEST 4: Streaming senza callback
    // ========================================
    console.log("🧪 Test 4: Streaming senza callback (risposta completa)");
    try {
      const risposta4 = await client.sendStream("Dimmi 3 colori primari", {
        systemPrompt: "Elenca solo i nomi, separati da virgola"
      });
      console.log("✅ Risposta completa:", risposta4);
    } catch (err) {
      console.error("❌ Errore:", err.message);
    }

    console.log("\n---\n");

    // ========================================
    // TEST 5: Immagine Base64 (mock)
    // ========================================
    console.log("🧪 Test 5: Invio con immagine base64");
    console.log("ℹ️  Nota: Questo test usa un'immagine mock. Per testare realmente,");
    console.log("    sostituisci 'mockBase64' con una vera stringa base64.");
    
    try {
      // Mock base64 (sostituisci con vera immagine per test reale)
      const mockBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      
      const risposta5 = await client.sendWithImage(
        "Cosa vedi in questa immagine?",
        mockBase64,
        {
          systemPrompt: "Descrivi l'immagine in dettaglio"
        }
      );
      console.log("✅ Risposta:", risposta5.substring(0, 100) + "...");
    } catch (err) {
      console.error("❌ Errore:", err.message);
      console.log("ℹ️  Normale se il modello non supporta immagini o base64 è invalido");
    }

    console.log("\n---\n");

    // ========================================
    // TEST 6: Conversazione multi-turno
    // ========================================
    console.log("🧪 Test 6: Conversazione multi-turno");
    try {
      const messages = [];
      
      // Turno 1
      const turno1 = await client.send("Mi chiamo Marco", {
        systemPrompt: "Sei un assistente che ricorda le informazioni",
        messages: messages
      });
      messages.push({ role: "user", content: "Mi chiamo Marco" });
      messages.push({ role: "assistant", content: turno1 });
      console.log("✅ Turno 1:", turno1.substring(0, 80) + "...");
      
      // Turno 2
      const turno2 = await client.send("Come mi chiamo?", {
        systemPrompt: "Sei un assistente che ricorda le informazioni",
        messages: messages
      });
      console.log("✅ Turno 2:", turno2);
      
    } catch (err) {
      console.error("❌ Errore:", err.message);
    }

    console.log("\n\n🎉 ===== TEST COMPLETATI =====");

  } catch (error) {
    console.error("\n💥 Errore fatale:", error.message);
    process.exit(1);
  }
})();