// src/handlers/ToolHandler.js
import fetch from 'node-fetch';
import { Validator } from '../utils/Validator.js';
import { RequestBuilder } from '../core/RequestBuilder.js';

/*
* ==========================================================================================
🎯 Responsabilità

- Gestisce loop tool calling (max 5 iterazioni default)
- Esegue callback onToolCall per ogni tool
- Mantiene conversazione con risultati tool
- Valida formato tools (OpenAI-compatible)
- Ritorna risposta finale + history tool calls
* ==========================================================================================
*/

export class ToolHandler {
  constructor(connection) {
    this.connection = connection;
  }

  /**
   * Invia prompt con tool calling support
   * @param {string} message - Messaggio da inviare
   * @param {Object} options - { systemPrompt, messages, tools, onToolCall, maxIterations }
   * @returns {Promise<{content: string, toolCalls: Array}>}
   */
  async sendWithTools(message, options = {}) {
    const {
      systemPrompt,
      messages = [],
      tools = [],
      onToolCall,
      maxIterations = 5
    } = options;

    //-Validazione
    Validator.validateMessage(message);
    if (systemPrompt) {
      Validator.validateSystemPrompt(systemPrompt);
    }
    if (tools.length > 0) {
      this._validateTools(tools);
    }
    if (onToolCall) {
      Validator.validateCallback(onToolCall);
    }

    // Conversazione con iterazioni tool
    let conversation = [...messages];
    let iterations = 0;
    const allToolCalls = [];

    // Aggiungi messaggio iniziale
    conversation.push({
      role: 'user',
      content: message
    });

    while (iterations < maxIterations) {
      iterations++;

      // Costruisci payload
      const payload = RequestBuilder.buildPayload(
        this.connection.getModel(),
        '',  // Messaggio vuoto perché usiamo conversation
        {
          systemPrompt: iterations === 1 ? systemPrompt : null,
          messages: conversation,
          tools: tools,
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
        const assistantMessage = json.message;

        // Aggiungi risposta assistant alla conversazione
        conversation.push(assistantMessage);

        // Check se ci sono tool calls
        const toolCalls = assistantMessage.tool_calls || [];

        if (toolCalls.length === 0) {
          // Nessun tool call, ritorna risposta finale
          return {
            content: assistantMessage.content || '',
            toolCalls: allToolCalls,
            iterations
          };
        }

        // Esegui tool calls
        const toolResults = [];
        for (const toolCall of toolCalls) {
          try {
            const result = onToolCall
              ? await onToolCall({
                  name: toolCall.function.name,
                  arguments: JSON.parse(toolCall.function.arguments)
                })
              : { error: 'Tool execution not configured' };

            allToolCalls.push({
              name: toolCall.function.name,
              arguments: toolCall.function.arguments,
              result
            });

            toolResults.push({
              role: 'tool',
              name: toolCall.function.name,
              content: JSON.stringify(result)
            });
          } catch (error) {
            console.error(`❌ Tool execution error: ${error.message}`);
            toolResults.push({
              role: 'tool',
              name: toolCall.function.name,
              content: JSON.stringify({ error: error.message })
            });
          }
        }

        // Aggiungi risultati tool alla conversazione
        conversation.push(...toolResults);

      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error(`Impossibile connettersi a ${this.connection.host}`);
        }
        throw error;
      }
    }

    // Max iterazioni raggiunto
    throw new Error(`Max tool iterations (${maxIterations}) reached`);
  }

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  /**
   * Valida formato tools (OpenAI-compatible)
   */
  _validateTools(tools) {
    if (!Array.isArray(tools)) {
      throw new Error('⚠️ Tools deve essere un array');
    }

    for (const tool of tools) {
      if (tool.type !== 'function') {
        throw new Error('⚠️ Tool type deve essere "function"');
      }
      if (!tool.function?.name) {
        throw new Error('⚠️ Tool deve avere function.name');
      }
      if (!tool.function?.parameters) {
        throw new Error('⚠️ Tool deve avere function.parameters');
      }
    }
  }
}