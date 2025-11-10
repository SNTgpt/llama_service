// src/handlers/PromptHandler.js
import fetch from 'node-fetch';
import { Validator } from '../utils/Validator.js';
import { RequestBuilder } from '../core/RequestBuilder.js';

export class PromptHandler {
  constructor(connection) {
    this.connection = connection;
  }

  async send(message, options = {}) {
    // Validazione
    Validator.validateMessage(message);
    if (options.systemPrompt) {
      Validator.validateSystemPrompt(options.systemPrompt);
    }

    // Costruisci payload
    const payload = RequestBuilder.buildPayload(
      this.connection.getModel(),
      message,
      { ...options, stream: false }
    );

    // Esegui richiesta
    try {
      const response = await fetch(this.connection.getApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`LLM Error ${response.status}: ${text}`);
      }

      const json = await response.json();
      return json?.message?.content || "";

    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Impossibile connettersi a ${this.connection.host}`);
      }
      throw error;
    }
  }
}