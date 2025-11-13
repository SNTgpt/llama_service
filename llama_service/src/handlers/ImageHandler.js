// src/handlers/ImageHandler.js
import fetch from 'node-fetch';
import { Validator } from '../utils/Validator.js';
import { RequestBuilder } from '../core/RequestBuilder.js';
//-------------------------------------------------------------------------------


//-------------------------------------------------------------------------------
export class ImageHandler {
  constructor(connection) {
    this.connection = connection;
  }

  async sendWithImage(message, base64Image, options = {}) {
    // Validazione
    Validator.validateMessage(message);
    Validator.validateBase64Image(base64Image);
    if (options.systemPrompt) {
      Validator.validateSystemPrompt(options.systemPrompt);
    }

    // Costruisci payload con immagine
    const payload = RequestBuilder.buildPayload(
      this.connection.getModel(),
      message,
      { 
        ...options, 
        image: base64Image,
        stream: false 
      }
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