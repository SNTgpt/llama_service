// src/core/RequestBuilder.js
/*
    🎯 Responsabilità

    ✅ Valida input
    ✅ Costruisce payload via RequestBuilder
    ✅ Esegue fetch
    ✅ Gestisce errori connessione
    ✅ Estrae risposta
*/
export class RequestBuilder {
  
  static buildPayload(model, message, options = {}) {
    const { 
      systemPrompt = null, 
      image = null, 
      stream = false,
      messages = [] 
    } = options;

    const payload = {
      model: model,
      stream: stream,
      messages: [...messages]
    };

    // Aggiungi system prompt se presente
    if (systemPrompt) {
      payload.messages.push({
        role: "system",
        content: systemPrompt
      });
    }

    // Costruisci messaggio utente
    const userMessage = {
      role: "user",
      content: message
    };

    // Aggiungi immagine se presente
    if (image) {
      userMessage.images = [image];
    }

    payload.messages.push(userMessage);

    return payload;
  }
}