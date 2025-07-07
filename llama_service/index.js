import fetch from 'node-fetch';

import 'dotenv/config';

export class LLMClient {
  constructor(apiKey,host = '',model = '') {
    if (!apiKey) {
      throw new Error("⚠️ Chiave API mancante: fornisci `apiKey` nel costruttore.");
    }
    
    this.apiKey = apiKey;
    this.host = process.env.LLM_API_HOST;
    this.apiUrl = `${this.host}/api/chat`;
    this.model = process.env.LLM_MODEL;


    if(apiKey != process.env.LLM_API_KEY)
    {
      throw new Error("⚠️ Chiave API errata : fornisci `apiKey` corretta .");
    }

  }

  async sendPrompt(message, prompt, stream = false) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error("⚠️ Prompt non valido: deve essere una stringa non vuota.");
    }

    const body = {
    model: this.model,
    stream: stream,
    messages: []
  };

  // Se c'è un messaggio system, lo aggiungo all'inizio
    if (prompt) {
      body.messages.push({
        role: "system",
        content: prompt
      });
    }

    body.messages.push({
      role: "user",
      content: message
    });


    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Errore LLM (${response.status}): ${text}`);
    }

    const json = await response.json();
    return json?.message?.content || "";
  }
}