// src/core/Connection.js
import { ConfigLoader } from '../utils/ConfigLoader.js';
import { Validator } from '../utils/Validator.js';

//-------------------------------------------------------------------------------
/*
    🎯 Responsabilità

    > Carica config via ConfigLoader
    > Valida API key
    > Espone info connessione
    > Log conferma connessione
*/
//-------------------------------------------------------------------------------


export class Connection {
  constructor(apiKey, model = null, internal = false) {
    // Carica configurazione
    const config = ConfigLoader.load();
    
    // Valida API key
    Validator.validateApiKey(apiKey, config.apiKey);
    
    if (internal)
    {
      this.host = 'http://192.168.251.67:11434' || config.host;
    }else{
      this.host = config.host;
    }

    this.model = model || config.model;
    this.endpoint = config.endpoint;
    this.timeout = config.timeout;
    this.apiUrl = `${this.host}${this.endpoint}`;
    
    console.log(`🦙 Impostata connesione a: ${this.host} (${this.model})`);
  }

  getApiUrl() {
    return this.apiUrl;
  }

  getModel() {
    return this.model;
  }

  getTimeout() {
    return this.timeout;
  }
}