// index.js - Versione corretta per Node.js
import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// Setup path per ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carica configurazione
const configPath = path.join(__dirname, 'config', 'configuration.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

export class LLMClient {
  constructor(apiKey, model = '') {
    // Validation
    if (!apiKey) throw new Error("⚠️ API key mancante");
    
    this.apiKey = apiKey;
    this.host = config.api.host;
    this.model = model || config.model.default;
    
    // Validation configurazione
    if (!this.host) throw new Error("⚠️ Host LLM mancante in .env");
    if (!this.model) throw new Error("⚠️ Model mancante");
    
    if (this.apiKey !== config.api.key) {
      throw new Error("⚠️ API key errata");
    }
    
    this.apiUrl = `${this.host}${config.endpoints.chat}`;

    console.log(`🦙 LLM Client inizializzato: ${this.host} (${this.model})`);
  }


  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  async sendPrompt(message, prompt,options = {}) {
    const { image = null, stream = false, messages = [] } = options;

    if (!prompt || typeof prompt !== 'string') {
      throw new Error("⚠️ Prompt deve essere una stringa non vuota");
    }

    const body = {
      model: this.model,
      stream: stream,
      messages: messages
    };

    if (prompt) {
      body.messages.push({ role: "system", content: prompt });
    }

      // Messaggio utente (con o senza immagine)
    const userMessage = {
      role: "user",
      content: message
    };

    if (image) {
      userMessage.images = [image];  // deve essere un array
    }

    body.messages.push(userMessage);
    

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`LLM Error ${response.status}: ${text} (${this.host})`);
      }

      // Gestione streaming vs normal response
      if (stream) {
        return this._handleStreamResponse(response);
      } else {
        const json = await response.json();
        return json?.message?.content || "";
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Impossibile connettersi a ${this.host}`);
      }
      throw error;
    }
  }

  // Metodo per gestire stream response - VERSIONE NODE.JS
  async _handleStreamResponse(response) {
    let fullResponse = '';
    
    // Node.js streaming con response.body
    for await (const chunk of response.body) {
      const chunkStr = chunk.toString();
      const lines = chunkStr.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            fullResponse += json.message.content;
          }
        } catch (parseError) {
          // Ignora righe non JSON nel stream
          continue;
        }
      }
    }
    
    return fullResponse;
  }

  // Metodo alternativo specifico per streaming real-time
  async sendPromptStream(message, prompt, onChunk) {
    if (!onChunk || typeof onChunk !== 'function') {
      throw new Error("⚠️ Callback onChunk è richiesta per streaming");
    }

    const body = {
      model: this.model,
      stream: true,
      messages: []
    };

    if (prompt) {
      body.messages.push({ role: "system", content: prompt });
    }

    body.messages.push({ role: "user", content: message });

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`LLM Error ${response.status}: ${text} (${this.host})`);
      }

      let fullResponse = '';
      
      // Node.js streaming
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
              onChunk({
                content,
                fullResponse,
                isComplete: false
              });
            }
          } catch (parseError) {
            continue;
          }
        }
      }
      
      // Callback finale
      onChunk({
        content: '',
        fullResponse,
        isComplete: true
      });
      
      return fullResponse;
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Impossibile connettersi a ${this.host}`);
      }
      throw error;
    }
  }
}