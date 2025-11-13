// src/LLMClient.js
import { Connection } from './src/core/Connection.js';
import { PromptHandler } from './src/handlers/PromptHandler.js';
import { StreamHandler } from './src/handlers/StreamHandler.js';
import { ImageHandler } from './src/handlers/ImageHandler.js';
import { ToolHandler } from './src/handlers/ToolHandler.js'; 

export class LLMClient {
  constructor(apiKey,internal = false, model = null) {
    // Inizializza connessione
    this.connection = new Connection(apiKey, model, internal);
    console.log(`​🔗​ Connessione ottenuta`);
    
    // Inizializza handlers
    this.promptHandler = new PromptHandler(this.connection);
    this.streamHandler = new StreamHandler(this.connection);
    this.imageHandler = new ImageHandler(this.connection);
    this.toolHandler = new ToolHandler(this.connection);
    console.log(`💽 ​​Handler Configurati`);
  }

  /**
   * Invia un prompt standard
   * @param {string} message - Il messaggio da inviare
   * @param {Object} options - Opzioni: { systemPrompt, messages }
   * @returns {Promise<string>} - Risposta del modello
   */
  async send(message, options = {}) {
    console.log(`Invio messaggio -> {${message}} ...`);
    return await this.promptHandler.send(message, options);
  }

  /**
   * Invia un prompt con streaming
   * @param {string} message - Il messaggio da inviare
   * @param {Object} options - Opzioni: { systemPrompt, messages, onChunk }
   * @returns {Promise<string>} - Risposta completa del modello
   */
  async sendStream(message, options = {}) {
    console.log(`Invio messaggio in stream ... `);
    return await this.streamHandler.sendStream(message, options);
  }

  /**
   * Invia un prompt con immagine base64
   * @param {string} message - Il messaggio da inviare
   * @param {string} base64Image - Immagine in formato base64
   * @param {Object} options - Opzioni: { systemPrompt, messages }
   * @returns {Promise<string>} - Risposta del modello
   */
  async sendWithImage(message, base64Image, options = {}) {
    console.log(`Invio messaggio & immagine  -> {${message}} ... `);
    return await this.imageHandler.sendWithImage(message, base64Image, options);
  }

  /**
   * Invia un prompt con tool calling support
   * @param {string} message - Il messaggio da inviare
   * @param {Object} options - Opzioni: { systemPrompt, messages, tools, onToolCall, maxIterations }
   * @returns {Promise<{content: string, toolCalls: Array, iterations: number}>}
   */
  async sendWithTools(message, options = {}) {
    console.log(`Invio messaggio & esecuzione tools -> {${message}} ... `);
    return await this.toolHandler.sendWithTools(message, options);
  }
}