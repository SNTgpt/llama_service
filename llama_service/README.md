# 🧠 llama-service-snt

Libreria Node.js **modulare** per interfacciarsi con modelli LLM locali (es. `llava`, `llama3`) tramite Ollama API.  
Supporta autenticazione, streaming real-time, immagini base64 e conversazioni multi-turno.


---

## ✨ Caratteristiche v2.0.0

- ✅ **Architettura modulare** - Componenti separati per responsabilità
- ✅ **Prompt standard** - Invio messaggi semplici
- ✅ **Streaming real-time** - Callback progressivi
- ✅ **Supporto immagini** - Invio immagini base64
- ✅ **Conversazioni multi-turno** - Context management
- ✅ **System prompts** - Personalizzazione comportamento modello
- ✅ **Validazione input** - Controlli automatici
- ✅ **Gestione errori** - Error handling chiaro

---

## 📦 Installazione
```bash
npm install llama-service-snt
```

---

## ⚙️ Configurazione

### 1. Crea `config/configuration.json`
```json
{
  "api": {
    "host": "http://localhost:11434",
    "key": "sk-your-api-key",
    "timeout": 30000
  },
  "model": {
    "default": "llava"
  },
  "endpoints": {
    "chat": "/api/chat"
  }
}
```

### 2. (Opzionale) Crea `.env` per override
```bash
LLM_API_KEY=sk-your-api-key
LLM_API_HOST=http://localhost:11434
LLM_MODEL=llava
```

**Nota**: I valori in `.env` sovrascrivono quelli in `configuration.json`

---

## 🧪 Utilizzo Base

### Importazione
```javascript
import { LLMClient } from 'llama-service-snt';

const client = new LLMClient('sk-your-api-key', 'llava');
```

---

## 📚 Esempi

### 1️⃣ Prompt Semplice
```javascript
const risposta = await client.send("Ciao, chi sei?");
console.log(risposta);
```

### 2️⃣ Con System Prompt
```javascript
const risposta = await client.send("Qual è la capitale d'Italia?", {
  systemPrompt: "Rispondi in modo conciso, massimo 10 parole"
});
console.log(risposta); // "Roma"
```

### 3️⃣ Streaming Real-Time
```javascript
await client.sendStream("Conta da 1 a 5", {
  systemPrompt: "Conta lentamente",
  onChunk: (chunk) => {
    if (!chunk.isComplete) {
      process.stdout.write(chunk.content); // Output progressivo
    } else {
      console.log("\n✅ Completato!");
    }
  }
});
```

### 4️⃣ Streaming Senza Callback
```javascript
const rispostaCompleta = await client.sendStream("Raccontami una storia breve");
console.log(rispostaCompleta); // Ritorna tutta la risposta alla fine
```

### 5️⃣ Invio Immagine Base64
```javascript
import { readFileSync } from 'fs';

// Leggi immagine e converti in base64
const imageBuffer = readFileSync('./image.jpg');
const base64Image = imageBuffer.toString('base64');

const risposta = await client.sendWithImage(
  "Cosa vedi in questa immagine?",
  base64Image,
  {
    systemPrompt: "Descrivi l'immagine in dettaglio"
  }
);
console.log(risposta);
```

### 6️⃣ Conversazione Multi-Turno
```javascript
const messages = [];

// Turno 1
const turno1 = await client.send("Mi chiamo Marco", {
  systemPrompt: "Sei un assistente che ricorda le informazioni",
  messages: messages
});
messages.push({ role: "user", content: "Mi chiamo Marco" });
messages.push({ role: "assistant", content: turno1 });

// Turno 2
const turno2 = await client.send("Come mi chiamo?", {
  systemPrompt: "Sei un assistente che ricorda le informazioni",
  messages: messages
});
console.log(turno2); // "Ti chiami Marco"
```

---

## 🔧 API Reference

### `new LLMClient(apiKey, model?)`

Crea una nuova istanza del client.

**Parametri:**
- `apiKey` (string) - Chiave API per autenticazione
- `model` (string, opzionale) - Modello da utilizzare (default: da config)

---

### `client.send(message, options?)`

Invia un prompt standard (non-streaming).

**Parametri:**
- `message` (string) - Il messaggio da inviare
- `options` (object, opzionale):
  - `systemPrompt` (string) - Prompt di sistema
  - `messages` (array) - Messaggi precedenti per context

**Ritorna:** `Promise<string>` - Risposta del modello

---

### `client.sendStream(message, options?)`

Invia un prompt con streaming.

**Parametri:**
- `message` (string) - Il messaggio da inviare
- `options` (object, opzionale):
  - `systemPrompt` (string) - Prompt di sistema
  - `messages` (array) - Messaggi precedenti per context
  - `onChunk` (function) - Callback per ogni chunk ricevuto
    - Riceve: `{ content, fullResponse, isComplete }`

**Ritorna:** `Promise<string>` - Risposta completa del modello

---

### `client.sendWithImage(message, base64Image, options?)`

Invia un prompt con immagine base64.

**Parametri:**
- `message` (string) - Il messaggio da inviare
- `base64Image` (string) - Immagine in formato base64
- `options` (object, opzionale):
  - `systemPrompt` (string) - Prompt di sistema
  - `messages` (array) - Messaggi precedenti per context

**Ritorna:** `Promise<string>` - Risposta del modello

---

## 🏗️ Architettura
```
src/
├── core/
│   ├── Connection.js       # Gestione connessione
│   └── RequestBuilder.js   # Costruzione payload API
│
├── handlers/
│   ├── PromptHandler.js    # Invio prompt standard
│   ├── StreamHandler.js    # Gestione streaming
│   └── ImageHandler.js     # Gestione immagini
│
├── utils/
│   ├── ConfigLoader.js     # Caricamento configurazione
│   └── Validator.js        # Validazione input
│
└── LLMClient.js            # Facade principale
```

**Principi:**
- ✅ **KISS** - Keep It Simple, Stupid
- ✅ **Single Responsibility** - Un componente = una responsabilità
- ✅ **Separation of Concerns** - Logica separata per layer

---

## 🧪 Testing
```bash
# Esegui test suite
npm test
```

---

## 🔐 Sicurezza

- ✅ Validazione API key
- ✅ Validazione input utente
- ✅ Gestione errori di rete
- ⚠️ **Non committare** `.env` e `config/` (già in `.gitignore`)

---

## 📝 Changelog

### v2.0.0 (2025-11-10)
- 🎉 **Refactoring completo** - Architettura modulare
- ✨ Supporto immagini base64
- ✨ Streaming con callback real-time
- ✨ Conversazioni multi-turno
- ✨ System prompts personalizzabili
- 🐛 Fix gestione configurazione

### v1.2.4
- Versione monolitica legacy

---


## 👤 Autore

**Marco Paglicci**
- Email: m.paglicci@sntinformatica.it
- GitHub: [@SNTgpt](https://github.com/SNTgpt)

