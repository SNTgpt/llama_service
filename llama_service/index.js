// index.js - Versione con streaming
import fetch from 'node-fetch';
import 'dotenv/config';

export class LLMClient {
  constructor(apiKey, model = '') {
    // Validation
    if (!apiKey) throw new Error("⚠️ API key mancante");
    
    this.apiKey = apiKey;
    this.host = process.env.LLM_API_HOST;
    this.model = model || process.env.LLM_MODEL;
    
    // Validation configurazione
    if (!this.host) throw new Error("⚠️ Host LLM mancante in .env");
    if (!this.model) throw new Error("⚠️ Model mancante");
    
    if (this.apiKey !== process.env.LLM_API_KEY) {
      throw new Error("⚠️ API key errata");
    }
    
    this.apiUrl = `${this.host}/api/chat`;
  }

  async sendPrompt(message, prompt, stream = false) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error("⚠️ Prompt deve essere una stringa non vuota");
    }

    const body = {
      model: this.model,
      stream: stream,
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

  // Metodo per gestire stream response
  async _handleStreamResponse(response) {
    const chunks = [];
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              chunks.push(json.message.content);
            }
          } catch (parseError) {
            // Ignora righe non JSON nel stream
            continue;
          }
        }
      }
      
      return chunks.join('');
      
    } finally {
      reader.releaseLock();
    }
  }

  // Metodo alternativo specifico per streaming
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

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim());
          
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
        
      } finally {
        reader.releaseLock();
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Impossibile connettersi a ${this.host}`);
      }
      throw error;
    }
  }
}