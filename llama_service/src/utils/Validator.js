// src/utils/Validator.js
export class Validator {
  
  static validateApiKey(apiKey, expectedKey) {
    if (!apiKey) {
      throw new Error("⚠️ API key mancante");
    }
    if (apiKey !== expectedKey) {
      throw new Error("⚠️ API key non valida");
    }
  }

  static validateMessage(message) {
    if (!message || typeof message !== 'string') {
      throw new Error("⚠️ Message deve essere una stringa non vuota");
    }
  }

  static validateSystemPrompt(prompt) {
    if (prompt && typeof prompt !== 'string') {
      throw new Error("⚠️ System prompt deve essere una stringa");
    }
  }

  static validateBase64Image(image) {
    if (!image || typeof image !== 'string') {
      throw new Error("⚠️ Immagine deve essere una stringa base64");
    }
    // Check base64 format (opzionale ma utile)
    if (!/^[A-Za-z0-9+/=]+$/.test(image)) {
      throw new Error("⚠️ Immagine non è in formato base64 valido");
    }
  }

  static validateCallback(callback) {
    if (typeof callback !== 'function') {
      throw new Error("⚠️ Callback deve essere una funzione");
    }
  }
}