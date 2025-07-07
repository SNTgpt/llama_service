# 🧠 llama-service-client

Libreria Node.js per interfacciarsi con un modello LLM (es. `llava` o `llama3`) in esecuzione su un host remoto tramite Ollama API (`/api/chat`).  
Supporta autenticazione tramite chiave API e configurazione tramite `.env`.

## 📦 Installazione

```bash
npm install llama-service-client
```


## ⚙️ Configurazione .env
Crea un file .env nella root del progetto che utilizza la libreria, con:

```bash
LLM_API_KEY=la-tua-chiave-segreta
LLM_API_HOST=il-tuo-host
LLM_MODEL=il-tuo-modello
```

## 🧪 Esempio d'uso

```javascript
import { LLMClient } from 'llama-service-client';

const client = new LLMClient({
  apiKey: 'la-tua-chiave-segreta'
});

const main = async () => {
  try {
    const risposta = await client.sendPrompt("Ciao, chi sei?");
    console.log("Risposta:", risposta);
  } catch (err) {
    console.error("Errore:", err.message);
  }
};

main();
```

## 🔐 Sicurezza
La chiave API viene confrontata con quella attesa nel .env.
Solo chi conosce la chiave corretta può usare la libreria.

## 🛠 Parametri disponibili
Il metodo sendPrompt accetta:

- message (string) — Il messaggio dell'utente da inviare al modello

- prompt (string, opzionale) — Prompt di sistema per istruire il modello

- stream (boolean, opzionale) — Default false. Attiva lo streaming (non ancora gestito)


# 📝 Output
La libreria restituisce solo la risposta dell'assistente come stringa, estraendola da:

```json
{
  "message": {
    "role": "assistant",
    "content": "Risposta generata"
  }
}
```

---