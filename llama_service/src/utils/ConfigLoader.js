// src/utils/ConfigLoader.js
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ConfigLoader {
  static load() {
    // Carica config.json
    
    const configPath = path.join(__dirname, '../../config/configuration.json');
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    console.log(`✅​ Caricamento configurazione completato`);
    // Override con .env se presenti
    return {
      apiKey: process.env.LLM_API_KEY || config.api.key,
      host: process.env.LLM_API_HOST || config.api.host,
      model: process.env.LLM_MODEL || config.model.default,
      endpoint: config.endpoints.chat,
      timeout: config.api.timeout
    };
  }
}