// src/LLMClient.js
import { Connection } from './core/Connection.js';
import { PromptHandler } from './handlers/PromptHandler.js';
import { StreamHandler } from './handlers/StreamHandler.js';
import { ImageHandler } from './handlers/ImageHandler.js';

export class LLMClient {
  constructor(apiKey, model = null) {
    // Inizializza connessione
    this.connection = new Connection(apiKey, model);
    
    // Inizializza handlers
    this.promptHandler = new PromptHandler(this.connection);
    this.streamHandler = new StreamHandler(this.connection);
    this.imageHandler = new ImageHandler(this.connection);
  }

  /**
   * Invia un prompt standard
   * @param {string} message - Il messaggio da inviare
   * @param {Object} options - Opzioni: { systemPrompt, messages }
   * @returns {Promise<string>} - Risposta del modello
   */
  async send(message, options = {}) {
    return await this.promptHandler.send(message, options);
  }

  /**
   * Invia un prompt con streaming
   * @param {string} message - Il messaggio da inviare
   * @param {Object} options - Opzioni: { systemPrompt, messages, onChunk }
   * @returns {Promise<string>} - Risposta completa del modello
   */
  async sendStream(message, options = {}) {
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
    return await this.imageHandler.sendWithImage(message, base64Image, options);
  }
}