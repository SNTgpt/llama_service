import fetch from 'node-fetch';

export class LLMClient {
  constructor({
    apiKey,
    host = 'http://127.0.0.1:11434',
    model = 'llava'
  } = {}) {
    if (!apiKey) {
      throw new Error("⚠️ Chiave API mancante: fornisci `apiKey` nel costruttore.");
    }

    this.apiKey = apiKey;
    this.apiUrl = `${host}/api/chat`;
    this.model = model;
  }

  async sendPrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error("⚠️ Prompt non valido: deve essere una stringa non vuota.");
    }

    const body = {
      model: this.model,
      stream: false,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    };

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
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