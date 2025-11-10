// src/handlers/StreamHandler.js
import fetch from 'node-fetch';
import { Validator } from '../utils/Validator.js';
import { RequestBuilder } from '../core/RequestBuilder.js';
//-------------------------------------------------------------------------------
/*
    🎯 Responsabilità

    ✅ Valida input + callback
    ✅ Costruisce payload streaming
    ✅ Parser NDJSON chunks
    ✅ Callback progressivi + finale
    ✅ Ritorna risposta completa
*/
//-------------------------------------------------------------------------------
export class StreamHandler {
  constructor(connection) {
    this.connection = connection;
  }

  async sendStream(message, options = {}) {
    const { onChunk, ...otherOptions } = options;

    // Validazione
    Validator.validateMessage(message);
    if (otherOptions.systemPrompt) {
      Validator.validateSystemPrompt(otherOptions.systemPrompt);
    }
    if (onChunk) {
      Validator.validateCallback(onChunk);
    }

    // Costruisci payload
    const payload = RequestBuilder.buildPayload(
      this.connection.getModel(),
      message,
      { ...otherOptions, stream: true }
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

      // Gestisci streaming
      let fullResponse = '';

      for await (const chunk of response.body) {
        const chunkStr = chunk.toString();
        const lines = chunkStr.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              const content = json.message.content;
              fullResponse += content;

              // Callback per ogni chunk
              if (onChunk) {
                onChunk({
                  content,
                  fullResponse,
                  isComplete: false
                });
              }
            }
          } catch (parseError) {
            // Ignora righe non JSON
            continue;
          }
        }
      }

      // Callback finale
      if (onChunk) {
        onChunk({
          content: '',
          fullResponse,
          isComplete: true
        });
      }

      return fullResponse;

    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Impossibile connettersi a ${this.connection.host}`);
      }
      throw error;
    }
  }
}